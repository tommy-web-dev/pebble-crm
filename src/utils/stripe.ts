import { doc, updateDoc, setDoc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import { UserSubscription } from '../types';

export interface StripeSubscription {
    id: string;
    status: 'active' | 'canceled' | 'incomplete' | 'incomplete_expired' | 'past_due' | 'trialing' | 'unpaid';
    current_period_start: number;
    current_period_end: number;
    trial_start?: number;
    trial_end?: number;
    cancel_at_period_end: boolean;
    customer: string;
}



export const handleStripeWebhook = async (event: any) => {
    try {
        switch (event.type) {
            case 'customer.subscription.created':
            case 'customer.subscription.updated':
                await handleSubscriptionChange(event.data.object);
                break;
            case 'customer.subscription.deleted':
                await handleSubscriptionCancellation(event.data.object);
                break;
            case 'invoice.payment_succeeded':
                await handlePaymentSuccess(event.data.object);
                break;
            case 'invoice.payment_failed':
                await handlePaymentFailure(event.data.object);
                break;
        }
    } catch (error) {
        console.error('Error handling Stripe webhook:', error);
        throw error;
    }
};

const handleSubscriptionChange = async (subscription: StripeSubscription) => {
    try {
        // Find user by Stripe customer ID
        const userQuery = await getDoc(doc(db, 'users', subscription.customer));

        if (userQuery.exists()) {
            const userData = userQuery.data();
            const userId = userQuery.id;

            // Update user subscription data
            const subscriptionData: UserSubscription = {
                stripeCustomerId: subscription.customer,
                stripeSubscriptionId: subscription.id,
                status: subscription.status,
                planName: 'Pebble CRM - Professional Plan',
                currentPeriodStart: new Date(subscription.current_period_start * 1000),
                currentPeriodEnd: new Date(subscription.current_period_end * 1000),
                trialStart: subscription.trial_start ? new Date(subscription.trial_start * 1000) : undefined,
                trialEnd: subscription.trial_end ? new Date(subscription.trial_end * 1000) : undefined,
                cancelAtPeriodEnd: subscription.cancel_at_period_end,
                createdAt: new Date(),
                updatedAt: new Date()
            };

            // Update user document with subscription info
            await updateDoc(doc(db, 'users', userId), {
                subscription: subscriptionData,
                updatedAt: new Date()
            });

            console.log(`Updated subscription for user ${userId}:`, subscription.status);
        }
    } catch (error) {
        console.error('Error updating subscription:', error);
        throw error;
    }
};

const handleSubscriptionCancellation = async (subscription: StripeSubscription) => {
    try {
        const userQuery = await getDoc(doc(db, 'users', subscription.customer));

        if (userQuery.exists()) {
            const userId = userQuery.id;

            await updateDoc(doc(db, 'users', userId), {
                'subscription.status': 'canceled',
                'subscription.updatedAt': new Date()
            });

            console.log(`Cancelled subscription for user ${userId}`);
        }
    } catch (error) {
        console.error('Error cancelling subscription:', error);
        throw error;
    }
};

const handlePaymentSuccess = async (invoice: any) => {
    try {
        const userQuery = await getDoc(doc(db, 'users', invoice.customer));

        if (userQuery.exists()) {
            const userId = userQuery.id;

            await updateDoc(doc(db, 'users', userId), {
                'subscription.status': 'active',
                'subscription.updatedAt': new Date()
            });

            console.log(`Payment succeeded for user ${userId}`);
        }
    } catch (error) {
        console.error('Error handling payment success:', error);
        throw error;
    }
};

const handlePaymentFailure = async (invoice: any) => {
    try {
        const userQuery = await getDoc(doc(db, 'users', invoice.customer));

        if (userQuery.exists()) {
            const userId = userQuery.id;

            await updateDoc(doc(db, 'users', userId), {
                'subscription.status': 'past_due',
                'subscription.updatedAt': new Date()
            });

            console.log(`Payment failed for user ${userId}`);
        }
    } catch (error) {
        console.error('Error handling payment failure:', error);
        throw error;
    }
};

export const createStripeCustomer = async (userId: string, email: string, name: string) => {
    try {
        // This would typically be called from your backend
        // For now, we'll just update the user document
        await updateDoc(doc(db, 'users', userId), {
            email,
            name,
            createdAt: new Date(),
            updatedAt: new Date()
        });

        return { success: true };
    } catch (error) {
        console.error('Error creating Stripe customer:', error);
        throw error;
    }
};

// Check if user already has a Stripe subscription by email
export const checkExistingSubscription = async (email: string): Promise<UserSubscription | null> => {
    try {
        // This would typically call your backend to check Stripe
        // For now, we'll check if there's a user document with this email and subscription
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('email', '==', email));
        const querySnapshot = await getDocs(q);

        console.log(`Checking for existing subscription with email: ${email}`);
        console.log(`Found ${querySnapshot.docs.length} user documents with this email`);

        for (const doc of querySnapshot.docs) {
            const userData = doc.data();
            console.log(`Checking user document:`, userData);

            if (userData.subscription && userData.subscription.status) {
                console.log(`Found existing subscription for email: ${email}:`, userData.subscription);
                return userData.subscription as UserSubscription;
            }
        }

        console.log(`No existing subscription found for email: ${email}`);
        return null;
    } catch (error) {
        console.error('Error checking existing subscription:', error);
        return null;
    }
};

export const getSubscriptionStatus = async (userId: string): Promise<UserSubscription | null> => {
    try {
        const userDoc = await getDoc(doc(db, 'users', userId));

        if (!userDoc.exists()) {
            console.warn(`User document not found for userId: ${userId}`);
            return null;
        }

        const userData = userDoc.data();
        console.log(`Checking subscription for user ${userId}:`, userData);

        if (userData.subscription) {
            console.log(`Found subscription in user document:`, userData.subscription);
            return userData.subscription as UserSubscription;
        }

        // No subscription found in current user document
        // Check if there's another user document with the same email that has a subscription
        if (userData.email) {
            console.log(`No subscription found for user ${userId}, checking for existing subscription with email: ${userData.email}`);
            const existingSubscription = await checkExistingSubscription(userData.email);

            if (existingSubscription) {
                console.log(`Found existing subscription for email ${userData.email}, linking to user ${userId}`);

                // Link the existing subscription to this user
                await updateDoc(doc(db, 'users', userId), {
                    subscription: existingSubscription,
                    updatedAt: new Date()
                });

                return existingSubscription;
            }
        }

        // No subscription found - this is normal for new users
        console.log(`No subscription found for user: ${userId}`);
        return null;
    } catch (error) {
        console.error('Error getting subscription status:', error);
        // Don't throw error, just return null to prevent crashes
        return null;
    }
}; 
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

        // No subscription found in Firestore, but user might have one in Stripe
        // This is a fallback for when webhooks haven't properly synced the data
        console.log(`No existing subscription found in Firestore for email: ${email}`);
        console.log(`Note: User might have subscription in Stripe that hasn't been synced to Firestore`);

        return null;
    } catch (error) {
        console.error('Error checking existing subscription:', error);
        return null;
    }
};

/**
 * Gets the current user's subscription status by following the correct Firebase Stripe extension flow.
 * 
 * FLOW:
 * 1. Get the signed-in Firebase user's UID
 * 2. Read from `/customers/{uid}` in Firestore (where Firebase extension stores Stripe data)
 * 3. Extract the Stripe customer ID (`cus_xxxx`) from the customer document
 * 4. Use that Stripe customer ID for all Stripe-related operations
 * 
 * IMPORTANT: Never assume Firebase UID equals Stripe customer ID - they are mapped via Firestore!
 */
export const getSubscriptionStatus = async (userId: string): Promise<UserSubscription | null> => {
    try {
        // STEP 1: Get the current authenticated Firebase user
        const { getAuth } = await import('firebase/auth');
        const auth = getAuth();
        const currentUser = auth.currentUser;

        if (!currentUser) {
            console.warn('No authenticated Firebase user found');
            return null;
        }

        console.log(`🔍 Checking subscription for Firebase user: ${currentUser.uid}`);
        console.log(`📧 User email: ${currentUser.email}`);

        // STEP 2: Read the customer document from `/customers/{uid}` in Firestore
        // This is where the Firebase Stripe extension stores the Stripe customer data
        try {
            const customerDocRef = doc(db, 'customers', currentUser.uid);
            const customerDoc = await getDoc(customerDocRef);

            if (!customerDoc.exists()) {
                console.log(`❌ No customer document found at /customers/${currentUser.uid}`);
                console.log(`💡 This means the user hasn't created a Stripe customer yet`);
                return null;
            }

            const customerData = customerDoc.data();
            console.log(`✅ Found customer document:`, customerData);

            // STEP 3: Extract the Stripe customer ID from the customer document
            // This is the `cus_xxxx` ID that Stripe uses, NOT the Firebase UID
            const stripeCustomerId = customerData.stripeId;
            
            if (!stripeCustomerId) {
                console.log(`❌ No Stripe customer ID found in customer document`);
                return null;
            }

            console.log(`💳 Stripe customer ID: ${stripeCustomerId}`);
            console.log(`🔗 Firebase UID: ${currentUser.uid}`);
            console.log(`📝 Note: These are different IDs - Firebase UID maps to Stripe customer ID via Firestore`);

            // STEP 4: Check the subscriptions sub-collection for active subscriptions
            const subscriptionsRef = collection(db, 'customers', currentUser.uid, 'subscriptions');
            const subscriptionsSnapshot = await getDocs(subscriptionsRef);

            if (subscriptionsSnapshot.empty) {
                console.log(`❌ No subscription documents found in /customers/${currentUser.uid}/subscriptions`);
                return null;
            }

            console.log(`📊 Found ${subscriptionsSnapshot.docs.length} subscription document(s)`);

            // Look for active or trialing subscriptions
            for (const subDoc of subscriptionsSnapshot.docs) {
                const subData = subDoc.data();
                console.log(`📋 Checking subscription:`, subData);
                console.log(`🔍 Available fields:`, Object.keys(subData));
                console.log(`🆔 Subscription ID field:`, subData.id);
                console.log(`📝 Stripe subscription ID field:`, subData.stripeSubscriptionId);

                if (['active', 'trialing'].includes(subData.status)) {
                    console.log(`✅ Found active subscription with status: ${subData.status}`);

                    // STEP 5: Convert Firebase extension format to your app's UserSubscription format
                    // IMPORTANT: Guard against undefined values - Firestore doesn't allow them
                    // Based on Firebase extension structure, use the correct field names
                    const subscriptionData: UserSubscription = {
                        stripeCustomerId: stripeCustomerId, // Use the Stripe customer ID, NOT Firebase UID
                        stripeSubscriptionId: subData.id || null, // Firebase extension uses 'id' field
                        status: subData.status || 'unknown',
                        planName: 'Pebble CRM - Professional Plan', // Default plan name
                        createdAt: subData.created ? new Date(subData.created * 1000) : new Date(), // Stripe timestamp
                        updatedAt: new Date(), // Current time
                        currentPeriodStart: subData.current_period_start ? new Date(subData.current_period_start * 1000) : new Date(),
                        currentPeriodEnd: subData.current_period_end ? new Date(subData.current_period_end * 1000) : new Date(),
                        cancelAtPeriodEnd: subData.cancel_at_period_end || false
                    };

                    console.log(`🎯 Successfully converted to UserSubscription format:`, subscriptionData);

                    // STEP 6: Link this subscription data to the user document for future quick access
                    try {
                        await updateDoc(doc(db, 'users', currentUser.uid), {
                            subscription: subscriptionData,
                            updatedAt: new Date()
                        });
                        console.log(`✅ Linked subscription data to user document`);
                    } catch (linkError) {
                        console.warn(`⚠️ Could not link subscription to user document:`, linkError);
                        // Don't fail the whole operation - subscription data is still valid
                    }

                    return subscriptionData;
                }
            }

            console.log(`❌ No active or trialing subscriptions found`);
            return null;

        } catch (customerError: any) {
            console.error(`❌ Error accessing customer collection:`, customerError);
            
            // Check if this is a permissions issue
            if (customerError.code === 'permission-denied') {
                console.error(`🔒 Permission denied accessing /customers/${currentUser.uid}`);
                console.error(`💡 Check your Firestore security rules for the customers collection`);
            }
            
            return null;
        }

    } catch (error) {
        console.error('❌ Error in getSubscriptionStatus:', error);
        return null;
    }
}; 
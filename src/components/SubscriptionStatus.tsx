import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getSubscriptionStatus } from '../utils/stripe';
import { UserSubscription } from '../types';

const SubscriptionStatus: React.FC = () => {
    const { currentUser } = useAuth();
    const [subscription, setSubscription] = useState<UserSubscription | null>(null);
    const [loading, setLoading] = useState(true);
    const [cancelling, setCancelling] = useState(false);
    const [cancelMessage, setCancelMessage] = useState('');

    useEffect(() => {
        const loadSubscription = async () => {
            if (currentUser) {
                try {
                    const sub = await getSubscriptionStatus(currentUser.uid);
                    setSubscription(sub);
                } catch (error) {
                    console.error('Error loading subscription:', error);
                } finally {
                    setLoading(false);
                }
            }
        };

        loadSubscription();
    }, [currentUser]);

    const handleCancelSubscription = async () => {
        if (!subscription?.stripeSubscriptionId) {
            setCancelMessage('No subscription ID found. Please contact support.');
            return;
        }

        if (!window.confirm('Are you sure you want to cancel your subscription? You will lose access to Pebble CRM at the end of your current billing period.')) {
            return;
        }

        setCancelling(true);
        setCancelMessage('');

        try {
            const response = await fetch('https://pebble-crm.vercel.app/api/cancel-subscription', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    subscriptionId: subscription.stripeSubscriptionId,
                    customerId: subscription.stripeCustomerId
                }),
            });

            const data = await response.json();

            if (data.success) {
                setCancelMessage('Subscription cancelled successfully. You will have access until the end of your current billing period.');
                // Refresh subscription data to show updated status
                if (currentUser) {
                    const updatedSub = await getSubscriptionStatus(currentUser.uid);
                    setSubscription(updatedSub);
                }
            } else {
                setCancelMessage(`Failed to cancel subscription: ${data.error}`);
            }
        } catch (error) {
            console.error('Error cancelling subscription:', error);
            setCancelMessage('An error occurred while cancelling your subscription. Please try again or contact support.');
        } finally {
            setCancelling(false);
        }
    };

    if (loading) {
        return (
            <div className="bg-white rounded-lg shadow p-6">
                <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                    <div className="h-6 bg-gray-200 rounded w-1/2 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
            </div>
        );
    }

    if (!subscription) {
        return (
            <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Subscription Status</h3>
                <p className="text-gray-600 mb-4">No active subscription found.</p>
                <a
                    href="/"
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                    View Plans
                </a>
            </div>
        );
    }

    // Debug: Log the subscription data to see what we're working with
    console.log('Subscription data in SubscriptionStatus:', subscription);
    console.log('Current period dates:', {
        start: subscription.currentPeriodStart,
        end: subscription.currentPeriodEnd,
        startType: typeof subscription.currentPeriodStart,
        endType: typeof subscription.currentPeriodEnd
    });

    // Helper function to safely convert dates (handles Firestore Timestamps and Date objects)
    const safeConvertDate = (dateValue: any): Date | undefined => {
        if (!dateValue) return undefined;

        // If it's already a Date object
        if (dateValue instanceof Date) {
            return dateValue;
        }

        // If it's a Firestore Timestamp
        if (dateValue && typeof dateValue === 'object' && dateValue.toDate) {
            return dateValue.toDate();
        }

        // If it's a number (Unix timestamp)
        if (typeof dateValue === 'number') {
            const date = new Date(dateValue);
            return isNaN(date.getTime()) ? undefined : date;
        }

        // If it's a string, try to parse it
        if (typeof dateValue === 'string') {
            const date = new Date(dateValue);
            return isNaN(date.getTime()) ? undefined : date;
        }

        return undefined;
    };

    // Convert dates safely
    const currentPeriodStart = safeConvertDate(subscription.currentPeriodStart);
    const currentPeriodEnd = safeConvertDate(subscription.currentPeriodEnd);
    const trialStart = safeConvertDate(subscription.trialStart);
    const trialEnd = safeConvertDate(subscription.trialEnd);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active':
            case 'trialing':
                return 'text-green-600 bg-green-100';
            case 'past_due':
            case 'unpaid':
                return 'text-red-600 bg-red-100';
            case 'canceled':
                return 'text-gray-600 bg-gray-100';
            default:
                return 'text-yellow-600 bg-yellow-100';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'active':
                return 'Active';
            case 'trialing':
                return 'Trial';
            case 'past_due':
                return 'Past Due';
            case 'unpaid':
                return 'Unpaid';
            case 'canceled':
                return 'Canceled';
            case 'incomplete':
                return 'Incomplete';
            case 'incomplete_expired':
                return 'Expired';
            default:
                return status;
        }
    };

    const formatDate = (date: Date | undefined) => {
        if (!date || isNaN(date.getTime()) || date.getFullYear() < 2020) {
            return 'Not available';
        }
        return new Intl.DateTimeFormat('en-GB', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        }).format(date);
    };

    const isTrialActive = subscription.status === 'trialing' && trialEnd && new Date() < trialEnd;
    const daysLeftInTrial = trialEnd ? Math.ceil((trialEnd.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 0;

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Subscription Status</h3>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(subscription.status)}`}>
                    {getStatusText(subscription.status)}
                </span>
            </div>

            <div className="space-y-4">
                <div>
                    <p className="text-sm font-medium text-gray-500">Plan</p>
                    <p className="text-gray-900">{subscription.planName}</p>
                </div>

                {isTrialActive && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm font-medium text-blue-800">
                                    Free Trial Active
                                </p>
                                <p className="text-sm text-blue-700">
                                    {daysLeftInTrial} day{daysLeftInTrial !== 1 ? 's' : ''} remaining in your trial
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <p className="text-sm font-medium text-gray-500">Current Period Start</p>
                        <p className="text-gray-900">{formatDate(currentPeriodStart)}</p>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Current Period End</p>
                        <p className="text-gray-900">{formatDate(currentPeriodEnd)}</p>
                    </div>
                </div>

                {trialStart && trialEnd && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Trial Start</p>
                            <p className="text-gray-900">{formatDate(trialStart)}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Trial End</p>
                            <p className="text-gray-900">{formatDate(trialEnd)}</p>
                        </div>
                    </div>
                )}

                {subscription.cancelAtPeriodEnd && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm font-medium text-yellow-800">
                                    Subscription Ending
                                </p>
                                <p className="text-sm text-yellow-700">
                                    Your subscription will end on {formatDate(currentPeriodEnd)}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="mt-6 pt-4 border-t border-gray-200">
                {cancelMessage && (
                    <div className={`mb-4 p-3 rounded-md text-sm ${cancelMessage.includes('successfully')
                        ? 'bg-green-50 text-green-800 border border-green-200'
                        : 'bg-red-50 text-red-800 border border-red-200'
                        }`}>
                        {cancelMessage}
                    </div>
                )}

                {subscription.status === 'active' || subscription.status === 'trialing' ? (
                    <button
                        onClick={handleCancelSubscription}
                        disabled={cancelling}
                        className="inline-flex items-center px-4 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {cancelling ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-red-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Cancelling...
                            </>
                        ) : (
                            <>
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                Cancel Subscription
                            </>
                        )}
                    </button>
                ) : (
                    <p className="text-sm text-gray-500">
                        {subscription.status === 'canceled' ? 'Subscription has been cancelled.' : 'Subscription management not available.'}
                    </p>
                )}
            </div>
        </div>
    );
};

export default SubscriptionStatus; 
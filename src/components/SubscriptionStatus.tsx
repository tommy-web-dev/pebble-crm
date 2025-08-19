import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getSubscriptionStatus } from '../utils/stripe';
import { UserSubscription } from '../types';

const SubscriptionStatus: React.FC = () => {
    const { currentUser } = useAuth();
    const [subscription, setSubscription] = useState<UserSubscription | null>(null);
    const [loading, setLoading] = useState(true);

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

    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat('en-GB', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        }).format(date);
    };

    const isTrialActive = subscription.status === 'trialing' && subscription.trialEnd && new Date() < subscription.trialEnd;
    const daysLeftInTrial = subscription.trialEnd ? Math.ceil((subscription.trialEnd.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 0;

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
                        <p className="text-gray-900">{formatDate(subscription.currentPeriodStart)}</p>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Current Period End</p>
                        <p className="text-gray-900">{formatDate(subscription.currentPeriodEnd)}</p>
                    </div>
                </div>

                {subscription.trialStart && subscription.trialEnd && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Trial Start</p>
                            <p className="text-gray-900">{formatDate(subscription.trialStart)}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Trial End</p>
                            <p className="text-gray-900">{formatDate(subscription.trialEnd)}</p>
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
                                    Your subscription will end on {formatDate(subscription.currentPeriodEnd)}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="mt-6 pt-4 border-t border-gray-200">
                <a
                    href="https://billing.stripe.com/p/login/test_28o01K8vF8mB8cEMM"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                    Manage Billing
                </a>
            </div>
        </div>
    );
};

export default SubscriptionStatus; 
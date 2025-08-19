import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getSubscriptionStatus } from '../utils/stripe';
import { UserSubscription } from '../types';

interface SubscriptionGuardProps {
    children: React.ReactNode;
}

const SubscriptionGuard: React.FC<SubscriptionGuardProps> = ({ children }) => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [subscription, setSubscription] = useState<UserSubscription | null>(null);
    const [loading, setLoading] = useState(true);
    const [retryCount, setRetryCount] = useState(0);

    useEffect(() => {
        const checkSubscription = async () => {
            if (!currentUser) {
                setLoading(false);
                return;
            }

            try {
                const sub = await getSubscriptionStatus(currentUser.uid);
                setSubscription(sub);

                // If no subscription or subscription is not active, redirect to payment
                if (!sub || !['active', 'trialing'].includes(sub.status)) {
                    navigate('/upgrade', { replace: true });
                    return;
                }
            } catch (error) {
                console.error('Error checking subscription:', error);

                // Check if it's a "user not found" error vs other errors
                if (error && typeof error === 'object' && 'message' in error &&
                    typeof error.message === 'string' &&
                    error.message.includes('User document not found') &&
                    retryCount < 3) {
                    // User document doesn't exist yet, wait a bit for it to be created
                    console.log(`User document not found, retry ${retryCount + 1}/3, waiting for creation...`);
                    setRetryCount(prev => prev + 1);
                    setTimeout(() => {
                        checkSubscription();
                    }, 1000); // Wait 1 second and try again
                    return;
                }

                // On other errors, redirect to payment to be safe
                navigate('/upgrade', { replace: true });
                return;
            } finally {
                setLoading(false);
            }
        };

        checkSubscription();
    }, [currentUser, navigate]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-slate-600">Checking subscription...</p>
                </div>
            </div>
        );
    }

    // If no subscription or not active, don't render children
    if (!subscription || !['active', 'trialing'].includes(subscription.status)) {
        return null;
    }

    // Add error boundary
    try {
        return <>{children}</>;
    } catch (error) {
        console.error('Error rendering protected content:', error);
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="text-center">
                    <div className="text-red-600 text-xl mb-4">⚠️ Error Loading CRM</div>
                    <p className="text-slate-600 mb-4">There was an error loading the dashboard.</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        Reload Page
                    </button>
                </div>
            </div>
        );
    }
};

export default SubscriptionGuard; 
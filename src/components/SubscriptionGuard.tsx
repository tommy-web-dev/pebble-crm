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
                // On error, redirect to payment to be safe
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

    return <>{children}</>;
};

export default SubscriptionGuard; 
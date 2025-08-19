import React, { useState, useEffect } from 'react';
import { useAppStore } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';
import { getSubscriptionStatus } from '../utils/stripe';
import { UserSubscription } from '../types';

const Header: React.FC = () => {
    const { sidebarOpen, setSidebarOpen } = useAppStore();
    const { currentUser } = useAuth();
    const [subscription, setSubscription] = useState<UserSubscription | null>(null);

    useEffect(() => {
        const loadSubscription = async () => {
            if (currentUser) {
                try {
                    const sub = await getSubscriptionStatus(currentUser.uid);
                    setSubscription(sub);
                } catch (error) {
                    console.error('Error loading subscription:', error);
                }
            }
        };
        loadSubscription();
    }, [currentUser]);

    return (
        <header className="fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/50 shadow-sm">
            <div className="flex items-center justify-between h-16 px-4 lg:px-6">
                {/* Left side - Mobile menu button */}
                <div className="flex items-center lg:hidden">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="p-2 rounded-lg text-slate-600 hover:text-slate-800 hover:bg-slate-100 transition-all duration-200"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                </div>

                {/* Center - Logo (mobile only) */}
                <div className="flex items-center lg:hidden">
                    <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-slate-700 to-blue-600 rounded-lg flex items-center justify-center shadow-lg">
                            <span className="text-white font-bold text-lg">P</span>
                        </div>
                        <span className="text-xl font-bold bg-gradient-to-r from-slate-700 to-blue-600 bg-clip-text text-transparent">
                            Pebble
                        </span>
                    </div>
                </div>

                {/* Right side - Subscription status and user info */}
                <div className="flex items-center space-x-4">
                    {subscription && (
                        <div className="hidden md:flex items-center space-x-2 px-3 py-1.5 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span>
                                {subscription.status === 'trialing' ? 'Free Trial' : 'Active'}
                            </span>
                        </div>
                    )}
                    {currentUser && (
                        <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-slate-600 to-blue-600 rounded-full flex items-center justify-center">
                                <span className="text-white font-bold text-sm">
                                    {currentUser.displayName?.[0] || currentUser.email?.[0] || 'U'}
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header; 
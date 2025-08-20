import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useAppStore } from '../contexts/AppContext';
import { getSubscriptionStatus } from '../utils/stripe';
import { UserSubscription } from '../types';

const Sidebar: React.FC = () => {
    const { currentUser, logout } = useAuth();
    const { sidebarOpen, setSidebarOpen } = useAppStore();
    const location = useLocation();
    const [subscription, setSubscription] = React.useState<UserSubscription | null>(null);

    // Load subscription status
    React.useEffect(() => {
        const loadSubscription = async () => {
            if (currentUser) {
                try {
                    const sub = await getSubscriptionStatus(currentUser!.uid);
                    setSubscription(sub);
                } catch (error) {
                    console.error('Error loading subscription:', error);
                    setSubscription(null);
                }
            }
        };
        loadSubscription();
    }, [currentUser]);

    const navigation = [
        {
            name: 'KPI Dashboard',
            href: '/dashboard',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
            )
        },
        {
            name: 'Clients',
            href: '/contacts',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
            )
        },
        {
            name: 'Jobs',
            href: '/pipeline',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M9 11h.01" />
                </svg>
            )
        },
        {
            name: 'Settings',
            href: '/settings',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
            )
        },
    ];

    const isActive = (href: string) => location.pathname === href;

    const handleLogout = async () => {
        try {
            await logout();
        } catch (error) {
            console.error('Failed to log out:', error);
        }
    };

    return (
        <>
            {/* Mobile overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white/95 backdrop-blur-md shadow-2xl border-r border-slate-200/50 transform transition-transform duration-300 ease-in-out lg:sticky lg:top-16 lg:h-screen lg:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
                {/* Sidebar Header */}
                <div className="flex items-center justify-between h-16 px-6 border-b border-slate-200/50 bg-gradient-to-r from-slate-50 to-blue-50/30">
                    <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-slate-700 to-blue-600 rounded-lg flex items-center justify-center shadow-lg">
                            <span className="text-white font-bold text-lg">P</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <span className="text-xl font-bold bg-gradient-to-r from-slate-700 to-blue-600 bg-clip-text text-transparent">
                                Pebble
                            </span>
                            {subscription && (
                                <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full border border-green-200">
                                    Active
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Mobile close button */}
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all duration-200"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Navigation */}
                <nav className="mt-6 px-3">
                    <div className="space-y-2">
                        {navigation.map((item) => (
                            <Link
                                key={item.name}
                                to={item.href}
                                onClick={() => setSidebarOpen(false)}
                                className={`
                  group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200
                  ${isActive(item.href)
                                        ? 'bg-gradient-to-r from-slate-100 to-blue-50 text-slate-700 border-r-2 border-blue-500 shadow-sm'
                                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800 hover:shadow-sm'
                                    }
                `}
                            >
                                <span className={`mr-3 transition-all duration-200 ${isActive(item.href)
                                    ? 'text-blue-600'
                                    : 'text-slate-500 group-hover:text-slate-600'
                                    }`}>
                                    {item.icon}
                                </span>
                                {item.name}
                            </Link>
                        ))}
                    </div>
                </nav>

                {/* User Section */}
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-200/50 bg-gradient-to-r from-slate-50 to-blue-50/30">
                    <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-slate-600 to-blue-500 rounded-lg flex items-center justify-center shadow-md">
                            <span className="text-white font-medium text-sm">
                                {currentUser?.displayName?.[0] || currentUser?.email?.[0] || 'U'}
                            </span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-800 truncate">
                                {currentUser?.displayName || 'User'}
                            </p>
                            <p className="text-xs text-slate-500 truncate">
                                {currentUser?.email}
                            </p>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all duration-200"
                            title="Logout"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Sidebar; 
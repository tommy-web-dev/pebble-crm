import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';
import { currencyOptions, phoneFormatOptions } from '../data/settingsData';
import UserProfile from '../components/UserProfile';
import SubscriptionStatus from '../components/SubscriptionStatus';

const Settings: React.FC = () => {
    const { logout } = useAuth();
    const { settings, updateCurrency, updatePhoneFormat } = useSettings();

    const handleLogout = async () => {
        try {
            await logout();
        } catch (error) {
            console.error('Error logging out:', error);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
                <div className="space-y-2">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 bg-clip-text text-transparent">
                        Settings
                    </h1>
                    <p className="text-lg text-slate-600 font-medium">Manage your account and preferences.</p>
                </div>

                {/* User Profile Section */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-8">
                    <div className="flex items-center mb-6">
                        <div className="p-3 rounded-xl bg-gradient-to-br from-slate-100 to-blue-100 text-slate-600 mr-4">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900">User Profile</h3>
                    </div>
                    <UserProfile />
                </div>

                {/* Application Settings */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-8">
                    <div className="flex items-center mb-8">
                        <div className="p-3 rounded-xl bg-gradient-to-br from-purple-100 to-blue-100 text-purple-600 mr-4">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900">Application Settings</h3>
                    </div>

                    {/* Currency Settings */}
                    <div className="mb-8">
                        <h4 className="text-lg font-semibold text-slate-900 mb-6">Currency & Formatting</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-3">
                                    Default Currency
                                </label>
                                <select
                                    value={settings.currency.code}
                                    onChange={(e) => {
                                        const selected = currencyOptions.find(c => c.code === e.target.value);
                                        if (selected) updateCurrency(selected);
                                    }}
                                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm"
                                >
                                    {currencyOptions.map((currency) => (
                                        <option key={currency.code} value={currency.code}>
                                            {currency.symbol} {currency.name} ({currency.code})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-3">
                                    Phone Number Format
                                </label>
                                <select
                                    value={settings.phoneFormat.code}
                                    onChange={(e) => {
                                        const selected = phoneFormatOptions.find(p => p.code === e.target.value);
                                        if (selected) updatePhoneFormat(selected);
                                    }}
                                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm"
                                >
                                    {phoneFormatOptions.map((format) => (
                                        <option key={format.code} value={format.code}>
                                            {format.prefix} {format.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Settings Preview */}
                    <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl p-6 border border-slate-200/50">
                        <h4 className="text-lg font-semibold text-slate-900 mb-4">Settings Preview</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h5 className="text-sm font-medium text-slate-600 mb-2">Currency Example</h5>
                                <div className="bg-white rounded-lg p-3 border border-slate-200">
                                    <span className="text-lg font-semibold text-slate-900">
                                        {settings.currency.symbol}1,234.56
                                    </span>
                                </div>
                            </div>
                            <div>
                                <h5 className="text-sm font-medium text-slate-600 mb-2">Phone Number Example</h5>
                                <div className="bg-white rounded-lg p-3 border border-slate-200">
                                    <span className="text-lg font-semibold text-slate-900">
                                        {settings.phoneFormat.prefix}123 456 7890
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Subscription Status */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-8">
                    <div className="flex items-center mb-6">
                        <div className="p-3 rounded-xl bg-gradient-to-br from-green-100 to-emerald-100 text-green-600 mr-4">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900">Subscription & Billing</h3>
                    </div>
                    <SubscriptionStatus />
                </div>

                {/* Account Actions */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-8">
                    <div className="flex items-center mb-6">
                        <div className="p-3 rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 text-amber-600 mr-4">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900">Account Actions</h3>
                    </div>
                    <div className="space-y-4">
                        <button
                            onClick={handleLogout}
                            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white text-sm font-semibold rounded-xl hover:from-red-600 hover:to-red-700 focus:ring-4 focus:ring-red-500/20 focus:ring-offset-2 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            Sign Out
                        </button>
                    </div>
                </div>

                {/* About Pebble */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-8">
                    <div className="flex items-center mb-6">
                        <div className="p-3 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-600 mr-4">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900">About Pebble</h3>
                    </div>
                    <div className="space-y-4 text-slate-600">
                        <p className="text-lg">
                            Pebble is a modern, lightweight CRM designed for solo professionals and freelancers.
                            Built with simplicity and efficiency in mind, it helps you manage your business relationships,
                            track opportunities, and stay organized.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                            <div className="text-center p-4 bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl border border-slate-200/50">
                                <div className="text-2xl mb-2">🚀</div>
                                <h4 className="font-semibold text-slate-900 mb-1">Fast & Lightweight</h4>
                                <p className="text-sm text-slate-600">Optimized for speed and performance</p>
                            </div>
                            <div className="text-center p-4 bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl border border-slate-200/50">
                                <div className="text-2xl mb-2">📱</div>
                                <h4 className="font-semibold text-slate-900 mb-1">Mobile First</h4>
                                <p className="text-sm text-slate-600">Responsive design for all devices</p>
                            </div>
                            <div className="text-center p-4 bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl border border-slate-200/50">
                                <div className="text-2xl mb-2">🔒</div>
                                <h4 className="font-semibold text-slate-900 mb-1">Secure</h4>
                                <p className="text-sm text-slate-600">Your data is protected and private</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings; 
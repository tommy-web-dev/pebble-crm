import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../contexts/AppContext';
import { useSettings } from '../contexts/SettingsContext';
import { useAuth } from '../contexts/AuthContext';
import { getSubscriptionStatus } from '../utils/stripe';
import { UserSubscription } from '../types';

const Dashboard: React.FC = () => {
    const { contacts, deals, tasks, loading } = useAppStore();
    const { currentUser } = useAuth();
    const { formatCurrency } = useSettings();
    const navigate = useNavigate();
    const [monthlyTarget, setMonthlyTarget] = useState<number>(10000);
    const [subscription, setSubscription] = useState<UserSubscription | null>(null);

    // Load monthly target from localStorage
    useEffect(() => {
        const savedTarget = localStorage.getItem('monthlyTarget');
        if (savedTarget) {
            setMonthlyTarget(parseFloat(savedTarget));
        }
    }, []);

    // Load subscription status
    useEffect(() => {
        const loadSubscription = async () => {
            if (currentUser) {
                try {
                    const sub = await getSubscriptionStatus(currentUser.uid);
                    setSubscription(sub);
                } catch (error) {
                    console.error('Error loading subscription:', error);
                    setSubscription(null); // Ensure subscription is set to null on error
                }
            }
        };
        loadSubscription();
    }, [currentUser]);

    // Save monthly target to localStorage
    const handleTargetChange = (value: number) => {
        setMonthlyTarget(value);
        localStorage.setItem('monthlyTarget', value.toString());
    };

    // Calculate metrics
    const metrics = useMemo(() => {
        const totalContacts = contacts.length;
        const totalDeals = deals.length;
        const totalTasks = tasks.length;
        const completedTasks = tasks.filter(task => task.completed).length;

        // Normalize stage names to handle any case/spelling variations
        const normalizeStage = (stage: string) => {
            const stageLower = stage.toLowerCase();
            if (stageLower.includes('negotiat')) return 'negotiating';
            if (stageLower.includes('lead')) return 'lead';
            if (stageLower.includes('live') || stageLower.includes('opportunity')) return 'live-opportunity';
            if (stageLower.includes('closed') && stageLower.includes('won')) return 'closed-won';
            if (stageLower.includes('closed') && stageLower.includes('lost')) return 'closed-lost';
            return stage; // Return original if no match
        };

        const activeDeals = deals.filter(deal => {
            const normalizedStage = normalizeStage(deal.stage);
            return normalizedStage !== 'closed-won' && normalizedStage !== 'closed-lost';
        }).length;

        const totalPipelineValue = deals
            .filter(deal => {
                const normalizedStage = normalizeStage(deal.stage);
                return normalizedStage !== 'closed-won' && normalizedStage !== 'closed-lost';
            })
            .reduce((sum, deal) => sum + deal.value, 0);

        const closedWonValue = deals
            .filter(deal => {
                const normalizedStage = normalizeStage(deal.stage);
                return normalizedStage === 'closed-won';
            })
            .reduce((sum, deal) => sum + deal.value, 0);

        const liveOpportunities = deals.filter(deal => {
            const normalizedStage = normalizeStage(deal.stage);
            return normalizedStage === 'live-opportunity';
        }).length;

        return {
            totalContacts,
            totalDeals,
            totalTasks,
            completedTasks,
            activeDeals,
            totalPipelineValue,
            closedWonValue,
            liveOpportunities
        };
    }, [contacts, deals, tasks]);

    // Calculate progress percentage
    const progressPercentage = Math.min((metrics.closedWonValue / monthlyTarget) * 100, 100);

    // Get stage breakdown
    const stageBreakdown = useMemo(() => {
        const stages = ['lead', 'negotiating', 'live-opportunity', 'closed-won', 'closed-lost'];
        const stageNames = {
            'lead': 'Lead',
            'negotiating': 'Negotiating',
            'live-opportunity': 'Live Opportunity',
            'closed-won': 'Closed Won',
            'closed-lost': 'Closed Lost'
        };
        const stageColors = {
            'lead': 'from-slate-500 to-slate-600',
            'negotiating': 'from-blue-500 to-blue-600',
            'live-opportunity': 'from-emerald-500 to-emerald-600',
            'closed-won': 'from-green-500 to-green-600',
            'closed-lost': 'from-red-500 to-red-600'
        };

        // Normalize stage names to handle any case/spelling variations
        const normalizeStage = (stage: string) => {
            const stageLower = stage.toLowerCase();
            if (stageLower.includes('negotiat')) return 'negotiating';
            if (stageLower.includes('lead')) return 'lead';
            if (stageLower.includes('live') || stageLower.includes('opportunity')) return 'live-opportunity';
            if (stageLower.includes('closed') && stageLower.includes('won')) return 'closed-won';
            if (stageLower.includes('closed') && stageLower.includes('lost')) return 'closed-lost';
            return stage; // Return original if no match
        };

        return stages.map(stage => {
            const stageDeals = deals.filter(deal => {
                const normalizedStage = normalizeStage(deal.stage);
                return normalizedStage === stage;
            });
            const count = stageDeals.length;
            const value = stageDeals.reduce((sum, deal) => sum + deal.value, 0);

            return {
                stage,
                name: stageNames[stage as keyof typeof stageNames],
                count,
                value,
                color: stageColors[stage as keyof typeof stageColors]
            };
        });
    }, [deals]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                    <div className="space-y-2">
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 bg-clip-text text-transparent">
                            Dashboard
                        </h1>
                        <p className="text-lg text-slate-600 font-medium">Overview of your business performance</p>
                        {loading && (
                            <div className="flex items-center space-x-2 text-blue-600">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                                <span className="text-sm">Loading your data...</span>
                            </div>
                        )}
                    </div>

                    {/* Quick Action Buttons */}
                    <div className="flex items-center space-x-3">
                        <button
                            onClick={() => navigate('/contacts')}
                            className="group inline-flex items-center px-4 py-2 bg-gradient-to-r from-slate-600 to-blue-600 text-white text-sm font-semibold rounded-lg hover:from-slate-700 hover:to-blue-700 focus:ring-4 focus:ring-blue-500/20 focus:ring-offset-2 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
                        >
                            <svg className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            Add Contact
                        </button>

                        <button
                            onClick={() => navigate('/pipeline')}
                            className="group inline-flex items-center px-4 py-2 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white text-sm font-semibold rounded-lg hover:from-emerald-700 hover:to-emerald-800 focus:ring-4 focus:ring-emerald-500/20 focus:ring-offset-2 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
                        >
                            <svg className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                            </svg>
                            Add Opportunity
                        </button>

                        <button
                            onClick={() => navigate('/tasks')}
                            className="group inline-flex items-center px-4 py-2 bg-gradient-to-r from-amber-600 to-orange-600 text-white text-sm font-semibold rounded-lg hover:from-amber-700 hover:to-orange-700 focus:ring-4 focus:ring-amber-500/20 focus:ring-offset-2 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
                        >
                            <svg className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                            </svg>
                            Add Task
                        </button>
                    </div>
                </div>

                {/* Subscription Status Banner */}
                {subscription && (
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                <div>
                                    <p className="text-green-800 font-medium">
                                        {subscription.status === 'trialing' ? 'Free Trial Active' : 'Subscription Active'}
                                    </p>
                                    <p className="text-green-600 text-sm">
                                        {subscription.status === 'trialing'
                                            ? `Trial ends ${subscription.trialEnd ? new Date(subscription.trialEnd).toLocaleDateString() : 'soon'}`
                                            : `Plan: ${subscription.planName}`
                                        }
                                    </p>
                                </div>
                            </div>
                            {subscription.status === 'trialing' && (
                                <button
                                    onClick={() => navigate('/upgrade')}
                                    className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors duration-200"
                                >
                                    Upgrade Now
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {/* No Subscription Banner - for users who need to complete setup */}
                {!subscription && currentUser && (
                    <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                                <div>
                                    <p className="text-amber-800 font-medium">Subscription Setup Required</p>
                                    <p className="text-amber-600 text-sm">
                                        {currentUser.email === 'tom.williams5@gmail.com'
                                            ? 'Your Stripe subscription exists but needs to be linked to your account. Please contact support.'
                                            : 'Welcome to Pebble CRM! Complete your subscription to access all features.'
                                        }
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => navigate('/upgrade')}
                                className="px-4 py-2 bg-amber-600 text-white text-sm font-medium rounded-lg hover:bg-amber-700 transition-colors duration-200"
                            >
                                {currentUser.email === 'tom.williams5@gmail.com' ? 'Contact Support' : 'Complete Setup'}
                            </button>
                        </div>
                    </div>
                )}

                {/* Key Metrics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="group bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-600">Total Contacts</p>
                                <p className="text-3xl font-bold text-slate-900">{metrics.totalContacts}</p>
                            </div>
                            <div className="p-3 bg-gradient-to-br from-slate-100 to-blue-100 rounded-xl">
                                <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="group bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-600">Active Opportunities</p>
                                <p className="text-3xl font-bold text-slate-900">{metrics.activeDeals}</p>
                            </div>
                            <div className="p-3 bg-gradient-to-br from-emerald-100 to-blue-100 rounded-xl">
                                <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="group bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-600">Active Tasks</p>
                                <p className="text-3xl font-bold text-slate-900">{metrics.totalTasks - metrics.completedTasks}</p>
                            </div>
                            <div className="p-3 bg-gradient-to-br from-amber-100 to-orange-100 rounded-xl">
                                <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="group bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-600">Pipeline Value</p>
                                <p className="text-3xl font-bold text-slate-900">{formatCurrency(metrics.totalPipelineValue)}</p>
                                <p className="text-xs text-slate-500 mt-1">{metrics.activeDeals} active opportunities</p>
                            </div>
                            <div className="p-3 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl">
                                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Revenue Target Progress Bar */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-8">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-slate-900">Revenue Target Progress</h2>
                        <div className="flex items-center space-x-4">
                            <label className="text-sm font-medium text-slate-600">Monthly Target:</label>
                            <input
                                type="number"
                                value={monthlyTarget}
                                onChange={(e) => handleTargetChange(parseFloat(e.target.value) || 0)}
                                className="w-32 px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                placeholder="10000"
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-600">Progress: {formatCurrency(metrics.closedWonValue)} / {formatCurrency(monthlyTarget)}</span>
                            <span className="font-semibold text-slate-900">{progressPercentage.toFixed(1)}%</span>
                        </div>

                        <div className="w-full bg-slate-200 rounded-full h-4 overflow-hidden">
                            <div
                                className={`h-full bg-gradient-to-r from-blue-500 to-emerald-500 transition-all duration-500 ease-out ${progressPercentage >= 100 ? 'animate-pulse' : ''
                                    }`}
                                style={{ width: `${progressPercentage}%` }}
                            />
                        </div>

                        <div className="text-sm text-slate-600">
                            Pipeline Potential: {formatCurrency(metrics.totalPipelineValue)}
                        </div>
                    </div>
                </div>

                {/* Pipeline Value by Stage */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-8">
                    <h2 className="text-2xl font-bold text-slate-900 mb-6">Pipeline Value by Stage</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                        {stageBreakdown.map((stage) => (
                            <div key={stage.stage} className="text-center">
                                <div className={`w-full h-3 bg-gradient-to-r ${stage.color} rounded-full mb-3`} />
                                <h3 className="text-sm font-semibold text-slate-700 mb-1">{stage.name}</h3>
                                <p className="text-lg font-bold text-slate-900">{formatCurrency(stage.value)}</p>
                                <p className="text-xs text-slate-500">{stage.count} opportunities</p>
                            </div>
                        ))}
                    </div>
                </div>




            </div>
        </div>
    );
};

export default Dashboard; 
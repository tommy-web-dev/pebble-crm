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

    // Save monthly target to localStorage
    const handleTargetChange = (value: number) => {
        setMonthlyTarget(value);
        localStorage.setItem('monthlyTarget', value.toString());
    };

    // Calculate recruitment metrics
    const metrics = useMemo(() => {
        const totalClients = contacts.length;
        const totalCandidates = contacts.filter(contact =>
            contact.tags && contact.tags.includes('candidate')
        ).length;

        // Count live jobs (opportunities that are not closed)
        const normalizeStage = (stage: string) => {
            const stageLower = stage.toLowerCase();
            if (stageLower.includes('lead')) return 'lead';
            if (stageLower.includes('live') || stageLower.includes('opportunity')) return 'live-opportunity';
            if (stageLower.includes('shortlist')) return 'shortlist-sent';
            if (stageLower.includes('interview')) return 'interview';
            if (stageLower.includes('offer')) return 'offer';
            if (stageLower.includes('placed')) return 'placed';
            return stage;
        };

        const liveJobs = deals.filter(deal => {
            const normalizedStage = normalizeStage(deal.stage);
            return normalizedStage !== 'placed';
        }).length;

        const placements = deals.filter(deal => {
            const normalizedStage = normalizeStage(deal.stage);
            return normalizedStage === 'placed';
        }).length;

        const totalRevenue = deals
            .filter(deal => {
                const normalizedStage = normalizeStage(deal.stage);
                return normalizedStage === 'placed';
            })
            .reduce((sum, deal) => {
                // Calculate fee based on value and fee percentage
                const fee = deal.value && deal.feePercentage
                    ? (deal.value * deal.feePercentage / 100)
                    : 0;
                return sum + fee;
            }, 0);

        return {
            totalClients,
            totalCandidates,
            liveJobs,
            placements,
            totalRevenue
        };
    }, [contacts, deals]);

    // Calculate progress percentage
    const progressPercentage = Math.min((metrics.totalRevenue / monthlyTarget) * 100, 100);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
            <div className="max-w-none mx-auto px-8 sm:px-12 lg:px-16 py-8 space-y-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-slate-900 mb-3">KPI Dashboard</h1>
                    <p className="text-lg text-slate-600">Track your recruitment performance and key metrics</p>
                </div>

                {/* Quick Action Buttons */}
                <div className="flex flex-wrap items-center gap-3">
                    <button
                        onClick={() => navigate('/contacts')}
                        className="group inline-flex items-center px-5 py-3 bg-gradient-to-r from-slate-600 to-blue-600 text-white text-sm font-semibold rounded-xl hover:from-slate-700 hover:to-blue-700 focus:ring-4 focus:ring-blue-500/20 focus:ring-offset-2 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
                    >
                        <svg className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Add Client
                    </button>

                    <button
                        onClick={() => navigate('/jobs')}
                        className="group inline-flex items-center px-5 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white text-sm font-semibold rounded-xl hover:from-purple-700 hover:to-purple-800 focus:ring-4 focus:ring-purple-500/20 focus:ring-offset-2 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
                    >
                        <svg className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M9 11h.01" />
                        </svg>
                        Add Job Order
                    </button>

                    <button
                        onClick={() => navigate('/candidates')}
                        className="group inline-flex items-center px-5 py-3 bg-gradient-to-r from-orange-600 to-orange-700 text-white text-sm font-semibold rounded-xl hover:from-orange-700 hover:to-orange-800 focus:ring-4 focus:ring-orange-500/20 focus:ring-offset-2 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
                    >
                        <svg className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        Add Candidate
                    </button>
                </div>

                                    {/* Key Metrics Cards - Optimised for 4 cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Clients Card */}
                    <div className="group bg-white rounded-2xl shadow-lg border border-slate-200 p-5 hover:shadow-xl transition-all duration-300 transform hover:scale-105 cursor-pointer" onClick={() => navigate('/contacts')}>
                        <div className="flex items-center justify-between mb-3">
                            <div className="p-2.5 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl">
                                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-slate-500">Total</p>
                            </div>
                        </div>
                        <div className="mb-2">
                            <p className="text-2xl font-bold text-slate-900">{metrics.totalClients}</p>
                        </div>
                        <p className="text-sm font-medium text-slate-600">Clients</p>
                        <div className="mt-3 flex items-center text-xs text-slate-500">
                            <span>Click to view</span>
                            <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </div>
                    </div>

                    {/* Jobs Card */}
                    <div className="group bg-white rounded-2xl shadow-lg border border-slate-200 p-5 hover:shadow-xl transition-all duration-300 transform hover:scale-105 cursor-pointer" onClick={() => navigate('/jobs')}>
                        <div className="flex items-center justify-between mb-3">
                            <div className="p-2.5 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl">
                                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M9 11h.01" />
                                </svg>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-slate-500">Live</p>
                            </div>
                        </div>
                        <div className="mb-2">
                            <p className="text-2xl font-bold text-slate-900">{metrics.liveJobs}</p>
                        </div>
                        <p className="text-sm font-medium text-slate-600">Jobs</p>
                        <div className="mt-3 flex items-center text-xs text-slate-500">
                            <span>Click to view</span>
                            <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </div>
                    </div>

                    {/* Placements Card */}
                    <div className="group bg-white rounded-2xl shadow-lg border border-slate-200 p-5 hover:shadow-xl transition-all duration-300 transform hover:scale-105 cursor-pointer" onClick={() => navigate('/jobs')}>
                        <div className="flex items-center justify-between mb-3">
                            <div className="p-2.5 bg-gradient-to-br from-green-100 to-green-200 rounded-xl">
                                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-slate-500">Total</p>
                            </div>
                        </div>
                        <div className="mb-2">
                            <p className="text-2xl font-bold text-slate-900">{metrics.placements}</p>
                        </div>
                        <p className="text-sm font-medium text-slate-600">Placements</p>
                        <div className="mt-3 flex items-center text-xs text-slate-500">
                            <span>Click to view</span>
                            <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </div>
                    </div>

                    {/* Total Revenue Card */}
                    <div className="group bg-white rounded-2xl shadow-lg border border-slate-200 p-5 hover:shadow-xl transition-all duration-300 transform hover:scale-105 cursor-pointer" onClick={() => navigate('/jobs')}>
                        <div className="flex items-center justify-between mb-3">
                            <div className="p-2.5 bg-gradient-to-br from-amber-100 to-amber-200 rounded-xl">
                                <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                </svg>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-slate-500">Total</p>
                            </div>
                        </div>
                        <div className="mb-2">
                            <p className="text-2xl font-bold text-slate-900">{formatCurrency(metrics.totalRevenue)}</p>
                        </div>
                        <p className="text-sm font-medium text-slate-600">Total Fees</p>
                        <div className="mt-3 flex items-center text-xs text-slate-500">
                            <span>Click to view</span>
                            <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Revenue Target Progress Bar */}
                <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900 mb-2">Revenue Target Progress</h2>
                            <p className="text-slate-600">Track your progress towards your monthly revenue goal</p>
                        </div>
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
                            <span className="text-slate-600">Progress: {formatCurrency(metrics.totalRevenue)} / {formatCurrency(monthlyTarget)}</span>
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
                            {progressPercentage >= 100 ? (
                                <span className="text-green-600 font-medium">🎉 Target achieved! Great work!</span>
                            ) : (
                                <span>Target remaining: {formatCurrency(monthlyTarget - metrics.totalRevenue)}</span>
                            )}
                        </div>
                    </div>
                </div>


            </div>
        </div>
    );
};

export default Dashboard; 
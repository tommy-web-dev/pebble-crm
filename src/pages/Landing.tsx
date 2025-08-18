import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { redirectToStripeCheckout } from '../utils/stripeCheckout';

const Landing: React.FC = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();

    // Don't auto-redirect - let users choose to stay on landing page or go to dashboard

    const features = [
        {
            icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
            ),
            title: "Smart Contact Management",
            description: "Organize your business relationships with intelligent tagging, notes, and interaction history.",
            color: "from-blue-500 to-blue-600"
        },
        {
            icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
            ),
            title: "Pipeline Tracking",
            description: "Visualize your sales process with our intuitive Kanban board for opportunity management.",
            color: "from-emerald-500 to-emerald-600"
        },
        {
            icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
            ),
            title: "Task Management",
            description: "Stay organized with follow-up reminders, task tracking, and deadline management.",
            color: "from-amber-500 to-amber-600"
        },
        {
            icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
            ),
            title: "Real-time Dashboard",
            description: "Get instant insights into your business performance with live metrics and analytics.",
            color: "from-purple-500 to-purple-600"
        },
        {
            icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
            ),
            title: "Mobile First",
            description: "Access your CRM anywhere with our responsive design that works perfectly on all devices.",
            color: "from-indigo-500 to-indigo-600"
        },
        {
            icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
            ),
            title: "Secure & Private",
            description: "Your data is protected with enterprise-grade security and complete privacy control.",
            color: "from-red-500 to-red-600"
        }
    ];

    const pricingPlans = [
        {
            name: "Starter",
            price: { monthly: 0, yearly: 0 },
            description: "Perfect for solo professionals getting started",
            features: [
                "Up to 100 contacts",
                "Basic pipeline management",
                "Task tracking",
                "Mobile responsive",
                "Email support"
            ],
            popular: false,
            cta: "Start Free Trial!",
            color: "from-slate-500 to-slate-600"
        },
        {
            name: "Professional",
            price: { monthly: 19, yearly: 190 },
            description: "Ideal for growing freelancers and consultants",
            features: [
                "Unlimited contacts",
                "Advanced pipeline analytics",
                "Custom tags & categories",
                "Interaction history",
                "Priority support",
                "Data export"
            ],
            popular: true,
            cta: "Start Free Trial",
            color: "from-blue-500 to-blue-600"
        },
        {
            name: "Business",
            price: { monthly: 49, yearly: 490 },
            description: "For established professionals and small teams",
            features: [
                "Everything in Professional",
                "Team collaboration",
                "Advanced reporting",
                "API access",
                "White-label options",
                "Dedicated support"
            ],
            popular: false,
            cta: "Contact Sales",
            color: "from-emerald-500 to-emerald-600"
        }
    ];

    const faqs = [
        {
            question: "Why don't you offer a free trial or free model?",
            answer: "This is something we may consider in the future, but for now we will only offer the paid model."
        },
        {
            question: "Can I import my existing contacts?",
            answer: "No, this is not possible in the current version, but is one of our priority features to implement as we continue to develop Pebble."
        },
        {
            question: "Is my data secure?",
            answer: "Security is our top priority. We use enterprise-grade encryption, regular backups, and comply with industry security standards."
        },
        {
            question: "Can I cancel anytime?",
            answer: "Yes, you can cancel your subscription at any time. There are no long-term contracts or hidden fees."
        },
        {
            question: "What kind of support do you provide?",
            answer: "We offer email support for all users via our Support email that can be found within the CRM 'Settings' tab."
        }
    ];

    const handleCheckout = async (interval: 'monthly' | 'yearly') => {
        try {
            console.log('Starting Stripe checkout...', { interval });
            const result = await redirectToStripeCheckout({ interval });
            console.log('Checkout result:', result);
        } catch (error) {
            console.error('Checkout error:', error);
            // Fallback to login page
            navigate('/login');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
            {/* Navigation */}
            <nav className="bg-white/95 backdrop-blur-md border-b border-slate-200/50 shadow-sm sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-slate-700 to-blue-600 rounded-lg flex items-center justify-center shadow-lg">
                                <span className="text-white font-bold text-lg">P</span>
                            </div>
                            <span className="text-xl font-bold bg-gradient-to-r from-slate-700 to-blue-600 bg-clip-text text-transparent">
                                Pebble
                            </span>
                        </div>
                        <div className="flex items-center space-x-4">
                            {currentUser ? (
                                <>
                                    <Link
                                        to="/dashboard"
                                        className="text-slate-600 hover:text-slate-900 font-medium transition-colors duration-200"
                                    >
                                        Go to Dashboard
                                    </Link>
                                    <Link
                                        to="/dashboard"
                                        className="px-4 py-2 bg-gradient-to-r from-slate-600 to-blue-600 text-white text-sm font-semibold rounded-lg hover:from-slate-700 hover:to-blue-700 focus:ring-4 focus:ring-blue-500/20 focus:ring-offset-2 transition-all duration-200"
                                    >
                                        Open CRM
                                    </Link>
                                </>
                            ) : (
                                <>
                                    <Link
                                        to="/login"
                                        className="text-slate-600 hover:text-slate-900 font-medium transition-colors duration-200"
                                    >
                                        Sign In
                                    </Link>
                                    <button
                                        onClick={() => handleCheckout('monthly')}
                                        className="px-4 py-2 bg-gradient-to-r from-slate-600 to-blue-600 text-sm font-semibold rounded-lg hover:from-slate-700 hover:to-blue-700 focus:ring-4 focus:ring-blue-500/20 focus:ring-offset-2 transition-all duration-200"
                                    >
                                        Start Free Trial!
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="pt-20 pb-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
                {/* Background decoration */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full opacity-20 blur-3xl"></div>
                    <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full opacity-20 blur-3xl"></div>
                </div>

                <div className="max-w-7xl mx-auto text-center relative z-10">
                    <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-full text-blue-700 text-sm font-medium mb-8">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse"></span>
                        New: Advanced Pipeline Analytics
                    </div>

                    <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 bg-clip-text text-transparent mb-6 leading-tight">
                        The CRM Built for
                        <span className="block bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                            Solo Professionals
                        </span>
                    </h1>

                    <p className="text-xl md:text-2xl text-slate-600 mb-8 max-w-3xl mx-auto leading-relaxed">
                        Lightweight, modern, and designed specifically for freelancers and independent consultants.
                        Start with a 7-day free trial and manage your business relationships without the complexity.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4 mb-12">
                        <button
                            onClick={() => handleCheckout('monthly')}
                            className="group px-8 py-4 bg-gradient-to-r from-slate-600 to-blue-600 text-white text-lg font-semibold rounded-xl hover:from-slate-700 hover:to-blue-700 focus:ring-4 focus:ring-blue-500/20 focus:ring-offset-2 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
                        >
                            <span className="flex items-center">
                                Start Free Trial!
                                <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                            </span>
                        </button>
                    </div>

                    {/* Social proof */}
                    <div className="flex items-center justify-center space-x-8 text-sm text-slate-500">
                        <div className="flex items-center">
                            <div className="flex -space-x-2 mr-3">
                                {['👤', '👤', '👤', '👤'].map((emoji, i) => (
                                    <div key={i} className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center text-sm">
                                        {emoji}
                                    </div>
                                ))}
                            </div>
                            <span>Join other Solo Professionals and Freelancers using Pebble!</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
                            Everything You Need, Nothing You Don't
                        </h2>
                        <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
                            Pebble combines powerful CRM functionality with elegant simplicity,
                            giving you the tools to grow your business without the overwhelm.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {features.map((feature, index) => (
                            <div key={index} className="group bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-8 hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1">
                                <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform duration-300`}>
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl font-semibold text-slate-900 mb-3">{feature.title}</h3>
                                <p className="text-slate-600 leading-relaxed">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white/50 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 to-indigo-50/30"></div>
                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
                            Start Your Free Trial in Minutes
                        </h2>
                        <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
                            Setting up Pebble is as simple as it gets. No complex configurations,
                            no steep learning curves.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {[
                            { step: 1, title: "Start Free Trial", description: "Create your account in seconds", icon: "🚀" },
                            { step: 2, title: "Build Your Business!", description: "Begin adding contacts, managing tasks, and tracking opportunities!", icon: "📈" }
                        ].map((item, index) => (
                            <div key={index} className="text-center group">
                                <div className="relative">
                                    <div className="w-20 h-20 bg-gradient-to-br from-slate-600 to-blue-500 rounded-full flex items-center justify-center text-white text-3xl font-bold mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 relative overflow-hidden">
                                        <span className="relative z-10 font-extrabold tracking-wider">{item.step}</span>
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent transform -rotate-45 w-full h-1"></div>
                                    </div>
                                </div>
                                <h3 className="text-xl font-semibold text-slate-900 mb-3">{item.title}</h3>
                                <p className="text-slate-600 leading-relaxed">{item.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 bg-white/50">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
                            Simple, Transparent Pricing
                        </h2>
                        <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
                            Start with a 7-day free trial. No commitment, cancel anytime.
                        </p>


                    </div>

                    <div className="flex justify-center">
                        <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border-2 border-blue-500 shadow-blue-100 p-8 w-full max-w-md">
                            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                                <span className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-2 rounded-full text-sm font-semibold shadow-lg">
                                    Professional Plan
                                </span>
                            </div>

                            <div className="text-center">
                                <h3 className="text-2xl font-bold text-slate-900 mb-2">Professional</h3>
                                <p className="text-slate-600 mb-6">Everything you need to grow your business</p>

                                <div className="mb-8">
                                    <span className="text-4xl font-bold text-slate-900">
                                        £5
                                    </span>
                                    <span className="text-slate-600">
                                        /month
                                    </span>
                                </div>

                                <ul className="space-y-3 mb-8 text-left">
                                    {[
                                        "Unlimited contacts",
                                        "Advanced pipeline analytics",
                                        "Custom tags & categories",
                                        "Interaction history",
                                        "Priority support",
                                        "Mobile responsive",
                                        "Real-time dashboard"
                                    ].map((feature, featureIndex) => (
                                        <li key={featureIndex} className="flex items-center">
                                            <svg className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            {feature}
                                        </li>
                                    ))}
                                </ul>

                                <button
                                    onClick={() => handleCheckout('monthly')}
                                    className="w-full px-6 py-3 bg-gradient-to-r from-slate-600 to-blue-600 text-white rounded-xl font-semibold hover:from-slate-700 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all duration-200"
                                >
                                    Start Free Trial!
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section id="faq" className="py-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
                            Frequently Asked Questions
                        </h2>
                        <p className="text-xl text-slate-600">
                            Everything you need to know about Pebble
                        </p>
                    </div>

                    <div className="space-y-6">
                        {faqs.map((faq, index) => (
                            <div key={index} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-8 hover:shadow-lg transition-all duration-200">
                                <h3 className="text-lg font-semibold text-slate-900 mb-3">{faq.question}</h3>
                                <p className="text-slate-600 leading-relaxed">{faq.answer}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Final CTA Section */}
            <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-900 to-blue-900 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-slate-900/90 to-blue-900/90"></div>
                <div className="max-w-4xl mx-auto text-center relative z-10">
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                        Ready to start building your business?
                    </h2>
                    <p className="text-xl text-slate-200 mb-8 leading-relaxed">
                        Join other Solo Professionals & Freelancers using Pebble.
                    </p>
                    <button
                        onClick={() => handleCheckout('monthly')}
                        className="inline-block px-8 py-4 bg-gradient-to-r from-white to-slate-100 text-slate-900 text-lg font-semibold rounded-xl hover:from-slate-100 hover:to-white focus:ring-4 focus:ring-white/20 focus:ring-offset-2 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
                    >
                        Start Free Trial!
                    </button>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-slate-900 text-white py-16 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
                        <div className="col-span-1 md:col-span-2">
                            <div className="flex items-center space-x-3 mb-6">
                                <div className="w-8 h-8 bg-gradient-to-br from-slate-600 to-blue-500 rounded-lg flex items-center justify-center">
                                    <span className="text-white font-bold text-lg">P</span>
                                </div>
                                <span className="text-2xl font-bold text-white">Pebble</span>
                            </div>
                            <p className="text-slate-300 max-w-md leading-relaxed">
                                The modern CRM built for Solo Professionals and Freelancers. Simple, powerful, and designed to help you grow your business.
                            </p>
                        </div>
                        {/* Social & Product */}
                        <div>
                            <h3 className="text-lg font-semibold mb-4">Product</h3>
                            <ul className="space-y-2">
                                <li>
                                    <button
                                        onClick={() => {
                                            document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
                                        }}
                                        className="text-slate-300 hover:text-white transition-colors duration-200"
                                    >
                                        Features
                                    </button>
                                </li>
                                <li>
                                    <button
                                        onClick={() => {
                                            document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
                                        }}
                                        className="text-slate-300 hover:text-white transition-colors duration-200"
                                    >
                                        Pricing
                                    </button>
                                </li>
                                <li>
                                    <Link to="/login" className="text-slate-300 hover:text-white transition-colors duration-200">
                                        Sign In
                                    </Link>
                                </li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold mb-4">Company</h3>
                            <ul className="space-y-2">
                                <li>
                                    <Link to="/privacy" className="text-slate-300 hover:text-white transition-colors duration-200">
                                        Privacy Policy
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/terms" className="text-slate-300 hover:text-white transition-colors duration-200">
                                        Terms & Conditions
                                    </Link>
                                </li>
                                <li>
                                    <button
                                        onClick={() => {
                                            document.getElementById('faq')?.scrollIntoView({ behavior: 'smooth' });
                                        }}
                                        className="text-slate-300 hover:text-white transition-colors duration-200"
                                    >
                                        FAQ
                                    </button>
                                </li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-slate-700 pt-8 text-center">
                        <p className="text-slate-400">
                            © 2025 Pebble. All rights reserved.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Landing; 
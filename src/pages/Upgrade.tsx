import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { redirectToStripeCheckout } from '../utils/stripeCheckout';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

const Upgrade: React.FC = () => {
    const { currentUser } = useAuth();

    const handleStartTrial = () => {
        redirectToStripeCheckout({ interval: 'monthly' });
    };

    const handleCreateUserDocument = async () => {
        if (!currentUser) return;

        try {
            await setDoc(doc(db, 'users', currentUser.uid), {
                uid: currentUser.uid,
                email: currentUser.email,
                displayName: currentUser.displayName,
                photoURL: currentUser.photoURL,
                createdAt: new Date(),
                updatedAt: new Date(),
                subscription: null
            });

            alert('User document created! Now redirecting to payment...');
            // Redirect to Stripe checkout
            setTimeout(() => {
                redirectToStripeCheckout({ interval: 'monthly' });
            }, 1000);
        } catch (error) {
            console.error('Error creating user document:', error);
            alert('Error creating user document. Please try again.');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center px-4">
            <div className="max-w-2xl w-full text-center">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
                        Upgrade Required
                    </h1>
                    <p className="text-xl text-slate-600">
                        To access Pebble CRM, you need an active subscription
                    </p>
                </div>

                {/* Current User Info */}
                {currentUser && (
                    <div className="bg-white rounded-xl p-6 mb-8 shadow-lg">
                        <div className="flex items-center justify-center mb-4">
                            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                                <span className="text-2xl font-bold text-blue-600">
                                    {currentUser.displayName?.[0] || currentUser.email?.[0] || 'U'}
                                </span>
                            </div>
                        </div>
                        <p className="text-slate-700 mb-2">
                            <strong>Signed in as:</strong> {currentUser.email}
                        </p>
                        <p className="text-sm text-slate-500">
                            You're logged in! Now let's get you set up with a subscription
                        </p>
                    </div>
                )}

                {/* Pricing Card */}
                <div className="bg-white rounded-2xl p-8 shadow-xl border border-slate-200 mb-8">
                    <div className="mb-6">
                        <h2 className="text-3xl font-bold text-slate-900 mb-2">
                            Professional Plan
                        </h2>
                        <p className="text-slate-600">
                            Everything you need to manage your customer relationships
                        </p>
                    </div>

                    <div className="mb-6">
                        <div className="text-4xl font-bold text-slate-900 mb-2">
                            £5<span className="text-lg text-slate-500">/month</span>
                        </div>
                        <p className="text-slate-600">
                            Start with a <strong>7-day free trial</strong>
                        </p>
                    </div>

                    <div className="mb-8">
                        <ul className="text-left space-y-3">
                            <li className="flex items-center">
                                <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Unlimited contacts, opportunities, and tasks
                            </li>
                            <li className="flex items-center">
                                <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Pipeline management and analytics
                            </li>
                            <li className="flex items-center">
                                <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Email support with 48-hour response
                            </li>
                            <li className="flex items-center">
                                <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Cancel anytime, no long-term commitment
                            </li>
                        </ul>
                    </div>

                    <button
                        onClick={handleStartTrial}
                        className="w-full bg-gradient-to-r from-slate-600 to-blue-600 text-white text-lg font-semibold py-4 px-8 rounded-xl hover:from-slate-700 hover:to-blue-700 focus:ring-4 focus:ring-blue-500/20 focus:ring-offset-2 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
                    >
                        {currentUser ? 'Continue to Payment' : 'Start Free Trial'}
                    </button>
                </div>

                {/* Footer */}
                <div className="text-slate-500">
                    <p className="mb-2">
                        Already have a subscription?{' '}
                        <Link to="/dashboard" className="text-blue-600 hover:text-blue-800 underline">
                            Go to Dashboard
                        </Link>
                    </p>
                    <p className="mb-4">
                        Need help? Contact us at{' '}
                        <a href="mailto:support@pebblecrm.app" className="text-blue-600 hover:text-blue-800 underline">
                            support@pebblecrm.app
                        </a>
                    </p>

                    {/* Manual User Document Creation */}
                    <div className="border-t border-slate-200 pt-4">
                        <p className="text-sm text-slate-600 mb-2">
                            Having trouble? Try manually creating your user profile:
                        </p>
                        <button
                            onClick={handleCreateUserDocument}
                            className="px-4 py-2 bg-slate-600 text-white text-sm font-medium rounded-lg hover:bg-slate-700 transition-colors duration-200"
                        >
                            Create Profile & Continue to Payment
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Upgrade; 
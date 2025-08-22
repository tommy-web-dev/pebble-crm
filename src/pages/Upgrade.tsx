import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';


const Upgrade: React.FC = () => {
    const { currentUser } = useAuth();

    const handleStartTrial = async () => {
                try {
            // Import Firebase Firestore
            const { collection, addDoc, onSnapshot } = await import('firebase/firestore');
            const { db } = await import('../config/firebase');

            if (!currentUser?.uid) {
                throw new Error('No user ID available');
            }

            // Create a checkout session document in Firestore
            const docRef = await addDoc(
                collection(db, 'customers', currentUser.uid, 'checkout_sessions'),
                {
                    price: 'price_1RyXPmJp0yoFovcOJtEC5hyt', // Your actual Stripe price ID
                    success_url: `${window.location.origin}/dashboard`,
                    cancel_url: `${window.location.origin}/upgrade`,
                                            trial_period_days: 30, // Explicitly set 30-day trial
                    metadata: {
                        userId: currentUser.uid
                    }
                }
            );

            console.log('Checkout session document created:', docRef.id);

            // Listen for the checkout session to be updated by the extension
            const unsubscribe = onSnapshot(docRef, (snap) => {
                const { error, url } = snap.data() || {};
                
                if (error) {
                    console.error('Checkout session error:', error);
                    alert(`An error occurred: ${error.message}`);
                    unsubscribe();
                    return;
                }
                
                if (url) {
                    console.log('Checkout URL received:', url);
                    unsubscribe(); // Stop listening
                    window.location.href = url; // Redirect to Stripe
                }
            });

            // Set a timeout in case the extension doesn't respond
            setTimeout(() => {
                unsubscribe();
                alert('Checkout session creation timed out. Please try again.');
            }, 30000); // 30 second timeout

        } catch (error) {
            console.error('Checkout session error:', error);
            alert('Failed to create checkout session. Please try again.');
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
                            £9<span className="text-lg text-slate-500">/month</span>
                        </div>
                        <p className="text-slate-600">
                            Start with a <strong>30-day free trial</strong>
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


                </div>
            </div>
        </div>
    );
};

export default Upgrade; 
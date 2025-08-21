import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const PaymentSuccess: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { currentUser } = useAuth();
    const [countdown, setCountdown] = useState(5);

    useEffect(() => {
        // Auto-redirect to dashboard after 5 seconds
        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    navigate('/dashboard');
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [navigate]);

    const handleGoToDashboard = () => {
        navigate('/dashboard');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 flex items-center justify-center px-4">
            <div className="max-w-md w-full text-center">
                {/* Success Icon */}
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                </div>

                {/* Success Message */}
                <h1 className="text-3xl font-bold text-slate-900 mb-4">
                    Payment Successful!
                </h1>
                
                <p className="text-lg text-slate-600 mb-6">
                    Welcome to Pebble CRM! Your 30-day free trial has started.
                </p>

                {/* Account Details */}
                {currentUser && (
                    <div className="bg-white rounded-xl p-6 shadow-lg border border-slate-200 mb-8">
                        <h2 className="text-lg font-semibold text-slate-900 mb-3">Account Details</h2>
                        <div className="text-left space-y-2">
                            <p className="text-sm text-slate-600">
                                <span className="font-medium">Name:</span> {currentUser.displayName}
                            </p>
                            <p className="text-sm text-slate-600">
                                <span className="font-medium">Email:</span> {currentUser.email}
                            </p>
                            <p className="text-sm text-slate-600">
                                <span className="font-medium">Plan:</span> Professional
                            </p>
                            <p className="text-sm text-slate-600">
                                <span className="font-medium">Trial:</span> 30 days free
                            </p>
                        </div>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="space-y-4">
                    <button
                        onClick={handleGoToDashboard}
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold py-3 px-6 rounded-xl hover:from-blue-700 hover:to-indigo-700 focus:ring-4 focus:ring-blue-500/20 focus:ring-offset-2 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
                    >
                        Go to Dashboard
                    </button>
                    
                    <p className="text-sm text-slate-500">
                        Redirecting automatically in {countdown} seconds...
                    </p>
                </div>

                {/* Additional Info */}
                <div className="mt-8 text-sm text-slate-500">
                    <p>You'll receive a confirmation email shortly.</p>
                    <p>Need help? Contact us at{' '}
                        <a href="mailto:support@pebblecrm.app" className="text-blue-600 hover:text-blue-800 underline">
                            support@pebblecrm.app
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PaymentSuccess;

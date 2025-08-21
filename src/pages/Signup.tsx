import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { checkExistingSubscription } from '../utils/stripe';

const Signup: React.FC = () => {
    const { signup } = useAuth();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        displayName: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        // Validation
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters');
            setLoading(false);
            return;
        }

        try {
            // Check if user already has a subscription
            const existingSubscription = await checkExistingSubscription(formData.email);

            if (existingSubscription && ['active', 'trialing'].includes(existingSubscription.status)) {
                // User already has an active subscription, redirect to dashboard
                setError('');
                setLoading(false);
                setError('Account created! Redirecting to your existing subscription...');
                setTimeout(() => {
                    navigate('/dashboard');
                }, 2000);
                return;
            }

            // Create user account
            await signup(formData.email, formData.password, formData.displayName);

            // Show success message and wait a moment for Firebase auth to complete
            setError('');
            setLoading(false);
            setError('Account created! Setting up your free trial...');

            // Add a timeout fallback in case Stripe redirect takes too long
            const redirectTimeout = setTimeout(() => {
                console.log('Stripe redirect timeout - redirecting to upgrade page as fallback');
                setError('Redirecting to upgrade page...');
                navigate('/upgrade');
            }, 10000); // 10 second timeout

            // Wait a moment for Firebase auth to complete, then redirect
            setTimeout(async () => {
                try {
                    console.log('Account created successfully! Redirecting to Stripe Payment Link...');

                    // Go directly to Stripe Payment Link
                    window.location.href = 'https://buy.stripe.com/28E9AUcYu3uC8vjavQfjG01';

                    // Clear timeout if redirect succeeds
                    clearTimeout(redirectTimeout);
                } catch (error) {
                    console.error('Redirect error:', error);
                    // Clear timeout
                    clearTimeout(redirectTimeout);
                    // If redirect fails, redirect to upgrade page as fallback
                    setError('Redirecting to upgrade page...');
                    setTimeout(() => {
                        navigate('/upgrade');
                    }, 1000);
                }
            }, 2000); // Increased delay to ensure Firebase auth is complete

            // Fallback timeout - if nothing happens within 10 seconds, redirect to upgrade
            setTimeout(() => {
                if (!loading) {
                    console.log('Fallback timeout reached, redirecting to upgrade page');
                    setError('Taking you to the upgrade page...');
                    navigate('/upgrade');
                }
            }, 10000);

        } catch (error: any) {
            console.error('Signup error:', error);
            setError(error.message || 'Failed to create account');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center px-4">
            <div className="max-w-md w-full">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="flex items-center justify-center mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-slate-700 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                            <span className="text-white font-bold text-xl">P</span>
                        </div>
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">
                        Start Your Free Trial
                    </h1>
                    <p className="text-slate-600">
                        Create your account and start 30-day free trial!
                    </p>
                </div>

                {/* Signup Form */}
                <div className="bg-white rounded-2xl p-8 shadow-xl border border-slate-200">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Display Name */}
                        <div>
                            <label htmlFor="displayName" className="block text-sm font-medium text-slate-700 mb-2">
                                Full Name
                            </label>
                            <input
                                type="text"
                                id="displayName"
                                name="displayName"
                                value={formData.displayName}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                                placeholder="Enter your full name"
                            />
                        </div>

                        {/* Email */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                                Email Address
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                                placeholder="Enter your email"
                            />
                        </div>

                        {/* Password */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
                                Password
                            </label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                                placeholder="Create a password"
                            />
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 mb-2">
                                Confirm Password
                            </label>
                            <input
                                type="password"
                                id="confirmPassword"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                                placeholder="Confirm your password"
                            />
                        </div>

                        {/* Error/Success Message */}
                        {error && (
                            <div className={`rounded-lg p-3 ${error.includes('Account created!')
                                ? 'bg-green-50 border border-green-200'
                                : 'bg-red-50 border border-red-200'
                                }`}>
                                <p className={`text-sm ${error.includes('Account created!')
                                    ? 'text-green-600'
                                    : 'text-red-600'
                                    }`}>{error}</p>
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-slate-600 to-blue-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-slate-700 hover:to-blue-700 focus:ring-4 focus:ring-blue-500/20 focus:ring-offset-2 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center">
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                    Creating Account...
                                </span>
                            ) : (
                                'Create Account & Start Free Trial'
                            )}
                        </button>
                    </form>

                    {/* Footer */}
                    <div className="mt-6 text-center">
                        <p className="text-slate-600 text-sm">
                            Already have an account?{' '}
                            <Link to="/login" className="text-blue-600 hover:text-blue-800 font-medium">
                                Sign In
                            </Link>
                        </p>
                    </div>
                </div>

                {/* Benefits */}
                <div className="mt-8 text-center">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-slate-600">
                        <div className="flex items-center justify-center">
                            <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            7-Day Free Trial
                        </div>
                        <div className="flex items-center justify-center">
                            <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            No Credit Card Required
                        </div>
                        <div className="flex items-center justify-center">
                            <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Cancel Anytime
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Signup; 
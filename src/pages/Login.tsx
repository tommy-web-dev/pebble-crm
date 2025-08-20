import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

type AuthMode = 'login' | 'reset' | 'verify';

const Login: React.FC = () => {
    const [mode, setMode] = useState<AuthMode>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showSignupSuggestion, setShowSignupSuggestion] = useState(false);

    const { login, resetPassword, sendVerificationEmail, currentUser } = useAuth();
    const navigate = useNavigate();

    // Redirect authenticated users to dashboard
    useEffect(() => {
        if (currentUser) {
            navigate('/dashboard');
        }
    }, [currentUser, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setShowSignupSuggestion(false);
        setLoading(true);

        try {
            if (mode === 'login') {
                await login(email, password);
                // Navigate to dashboard after successful login
                navigate('/dashboard');
            } else if (mode === 'reset') {
                await resetPassword(email);
                setSuccess('Password reset email sent! Check your inbox.');
                setMode('login');
            }
        } catch (err: any) {
            console.error('Login error:', err);

            // Handle specific Firebase auth errors intelligently
            if (err.code === 'auth/invalid-credential' ||
                err.code === 'auth/user-not-found' ||
                err.code === 'auth/wrong-password') {

                // Show user-friendly message and offer to redirect to signup
                setError('No account found with these credentials. Would you like to create a new account?');
                setShowSignupSuggestion(true);

            } else if (err.code === 'auth/too-many-requests') {
                setError('Too many failed attempts. Please try again later.');
                setShowSignupSuggestion(false);
            } else if (err.code === 'auth/user-disabled') {
                setError('This account has been disabled. Please contact support.');
                setShowSignupSuggestion(false);
            } else if (err.code === 'auth/network-request-failed') {
                setError('Network error. Please check your connection and try again.');
                setShowSignupSuggestion(false);
            } else {
                setError('An error occurred. Please try again.');
                setShowSignupSuggestion(false);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleResendVerification = async () => {
        try {
            await sendVerificationEmail();
            setSuccess('Verification email sent!');
        } catch (err: any) {
            setError(err.message || 'Failed to send verification email');
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        // Update individual state variables for email and password
        if (name === 'email') {
            setEmail(value);
        } else if (name === 'password') {
            setPassword(value);
        }

        // Clear error and signup suggestion when user starts typing
        if (error) {
            setError('');
            setShowSignupSuggestion(false);
        }
    };

    const renderForm = () => {
        switch (mode) {
            case 'reset':
                return (
                    <div>
                        <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-3">
                            Email address
                        </label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            value={email}
                            onChange={handleChange}
                            className="block w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm"
                            placeholder="Enter your email"
                        />
                    </div>
                );

            case 'verify':
                return (
                    <div className="text-center">
                        <div className="text-6xl mb-4">📧</div>
                        <h3 className="text-lg font-medium text-slate-900 mb-2">Check your email</h3>
                        <p className="text-slate-600 mb-6">
                            We've sent a verification link to <strong>{email}</strong>
                        </p>
                        <div className="space-y-3">
                            <button
                                type="button"
                                onClick={handleResendVerification}
                                className="w-full px-4 py-3 bg-slate-600 text-white text-sm font-semibold rounded-xl hover:bg-slate-700 focus:ring-4 focus:ring-slate-500/20 focus:ring-offset-2 transition-all duration-200"
                            >
                                Resend verification email
                            </button>
                            <button
                                type="button"
                                onClick={() => setMode('login')}
                                className="text-blue-600 hover:text-blue-500 text-sm font-medium"
                            >
                                Back to login
                            </button>
                            <button
                                type="button"
                                onClick={() => navigate('/dashboard')}
                                className="w-full px-4 py-3 bg-gradient-to-r from-slate-600 to-blue-600 text-white text-sm font-semibold rounded-xl hover:from-slate-700 hover:to-blue-700 focus:ring-4 focus:ring-blue-500/20 focus:ring-offset-2 transition-all duration-200"
                            >
                                Go to Dashboard
                            </button>
                        </div>
                    </div>
                );

            default: // login
                return (
                    <>
                        <div>
                            <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-3">
                                Email address
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                value={email}
                                onChange={handleChange}
                                className="block w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm"
                                placeholder="Enter your email"
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-semibold text-slate-700 mb-3">
                                Password
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                value={password}
                                onChange={handleChange}
                                className="block w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm"
                                placeholder="Enter your password"
                            />
                        </div>
                    </>
                );
        }
    };

    const getModeInfo = () => {
        switch (mode) {
            case 'reset':
                return {
                    title: 'Reset your password',
                    subtitle: 'Enter your email to receive a reset link',
                    buttonText: 'Send Reset Link',
                    switchText: 'Remember your password?',
                    switchAction: 'Sign in',
                    switchMode: 'login' as AuthMode
                };
            case 'verify':
                return {
                    title: 'Verify your email',
                    subtitle: 'Check your inbox for the verification link',
                    buttonText: '',
                    switchText: '',
                    switchAction: '',
                    switchMode: 'login' as AuthMode
                };
            default:
                return {
                    title: 'Sign in to your account',
                    subtitle: 'Welcome back to Pebble',
                    buttonText: 'Sign In',
                    switchText: '',
                    switchAction: '',
                    switchMode: 'login' as AuthMode
                };
        }
    };

    const modeInfo = getModeInfo();

    if (mode === 'verify') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50/30 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-8">
                    <div className="text-center">
                        <div className="flex items-center justify-center space-x-3 mb-6">
                            <div className="w-12 h-12 bg-gradient-to-br from-slate-700 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                                <span className="text-white font-bold text-2xl">P</span>
                            </div>
                            <span className="text-3xl font-bold bg-gradient-to-r from-slate-700 to-blue-600 bg-clip-text text-transparent">
                                Pebble
                            </span>
                        </div>
                    </div>

                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-8">
                        {renderForm()}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50/30 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div className="text-center">
                    <div className="flex items-center justify-center space-x-3 mb-6">
                        <div className="w-12 h-12 bg-gradient-to-br from-slate-700 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                            <span className="text-white font-bold text-2xl">P</span>
                        </div>
                        <span className="text-3xl font-bold bg-gradient-to-r from-slate-700 to-blue-600 bg-clip-text text-transparent">
                            Pebble
                        </span>
                    </div>
                    <h2 className="text-3xl font-bold text-slate-900 mb-2">
                        {modeInfo.title}
                    </h2>
                    <p className="text-slate-600 font-medium">
                        {modeInfo.subtitle}
                    </p>
                </div>

                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-8">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                                {error}
                                {/* Show signup button for invalid credential errors */}
                                {showSignupSuggestion && (
                                    <div className="mt-3 pt-3 border-t border-red-200">
                                        <Link
                                            to="/signup"
                                            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200"
                                        >
                                            Create New Account
                                        </Link>
                                    </div>
                                )}
                            </div>
                        )}

                        {success && (
                            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm">
                                {success}
                            </div>
                        )}

                        <div className="space-y-6">
                            {renderForm()}
                        </div>

                        {mode === 'login' && (
                            <div className="flex items-center justify-between">
                                <button
                                    type="button"
                                    onClick={() => setMode('reset')}
                                    className="text-sm text-blue-600 hover:text-blue-500 font-medium transition-colors duration-200"
                                >
                                    Forgot your password?
                                </button>
                            </div>
                        )}

                        {modeInfo.buttonText && (
                            <div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full px-4 py-3 bg-gradient-to-r from-slate-600 to-blue-600 text-white text-sm font-semibold rounded-xl hover:from-slate-700 hover:to-blue-700 focus:ring-4 focus:ring-blue-500/20 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? 'Loading...' : modeInfo.buttonText}
                                </button>
                            </div>
                        )}

                        <div className="text-center">
                            <p className="text-sm text-slate-600">
                                Don't have an account?{' '}
                                <Link to="/signup" className="text-blue-600 hover:text-blue-500 font-medium transition-colors duration-200">
                                    Sign up here
                                </Link>
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login; 
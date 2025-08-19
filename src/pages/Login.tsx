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
            setError(err.message || 'An error occurred');
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

    const renderForm = () => {
        switch (mode) {
            case 'reset':
                return (
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                            Email address
                        </label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="input mt-1"
                            placeholder="Enter your email"
                        />
                    </div>
                );

            case 'verify':
                return (
                    <div className="text-center">
                        <div className="text-6xl mb-4">📧</div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Check your email</h3>
                        <p className="text-gray-600 mb-6">
                            We've sent a verification link to <strong>{email}</strong>
                        </p>
                        <div className="space-y-3">
                            <button
                                type="button"
                                onClick={handleResendVerification}
                                className="btn-secondary w-full"
                            >
                                Resend verification email
                            </button>
                            <button
                                type="button"
                                onClick={() => setMode('login')}
                                className="text-primary-600 hover:text-primary-500 text-sm"
                            >
                                Back to login
                            </button>
                            <button
                                type="button"
                                onClick={() => navigate('/dashboard')}
                                className="btn-primary w-full"
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
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                Email address
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="input mt-1"
                                placeholder="Enter your email"
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                Password
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="input mt-1"
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
                    subtitle: 'Welcome back to Pebble.io',
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
            <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-8">
                    <div>
                        <h1 className="text-center text-3xl font-bold text-primary-600">Pebble.io</h1>
                    </div>

                    <div className="card">
                        {renderForm()}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h1 className="text-center text-3xl font-bold text-primary-600">Pebble.io</h1>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        {modeInfo.title}
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        {modeInfo.subtitle}
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
                            {success}
                        </div>
                    )}

                    <div className="space-y-4">
                        {renderForm()}
                    </div>

                    {mode === 'login' && (
                        <div className="flex items-center justify-between">
                            <button
                                type="button"
                                onClick={() => setMode('reset')}
                                className="text-sm text-primary-600 hover:text-primary-500"
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
                                className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Loading...' : modeInfo.buttonText}
                            </button>
                        </div>
                    )}

                    <div className="text-center">
                        <p className="text-sm text-gray-600">
                            Don't have an account?{' '}
                            <Link to="/signup" className="text-primary-600 hover:text-primary-500 font-medium">
                                Sign up here
                            </Link>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login; 
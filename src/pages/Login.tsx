import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

type AuthMode = 'login' | 'signup' | 'reset' | 'verify';

const Login: React.FC = () => {
    const [mode, setMode] = useState<AuthMode>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const { login, signup, resetPassword, sendVerificationEmail, currentUser } = useAuth();
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
            if (mode === 'signup') {
                if (password !== confirmPassword) {
                    throw new Error('Passwords do not match');
                }
                if (password.length < 6) {
                    throw new Error('Password must be at least 6 characters');
                }
                await signup(email, password, displayName);
                setSuccess('Account created! Please check your email for verification.');
                setMode('verify');
            } else if (mode === 'login') {
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
            case 'signup':
                return (
                    <>
                        <div>
                            <label htmlFor="displayName" className="block text-sm font-medium text-gray-700">
                                Full Name
                            </label>
                            <input
                                id="displayName"
                                name="displayName"
                                type="text"
                                autoComplete="name"
                                required
                                value={displayName}
                                onChange={(e) => setDisplayName(e.target.value)}
                                className="input mt-1"
                                placeholder="Enter your full name"
                            />
                        </div>

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
                                autoComplete="new-password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="input mt-1"
                                placeholder="Create a password"
                            />
                        </div>

                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                                Confirm Password
                            </label>
                            <input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                autoComplete="new-password"
                                required
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="input mt-1"
                                placeholder="Confirm your password"
                            />
                        </div>
                    </>
                );

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
            case 'signup':
                return {
                    title: 'Create your account',
                    subtitle: 'Start managing your business relationships',
                    buttonText: 'Create Account',
                    switchText: 'Already have an account?',
                    switchAction: 'Sign in',
                    switchMode: 'login' as AuthMode
                };
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
                    switchText: "Don't have an account?",
                    switchAction: 'Sign up',
                    switchMode: 'signup' as AuthMode
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

                    {modeInfo.switchText && (
                        <div className="text-center">
                            <button
                                type="button"
                                onClick={() => {
                                    setMode(modeInfo.switchMode);
                                    setError('');
                                    setSuccess('');
                                    setEmail('');
                                    setPassword('');
                                    setConfirmPassword('');
                                    setDisplayName('');
                                }}
                                className="text-primary-600 hover:text-primary-500 text-sm"
                            >
                                {modeInfo.switchText} {modeInfo.switchAction}
                            </button>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
};

export default Login; 
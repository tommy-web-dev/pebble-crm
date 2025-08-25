import React, { useState, useEffect } from 'react';
import { useAnalytics } from '../hooks/useAnalytics';

const CookieConsent: React.FC = () => {
    const [showBanner, setShowBanner] = useState(false);
    const { analyticsEnabled, enableAnalytics, disableAnalytics } = useAnalytics();

    useEffect(() => {
        // Check if user has already made a choice
        const cookiesAccepted = localStorage.getItem('cookiesAccepted');
        const cookiesRejected = localStorage.getItem('cookiesRejected');

        if (!cookiesAccepted && !cookiesRejected) {
            // Show banner if no choice made yet
            setShowBanner(true);
        }
    }, []);

    const acceptCookies = async () => {
        await enableAnalytics();
        setShowBanner(false);
    };

    const rejectCookies = () => {
        disableAnalytics();
        setShowBanner(false);
    };

    const openPrivacyPolicy = () => {
        window.open('/privacy', '_blank');
    };

    if (!showBanner) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50 p-4">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        🍪 We use cookies to improve your experience
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                        We use cookies and similar technologies to analyze site traffic, personalize content,
                        and provide social media features. This helps us improve our service and your experience.
                        By clicking "Accept", you consent to our use of cookies for analytics purposes.
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2 text-xs text-gray-500">
                        <button
                            onClick={openPrivacyPolicy}
                            className="text-blue-600 hover:text-blue-800 underline"
                        >
                            Privacy Policy
                        </button>
                        <span>•</span>
                        <span>Essential cookies are always enabled</span>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                    <button
                        onClick={rejectCookies}
                        className="px-6 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200"
                    >
                        Reject Analytics
                    </button>
                    <button
                        onClick={acceptCookies}
                        className="px-6 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors duration-200"
                    >
                        Accept All Cookies
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CookieConsent;

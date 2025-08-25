import { useState, useEffect } from 'react';
import { initializeAnalytics } from '../config/firebase';

export const useAnalytics = () => {
    const [analyticsEnabled, setAnalyticsEnabled] = useState(false);

    useEffect(() => {
        // Check initial state
        const cookiesAccepted = localStorage.getItem('cookiesAccepted') === 'true';
        setAnalyticsEnabled(cookiesAccepted);
    }, []);

    const enableAnalytics = async () => {
        try {
            await initializeAnalytics();
            setAnalyticsEnabled(true);
            localStorage.setItem('cookiesAccepted', 'true');
            localStorage.setItem('cookiesRejected', 'false');
        } catch (error) {
            console.error('Failed to enable analytics:', error);
        }
    };

    const disableAnalytics = () => {
        setAnalyticsEnabled(false);
        localStorage.setItem('cookiesAccepted', 'false');
        localStorage.setItem('cookiesRejected', 'true');
        
        // Note: Firebase Analytics doesn't have a built-in disable method
        // The analytics instance will remain but won't collect new data
        // This is a limitation of Firebase Analytics
    };

    const resetAnalytics = () => {
        localStorage.removeItem('cookiesAccepted');
        localStorage.removeItem('cookiesRejected');
        setAnalyticsEnabled(false);
    };

    return {
        analyticsEnabled,
        enableAnalytics,
        disableAnalytics,
        resetAnalytics
    };
};

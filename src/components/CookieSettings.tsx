import React, { useState } from 'react';
import { useAnalytics } from '../hooks/useAnalytics';

interface CookieSettingsProps {
    isOpen: boolean;
    onClose: () => void;
}

const CookieSettings: React.FC<CookieSettingsProps> = ({ isOpen, onClose }) => {
    const { analyticsEnabled, enableAnalytics, disableAnalytics, resetAnalytics } = useAnalytics();
    const [showResetConfirm, setShowResetConfirm] = useState(false);

    if (!isOpen) return null;

    const handleSave = async () => {
        if (analyticsEnabled) {
            await enableAnalytics();
        } else {
            disableAnalytics();
        }
        onClose();
    };

    const handleReset = () => {
        resetAnalytics();
        setShowResetConfirm(false);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-gray-900">Cookie Settings</h2>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 text-2xl"
                        >
                            ×
                        </button>
                    </div>

                    <div className="space-y-6">
                        {/* Essential Cookies */}
                        <div className="border-b pb-4">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                Essential Cookies
                            </h3>
                            <p className="text-sm text-gray-600 mb-3">
                                These cookies are necessary for the website to function properly. They cannot be disabled.
                            </p>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-700">Authentication & Security</span>
                                <span className="text-green-600 text-sm font-medium">Always Active</span>
                            </div>
                        </div>

                        {/* Analytics Cookies */}
                        <div className="border-b pb-4">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                Analytics Cookies
                            </h3>
                            <p className="text-sm text-gray-600 mb-3">
                                These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously.
                            </p>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-700">Google Analytics & Firebase</span>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={analyticsEnabled}
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                enableAnalytics();
                                            } else {
                                                disableAnalytics();
                                            }
                                        }}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                </label>
                            </div>
                        </div>

                        {/* Reset Section */}
                        <div className="pt-4">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Reset Preferences</h3>
                            <p className="text-sm text-gray-600 mb-4">
                                Clear all cookie preferences and show the consent banner again.
                            </p>
                            <button
                                onClick={() => setShowResetConfirm(true)}
                                className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors duration-200"
                            >
                                Reset Cookie Preferences
                            </button>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 mt-8">
                        <button
                            onClick={onClose}
                            className="px-6 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            className="px-6 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors duration-200"
                        >
                            Save Preferences
                        </button>
                    </div>
                </div>
            </div>

            {/* Reset Confirmation Modal */}
            {showResetConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-60 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Reset Cookie Preferences?</h3>
                        <p className="text-sm text-gray-600 mb-6">
                            This will clear all your cookie preferences and show the consent banner again on your next visit.
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowResetConfirm(false)}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleReset}
                                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors duration-200"
                            >
                                Reset
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CookieSettings;

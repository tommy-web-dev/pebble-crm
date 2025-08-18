import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const UserProfile: React.FC = () => {
    const { currentUser } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [displayName, setDisplayName] = useState(currentUser?.displayName || '');
    const [email, setEmail] = useState(currentUser?.email || '');

    const handleSave = async () => {
        try {
            // Here you would typically update the user profile
            // For now, we'll just close editing mode
            setIsEditing(false);
        } catch (error) {
            console.error('Error updating profile:', error);
        }
    };

    const handleCancel = () => {
        setDisplayName(currentUser?.displayName || '');
        setEmail(currentUser?.email || '');
        setIsEditing(false);
    };

    return (
        <div className="space-y-6">
            {/* Profile Header */}
            <div className="flex items-center space-x-6">
                <div className="w-20 h-20 bg-gradient-to-br from-slate-600 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-2xl">
                        {currentUser?.displayName?.[0] || currentUser?.email?.[0] || 'U'}
                    </span>
                </div>
                <div className="flex-1">
                    <h4 className="text-xl font-semibold text-slate-900 mb-1">
                        {currentUser?.displayName || 'User Profile'}
                    </h4>
                    <p className="text-slate-600">{currentUser?.email}</p>
                    <p className="text-sm text-slate-500">Member since {currentUser?.emailVerified ? 'Verified' : 'Pending verification'}</p>
                </div>
                <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="px-4 py-2 bg-gradient-to-r from-slate-600 to-blue-600 text-white text-sm font-medium rounded-lg hover:from-slate-700 hover:to-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200"
                >
                    {isEditing ? 'Cancel' : 'Edit Profile'}
                </button>
            </div>

            {/* Profile Form */}
            {isEditing ? (
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Display Name
                        </label>
                        <input
                            type="text"
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                            placeholder="Enter your display name"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Email Address
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                            placeholder="Enter your email"
                        />
                    </div>
                    <div className="flex space-x-3 pt-4">
                        <button
                            onClick={handleSave}
                            className="px-6 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white text-sm font-medium rounded-lg hover:from-green-600 hover:to-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200"
                        >
                            Save Changes
                        </button>
                        <button
                            onClick={handleCancel}
                            className="px-6 py-2 bg-gradient-to-r from-slate-500 to-slate-600 text-white text-sm font-medium rounded-lg hover:from-slate-600 hover:to-slate-700 focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 transition-all duration-200"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            ) : (
                /* Profile Display */
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl p-6 border border-slate-200/50">
                        <h5 className="text-sm font-medium text-slate-600 mb-2">Account Status</h5>
                        <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="text-sm font-medium text-slate-900">Active</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">Your account is in good standing</p>
                    </div>
                    <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl p-6 border border-slate-200/50">
                        <h5 className="text-sm font-medium text-slate-600 mb-2">Email Verification</h5>
                        <div className="flex items-center space-x-2">
                            {currentUser?.emailVerified ? (
                                <>
                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                    <span className="text-sm font-medium text-slate-900">Verified</span>
                                </>
                            ) : (
                                <>
                                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                                    <span className="text-sm font-medium text-slate-900">Pending</span>
                                </>
                            )}
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                            {currentUser?.emailVerified ? 'Your email is verified' : 'Please verify your email address'}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserProfile;
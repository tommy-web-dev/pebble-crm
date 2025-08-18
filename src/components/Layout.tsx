import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import DataLoader from './DataLoader';

const Layout: React.FC = () => {
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Data Loader - Handles loading user data */}
            <DataLoader />

            {/* Header - Fixed at top */}
            <Header />

            <div className="flex pt-16"> {/* pt-16 accounts for fixed header height */}
                {/* Sidebar - Fixed left side */}
                <Sidebar />

                {/* Main Content Area */}
                <main className="flex-1 min-h-screen bg-gray-50">
                    <div className="p-6">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Layout; 
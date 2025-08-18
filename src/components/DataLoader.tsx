import React, { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useAppStore } from '../contexts/AppContext';

const DataLoader: React.FC = () => {
    const { currentUser } = useAuth();
    const { loadUserData } = useAppStore();

    useEffect(() => {
        if (currentUser) {
            loadUserData(currentUser.uid);
        }
    }, [currentUser, loadUserData]);

    // This component doesn't render anything, it just handles data loading
    return null;
};

export default DataLoader; 
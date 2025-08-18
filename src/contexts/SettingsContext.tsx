import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface CurrencyOption {
    code: string;
    symbol: string;
    name: string;
    locale: string;
}

export interface PhoneFormatOption {
    code: string;
    prefix: string;
    name: string;
    example: string;
}

export interface AppSettings {
    currency: CurrencyOption;
    phoneFormat: PhoneFormatOption;
}

interface SettingsContextType {
    settings: AppSettings;
    updateCurrency: (currency: CurrencyOption) => void;
    updatePhoneFormat: (phoneFormat: PhoneFormatOption) => void;
    formatCurrency: (amount: number) => string;
    formatPhoneNumber: (phone: string) => string;
}

const defaultSettings: AppSettings = {
    currency: {
        code: 'USD',
        symbol: '$',
        name: 'US Dollar',
        locale: 'en-US'
    },
    phoneFormat: {
        code: 'US',
        prefix: '+1',
        name: 'United States',
        example: '+1 (555) 123-4567'
    }
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const useSettings = () => {
    const context = useContext(SettingsContext);
    if (context === undefined) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
};

interface SettingsProviderProps {
    children: ReactNode;
}

export const SettingsProvider: React.FC<SettingsProviderProps> = ({ children }) => {
    const [settings, setSettings] = useState<AppSettings>(() => {
        const saved = localStorage.getItem('pebbleSettings');
        return saved ? JSON.parse(saved) : defaultSettings;
    });

    useEffect(() => {
        localStorage.setItem('pebbleSettings', JSON.stringify(settings));
    }, [settings]);

    const updateCurrency = (currency: CurrencyOption) => {
        setSettings(prev => ({ ...prev, currency }));
    };

    const updatePhoneFormat = (phoneFormat: PhoneFormatOption) => {
        setSettings(prev => ({ ...prev, phoneFormat }));
    };

    const formatCurrency = (amount: number): string => {
        return new Intl.NumberFormat(settings.currency.locale, {
            style: 'currency',
            currency: settings.currency.code,
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    };

    const formatPhoneNumber = (phone: string): string => {
        if (!phone) return '';

        // Remove any existing formatting
        const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');

        // If it already has a country code, return as is
        if (cleanPhone.startsWith('+')) {
            return phone;
        }

        // Add the selected country prefix
        return `${settings.phoneFormat.prefix} ${cleanPhone}`;
    };

    const value: SettingsContextType = {
        settings,
        updateCurrency,
        updatePhoneFormat,
        formatCurrency,
        formatPhoneNumber
    };

    return (
        <SettingsContext.Provider value={value}>
            {children}
        </SettingsContext.Provider>
    );
}; 
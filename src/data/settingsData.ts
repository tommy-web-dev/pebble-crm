import { CurrencyOption, PhoneFormatOption } from '../contexts/SettingsContext';

export const currencyOptions: CurrencyOption[] = [
    { code: 'USD', symbol: '$', name: 'US Dollar', locale: 'en-US' },
    { code: 'EUR', symbol: '€', name: 'Euro', locale: 'de-DE' },
    { code: 'GBP', symbol: '£', name: 'British Pound', locale: 'en-GB' },
    { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', locale: 'en-CA' },
    { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', locale: 'en-AU' },
    { code: 'JPY', symbol: '¥', name: 'Japanese Yen', locale: 'ja-JP' },
    { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc', locale: 'de-CH' },
    { code: 'SEK', symbol: 'kr', name: 'Swedish Krona', locale: 'sv-SE' },
    { code: 'NOK', symbol: 'kr', name: 'Norwegian Krone', locale: 'nb-NO' },
    { code: 'DKK', symbol: 'kr', name: 'Danish Krone', locale: 'da-DK' }
];

export const phoneFormatOptions: PhoneFormatOption[] = [
    { code: 'US', prefix: '+1', name: 'United States', example: '+1 (555) 123-4567' },
    { code: 'UK', prefix: '+44', name: 'United Kingdom', example: '+44 20 7946 0958' },
    { code: 'CA', prefix: '+1', name: 'Canada', example: '+1 (416) 555-0123' },
    { code: 'AU', prefix: '+61', name: 'Australia', example: '+61 2 8765 4321' },
    { code: 'DE', prefix: '+49', name: 'Germany', example: '+49 30 12345678' },
    { code: 'FR', prefix: '+33', name: 'France', example: '+33 1 42 86 12 34' },
    { code: 'IT', prefix: '+39', name: 'Italy', example: '+39 06 1234 5678' },
    { code: 'ES', prefix: '+34', name: 'Spain', example: '+34 91 123 45 67' },
    { code: 'NL', prefix: '+31', name: 'Netherlands', example: '+31 20 123 4567' },
    { code: 'SE', prefix: '+46', name: 'Sweden', example: '+46 8 123 456 78' },
    { code: 'NO', prefix: '+47', name: 'Norway', example: '+47 22 12 34 56' },
    { code: 'DK', prefix: '+45', name: 'Denmark', example: '+45 33 12 34 56' }
]; 
import React, { useState, useEffect } from 'react';
import { useSettings } from '../contexts/SettingsContext';
import { Contact } from '../types';
import { useAuth } from '../contexts/AuthContext';

interface ContactFormProps {
    contact?: Contact | null;
    onSubmit: (contact: Omit<Contact, 'id' | 'userId' | 'createdAt' | 'updatedAt'>, interactions?: Array<{ type: string, date: string, notes: string }>) => Promise<void>;
    onCancel: () => void;
    isOpen: boolean;
}

const ContactForm: React.FC<ContactFormProps> = ({ contact, onSubmit, onCancel, isOpen }) => {
    const { formatPhoneNumber } = useSettings();
    const { currentUser } = useAuth();

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        company: '',
        position: '',
        notes: '',
        tags: [] as string[]
    });
    const [newTag, setNewTag] = useState('');
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Interaction state
    const [interactionData, setInteractionData] = useState({
        type: '',
        date: new Date().toISOString().split('T')[0], // Today's date as default
        notes: ''
    });
    const [interactions, setInteractions] = useState<Array<{
        type: string;
        date: string;
        notes: string;
    }>>([]);

    // Reset form when contact prop changes
    useEffect(() => {
        if (contact) {
            // Edit mode - populate form with contact data
            setFormData({
                firstName: contact.firstName || '',
                lastName: contact.lastName || '',
                email: contact.email || '',
                phone: contact.phone || '',
                company: contact.company || '',
                position: contact.position || '',
                notes: contact.notes || '',
                tags: [...contact.tags]
            });
        } else {
            // Add mode - clear form
            setFormData({
                firstName: '',
                lastName: '',
                email: '',
                phone: '',
                company: '',
                position: '',
                notes: '',
                tags: []
            });
        }
        setErrors({});
        setNewTag('');
        setIsSubmitting(false);
    }, [contact?.id]); // Only trigger when contact ID changes

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.firstName.trim()) {
            newErrors.firstName = 'First name is required';
        }

        if (!formData.lastName.trim()) {
            newErrors.lastName = 'Last name is required';
        }

        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };



    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);

        try {
            // Prepare contact data, converting empty strings to undefined for optional fields
            const contactData = {
                firstName: formData.firstName.trim(),
                lastName: formData.lastName.trim(),
                email: formData.email.trim() || undefined,
                phone: formData.phone.trim() || undefined,
                company: formData.company.trim() || undefined,
                position: formData.position.trim() || undefined,
                notes: formData.notes.trim() || '',
                tags: formData.tags
            };

            // Submit the contact first
            await onSubmit(contactData, interactions);

            // If there are interactions and we're adding a new contact, save them to the database
            if (interactions.length > 0 && !contact && currentUser) {
                // We need to get the contact ID that was just created
                // Since we don't have it yet, we'll need to handle this differently
                // For now, let's store interactions in the contact data and handle them in the parent component
                console.log('Interactions to be saved:', interactions);
            }

        } catch (error) {
            console.error('Form submission error:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addTag();
        }
    };

    const addTag = () => {
        if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
            setFormData(prev => ({ ...prev, tags: [...prev.tags, newTag.trim()] }));
            setNewTag('');
        }
    };

    const removeTag = (tagToRemove: string) => {
        setFormData(prev => ({ ...prev, tags: prev.tags.filter(tag => tag !== tagToRemove) }));
    };

    // Interaction handling functions
    const handleInteractionChange = (field: string, value: string) => {
        setInteractionData(prev => ({ ...prev, [field]: value }));
    };

    const addInteraction = () => {
        if (interactionData.type && interactionData.date && interactionData.notes.trim()) {
            setInteractions(prev => [...prev, { ...interactionData }]);
            // Clear interaction form
            setInteractionData({
                type: '',
                date: new Date().toISOString().split('T')[0],
                notes: ''
            });
            // Show brief success feedback
            const button = document.querySelector('[data-interaction-button]') as HTMLButtonElement;
            if (button) {
                const originalText = button.textContent;
                button.textContent = 'Added!';
                button.classList.add('bg-green-600');
                setTimeout(() => {
                    button.textContent = originalText;
                    button.classList.remove('bg-green-600');
                }, 1000);
            }
        }
    };

    const removeInteraction = (index: number) => {
        setInteractions(prev => prev.filter((_, i) => i !== index));
    };

    if (!isOpen) return null;

    const isEditMode = !!contact;
    const title = isEditMode ? 'Edit Client' : 'Add New Client';
    const submitText = isEditMode ? 'Update Client' : 'Add Client';

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-[60]">
            <div className="relative top-20 mx-auto p-6 border w-full max-w-2xl shadow-xl rounded-xl bg-white">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                            <span className="text-primary-600 text-xl">👥</span>
                        </div>
                        <div>
                            <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
                            <p className="text-sm text-gray-500">
                                {isEditMode ? 'Update client information' : 'Add a new client to your CRM'}
                                {interactions.length > 0 && (
                                    <span className="ml-2 text-primary-600 font-medium">
                                        • {interactions.length} interaction{interactions.length !== 1 ? 's' : ''} added
                                    </span>
                                )}
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={onCancel}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Name Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                First Name *
                            </label>
                            <input
                                type="text"
                                value={formData.firstName}
                                onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors ${errors.firstName ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'
                                    }`}
                                placeholder="First name"
                            />
                            {errors.firstName && (
                                <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Last Name *
                            </label>
                            <input
                                type="text"
                                value={formData.lastName}
                                onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors ${errors.lastName ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'
                                    }`}
                                placeholder="Last name"
                            />
                            {errors.lastName && (
                                <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
                            )}
                        </div>
                    </div>

                    {/* Contact Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Email
                            </label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors ${errors.email ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'
                                    }`}
                                placeholder="email@example.com"
                            />
                            {errors.email && (
                                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Phone
                            </label>
                            <input
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                                placeholder={`${formatPhoneNumber('5551234567').replace('5551234567', '555 123 4567')}`}
                            />
                            <p className="mt-1 text-xs text-gray-500">
                                Enter phone number (will be formatted automatically)
                            </p>
                        </div>
                    </div>

                    {/* Company Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Company
                            </label>
                            <input
                                type="text"
                                value={formData.company}
                                onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                                placeholder="Company name"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Position
                            </label>
                            <input
                                type="text"
                                value={formData.position}
                                onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                                placeholder="Job title"
                            />
                        </div>
                    </div>

                    {/* Add Interaction Section */}
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <h3 className="text-lg font-medium text-gray-900 mb-3">Add Interaction</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Interaction Type *
                                </label>
                                <select
                                    value={interactionData.type}
                                    onChange={(e) => handleInteractionChange('type', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                                >
                                    <option value="">Select interaction type</option>
                                    <option value="call">Phone Call</option>
                                    <option value="email">Email</option>
                                    <option value="meeting">Meeting</option>
                                    <option value="proposal">Proposal Sent</option>
                                    <option value="follow_up">Follow Up</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Date *
                                </label>
                                <input
                                    type="date"
                                    value={interactionData.date}
                                    onChange={(e) => handleInteractionChange('date', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                                />
                            </div>
                        </div>
                        <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Interaction Notes *
                            </label>
                            <textarea
                                value={interactionData.notes}
                                onChange={(e) => handleInteractionChange('notes', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors min-h-[80px] resize-none"
                                placeholder="Add notes about this interaction..."
                            />
                        </div>
                        <div className="mt-4 flex justify-end">
                            <button
                                type="button"
                                onClick={addInteraction}
                                disabled={!interactionData.type || !interactionData.date || !interactionData.notes.trim()}
                                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                data-interaction-button
                            >
                                Add Interaction
                            </button>
                        </div>

                        {/* Helper text for incomplete interactions */}
                        {interactionData.type || interactionData.date || interactionData.notes.trim() ? (
                            <div className="mt-2 text-xs text-gray-500">
                                {!interactionData.type && <span className="block">• Select an interaction type</span>}
                                {!interactionData.date && <span className="block">• Choose a date</span>}
                                {!interactionData.notes.trim() && <span className="block">• Add interaction notes</span>}
                            </div>
                        ) : null}

                        {/* Display added interactions */}
                        {interactions.length > 0 && (
                            <div className="mt-4 pt-4 border-t border-gray-200">
                                <h4 className="text-sm font-medium text-gray-700 mb-3">Added Interactions:</h4>
                                <div className="space-y-2">
                                    {interactions.map((interaction, index) => (
                                        <div key={index} className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-200">
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-3">
                                                    <span className="text-sm font-medium text-gray-900 capitalize">{interaction.type.replace('_', ' ')}</span>
                                                    <span className="text-sm text-gray-500">{interaction.date}</span>
                                                </div>
                                                <p className="text-sm text-gray-600 mt-1">{interaction.notes}</p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => removeInteraction(index)}
                                                className="ml-2 text-red-600 hover:text-red-800 p-1"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Tags */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Tags
                        </label>
                        <div className="flex space-x-2 mb-3">
                            <input
                                type="text"
                                value={newTag}
                                onChange={(e) => setNewTag(e.target.value)}
                                onKeyPress={handleKeyPress}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                                placeholder="Add a tag"
                            />
                            <button
                                type="button"
                                onClick={addTag}
                                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                            >
                                Add
                            </button>
                        </div>

                        {formData.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {formData.tags.map((tag, index) => (
                                    <span
                                        key={index}
                                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800"
                                    >
                                        {tag}
                                        <button
                                            type="button"
                                            onClick={() => removeTag(tag)}
                                            className="ml-2 text-primary-600 hover:text-primary-800"
                                        >
                                            ×
                                        </button>
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Notes */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Notes
                        </label>
                        <textarea
                            value={formData.notes}
                            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors min-h-[100px] resize-none"
                            placeholder="Add notes about this contact..."
                        />
                    </div>

                    {/* Form Actions */}
                    <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium"
                            disabled={isSubmitting}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <div className="flex items-center space-x-2">
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    <span>Processing...</span>
                                </div>
                            ) : (
                                submitText
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ContactForm; 
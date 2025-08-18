import React, { useState, useEffect } from 'react';
import { Deal, Contact } from '../types';

interface DealFormProps {
    deal?: Deal | null;
    contacts: Contact[];
    onSubmit: (deal: Omit<Deal, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<void>;
    onCancel: () => void;
    isOpen: boolean;
}

const DealForm: React.FC<DealFormProps> = ({ deal, contacts, onSubmit, onCancel, isOpen }) => {
    const [formData, setFormData] = useState({
        title: '',
        value: '',
        stage: 'lead' as Deal['stage'],
        probability: 25,
        expectedCloseDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
        notes: ''
    });
    const [selectedContactId, setSelectedContactId] = useState<string>('');
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Reset form when deal prop changes
    useEffect(() => {
        if (deal) {
            // Edit mode - populate form with deal data
            // Ensure date is properly converted to Date object
            let dealDate = deal.expectedCloseDate;
            if (dealDate && typeof dealDate === 'object' && 'toDate' in dealDate) {
                // It's a Firestore Timestamp, convert to Date
                dealDate = (dealDate as any).toDate();
            } else if (dealDate && typeof dealDate === 'string') {
                // It's a string, convert to Date
                dealDate = new Date(dealDate);
            }

            setFormData({
                title: deal.title,
                value: deal.value.toString(),
                stage: deal.stage,
                probability: deal.probability,
                expectedCloseDate: dealDate instanceof Date ? dealDate.toISOString().split('T')[0] : '',
                notes: deal.notes || ''
            });
            setSelectedContactId(deal.contactId);
        } else {
            // Add mode - clear form
            setFormData({
                title: '',
                value: '',
                stage: 'lead',
                probability: 25,
                expectedCloseDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                notes: ''
            });
            setSelectedContactId('');
        }
        setErrors({});
    }, [deal]);

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.title.trim()) {
            newErrors.title = 'Deal title is required';
        }

        if (!formData.value || isNaN(Number(formData.value)) || Number(formData.value) <= 0) {
            newErrors.value = 'Valid deal value is required';
        }

        if (!selectedContactId) {
            newErrors.contact = 'Please select a contact';
        }

        if (formData.probability < 0 || formData.probability > 100) {
            newErrors.probability = 'Probability must be between 0 and 100';
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
            const dealData = {
                title: formData.title.trim(),
                value: Number(formData.value),
                stage: formData.stage,
                probability: formData.probability,
                expectedCloseDate: formData.expectedCloseDate ? new Date(formData.expectedCloseDate) : undefined,
                notes: formData.notes.trim() || '',
                contactId: selectedContactId
            };

            await onSubmit(dealData);
        } catch (error) {
            console.error('Form submission error:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    const isEditMode = !!deal;
    const title = isEditMode ? 'Edit Opportunity' : 'Add New Opportunity';
    const submitText = isEditMode ? 'Update Opportunity' : 'Create Opportunity';

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-[70]">
            <div className="relative top-20 mx-auto p-6 border w-full max-w-lg shadow-xl rounded-xl bg-white">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                            <span className="text-primary-600 text-xl">🎯</span>
                        </div>
                        <div>
                            <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
                            <p className="text-sm text-gray-500">
                                {isEditMode ? 'Update opportunity details' : 'Create a new opportunity to track in your pipeline'}
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
                    {/* Deal Title */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Deal Title *
                        </label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors ${errors.title ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'
                                }`}
                            placeholder="What's the deal about?"
                        />
                        {errors.title && (
                            <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                        )}
                    </div>

                    {/* Contact Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Contact *
                        </label>
                        <select
                            value={selectedContactId}
                            onChange={(e) => setSelectedContactId(e.target.value)}
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors ${errors.contact ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'
                                }`}
                        >
                            <option value="">Select a contact</option>
                            {contacts.map((contact) => (
                                <option key={contact.id} value={contact.id}>
                                    {contact.firstName} {contact.lastName}
                                    {contact.company && ` - ${contact.company}`}
                                </option>
                            ))}
                        </select>
                        {errors.contact && (
                            <p className="mt-1 text-sm text-red-600">{errors.contact}</p>
                        )}
                    </div>

                    {/* Deal Value */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Deal Value *
                        </label>
                        <div className="relative">
                            <span className="absolute left-3 top-2 text-gray-500">$</span>
                            <input
                                type="number"
                                value={formData.value}
                                onChange={(e) => setFormData(prev => ({ ...prev, value: e.target.value }))}
                                className={`w-full pl-8 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors ${errors.value ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'
                                    }`}
                                placeholder="0.00"
                                min="0"
                                step="0.01"
                            />
                        </div>
                        {errors.value && (
                            <p className="mt-1 text-sm text-red-600">{errors.value}</p>
                        )}
                    </div>

                    {/* Stage */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Stage
                        </label>
                        <select
                            value={formData.stage}
                            onChange={(e) => setFormData(prev => ({ ...prev, stage: e.target.value as Deal['stage'] }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                        >
                            <option value="lead">🟢 Lead</option>
                            <option value="negotiating">🟠 Negotiating</option>
                            <option value="live-opportunity">🔵 Live Opportunity</option>
                            <option value="closed-won">✅ Closed Won</option>
                            <option value="closed-lost">❌ Closed Lost</option>
                        </select>
                    </div>

                    {/* Probability */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Probability: {formData.probability}%
                        </label>
                        <input
                            type="range"
                            value={formData.probability}
                            onChange={(e) => setFormData(prev => ({ ...prev, probability: Number(e.target.value) }))}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                            min="0"
                            max="100"
                            step="5"
                        />
                        {errors.probability && (
                            <p className="mt-1 text-sm text-red-600">{errors.probability}</p>
                        )}
                    </div>

                    {/* Expected Close Date */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Expected Close Date
                        </label>
                        <input
                            type="date"
                            value={formData.expectedCloseDate}
                            onChange={(e) => setFormData(prev => ({ ...prev, expectedCloseDate: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                        />
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
                            placeholder="Add notes about this deal..."
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

export default DealForm; 
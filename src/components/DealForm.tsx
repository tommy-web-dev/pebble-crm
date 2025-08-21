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
        notes: '',
        // New recruitment-specific fields
        jobType: '',
        requirements: '',
        startDate: '',
        feePercentage: '',
        isExclusive: false,
        location: '',
        recruiter: ''
    });
    const [selectedContactId, setSelectedContactId] = useState<string>('');
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Handle ESC key press
    useEffect(() => {
        const handleEscKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onCancel();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscKey);
        }

        return () => {
            document.removeEventListener('keydown', handleEscKey);
        };
    }, [isOpen, onCancel]);

    // Handle click outside modal
    const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
        if (event.target === event.currentTarget) {
            onCancel();
        }
    };

    // Reset form when deal prop changes
    useEffect(() => {
        if (deal) {
            // Edit mode - populate form with deal data
            setFormData({
                title: deal.title,
                value: deal.value.toString(),
                stage: deal.stage,
                notes: deal.notes || '',
                // New fields with defaults
                jobType: (deal as any).jobType || '',
                requirements: (deal as any).requirements || '',
                startDate: deal.stage === 'placed' && (deal as any).startDate && (deal as any).startDate instanceof Date ? (deal as any).startDate.toISOString().split('T')[0] : '',
                feePercentage: (deal as any).feePercentage ? String((deal as any).feePercentage) : '',
                isExclusive: (deal as any).isExclusive || false,
                location: (deal as any).location || '',
                recruiter: (deal as any).recruiter || ''
            });
            console.log('Setting selectedContactId to:', deal.contactId);
            setSelectedContactId(deal.contactId);
        } else {
            // Add mode - clear form
            setFormData({
                title: '',
                value: '',
                stage: 'lead',
                notes: '',
                // New fields with defaults
                jobType: '',
                requirements: '',
                startDate: '',
                feePercentage: '',
                isExclusive: false,
                location: '',
                recruiter: ''
            });
            setSelectedContactId('');
        }
        setErrors({});
    }, [deal, setSelectedContactId]);

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        console.log('Validating form with data:', { formData, selectedContactId });

        if (!formData.title.trim()) {
            newErrors.title = 'Job title is required';
        }

        if (!formData.value || isNaN(Number(formData.value)) || Number(formData.value) <= 0) {
            newErrors.value = 'Valid salary is required';
        }

        if (!selectedContactId) {
            console.log('Contact validation failed - selectedContactId is:', selectedContactId);
            console.log('Available contacts:', contacts?.length);
            newErrors.contact = 'Please select a client';
        }

        if (formData.feePercentage && (isNaN(Number(formData.feePercentage)) || Number(formData.feePercentage) <= 0 || Number(formData.feePercentage) > 100)) {
            newErrors.feePercentage = 'Fee percentage must be between 0 and 100';
        }

        // Require start date when stage is 'placed'
        if (formData.stage === 'placed' && (!formData.startDate || !formData.startDate.trim())) {
            newErrors.startDate = 'Start date is required when marking job as placed';
        }

        console.log('Validation errors:', newErrors);
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            console.log('Form validation failed');
            return;
        }

        setIsSubmitting(true);

        try {
            const dealData: any = {
                title: formData.title.trim(),
                value: Number(formData.value),
                stage: formData.stage,
                probability: 0, // Default value since we removed it from the form
                notes: formData.notes.trim(),
                contactId: selectedContactId,
                // New fields
                jobType: formData.jobType.trim(),
                requirements: formData.requirements.trim(),
                feePercentage: formData.feePercentage ? Number(formData.feePercentage) : undefined,
                isExclusive: formData.isExclusive,
                location: formData.location.trim(),
                recruiter: formData.recruiter.trim() || undefined
            };

            // Only include startDate if stage is 'placed' and we have a valid date
            if (formData.stage === 'placed' && formData.startDate && formData.startDate.trim()) {
                dealData.startDate = new Date(formData.startDate);
            }

            // Filter out any undefined values before submitting
            const cleanDealData = Object.fromEntries(
                Object.entries(dealData).filter(([_, value]) => value !== undefined)
            ) as Omit<Deal, 'id' | 'userId' | 'createdAt' | 'updatedAt'>;

            console.log('Submitting deal data:', cleanDealData);
            console.log('Data types:', Object.fromEntries(
                Object.entries(cleanDealData).map(([key, value]) => [key, typeof value])
            ));
            await onSubmit(cleanDealData);
            console.log('Deal submission successful');
        } catch (error) {
            console.error('Error saving job:', error);
            alert(`Failed to save job: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;

        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData(prev => ({ ...prev, [name]: checked }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    // Calculate fee based on value and fee percentage
    const calculatedFee = formData.value && formData.feePercentage
        ? (Number(formData.value) * Number(formData.feePercentage) / 100).toFixed(2)
        : '0.00';

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={handleBackdropClick}>
            <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-slate-200">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold text-slate-900">
                            {deal ? 'Edit Job Order' : 'Add New Job Order'}
                        </h2>
                        <button
                            onClick={onCancel}
                            className="text-slate-400 hover:text-slate-600 transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Basic Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                Job Title *
                            </label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleInputChange}
                                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${errors.title ? 'border-red-500' : 'border-slate-200'
                                    }`}
                                placeholder="e.g., Senior Software Engineer"
                            />
                            {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                Client *
                            </label>
                            <select
                                value={selectedContactId}
                                onChange={(e) => setSelectedContactId(e.target.value)}
                                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${errors.contact ? 'border-red-500' : 'border-slate-200'
                                    }`}
                            >
                                <option value="">Select a client</option>
                                {contacts.map(contact => (
                                    <option key={contact.id} value={contact.id}>
                                        {contact.firstName} {contact.lastName} {contact.company ? `(${contact.company})` : ''}
                                    </option>
                                ))}
                            </select>
                            {errors.contact && <p className="text-red-500 text-sm mt-1">{errors.contact}</p>}
                        </div>
                    </div>

                    {/* Job Details */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                Job Type
                            </label>
                            <select
                                name="jobType"
                                value={formData.jobType}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                            >
                                <option value="">Select job type</option>
                                <option value="permanent">Permanent</option>
                                <option value="contract">Contract</option>
                                <option value="temporary">Temporary</option>
                                <option value="part-time">Part-time</option>
                                <option value="freelance">Freelance</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                Location
                            </label>
                            <input
                                type="text"
                                name="location"
                                value={formData.location}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                placeholder="e.g., London, UK"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                Recruiter
                            </label>
                            <input
                                type="text"
                                name="recruiter"
                                value={formData.recruiter}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                placeholder="e.g., John Smith"
                            />
                        </div>
                    </div>

                    {/* Company Information */}
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                name="isExclusive"
                                checked={formData.isExclusive}
                                onChange={handleInputChange}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                            />
                            <label className="ml-2 text-sm font-medium text-slate-700">
                                Exclusive Terms
                            </label>
                        </div>
                    </div>

                    {/* Financial Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                Salary *
                            </label>
                            <input
                                type="number"
                                name="value"
                                value={formData.value}
                                onChange={handleInputChange}
                                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${errors.value ? 'border-red-500' : 'border-slate-200'
                                    }`}
                                placeholder="0.00"
                                min="0"
                                step="0.01"
                            />
                            {errors.value && <p className="text-red-500 text-sm mt-1">{errors.value}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                Fee Percentage (%)
                            </label>
                            <input
                                type="number"
                                name="feePercentage"
                                value={formData.feePercentage}
                                onChange={handleInputChange}
                                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${errors.feePercentage ? 'border-red-500' : 'border-slate-200'
                                    }`}
                                placeholder="15"
                                min="0"
                                max="100"
                                step="0.1"
                            />
                            {errors.feePercentage && <p className="text-red-500 text-sm mt-1">{errors.feePercentage}</p>}
                        </div>
                    </div>

                    {/* Calculated Fee Display */}
                    {formData.value && formData.feePercentage && (
                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-blue-800">Calculated Fee:</span>
                                <span className="text-lg font-bold text-blue-900">£{calculatedFee}</span>
                            </div>
                            <p className="text-xs text-blue-600 mt-1">
                                Based on {formData.value} × {formData.feePercentage}%
                            </p>
                        </div>
                    )}

                    {/* Stage Selection */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Stage
                        </label>
                        <select
                            name="stage"
                            value={formData.stage}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                        >
                            <option value="lead">Lead</option>
                            <option value="live-opportunity">Live Job</option>
                            <option value="shortlist-sent">Shortlist Sent</option>
                            <option value="interview">Interview</option>
                            <option value="offer">Offer</option>
                            <option value="placed">Placed</option>
                        </select>
                    </div>

                    {/* Start Date - Only show when stage is 'placed' */}
                    {formData.stage === 'placed' && (
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                Start Date *
                            </label>
                            <input
                                type="date"
                                name="startDate"
                                value={formData.startDate}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                required
                            />
                            <p className="text-xs text-slate-500 mt-1">
                                Required when marking job as placed
                            </p>
                            {errors.startDate && <p className="text-red-500 text-sm mt-1">{errors.startDate}</p>}
                        </div>
                    )}

                    {/* Requirements */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Job Requirements
                        </label>
                        <textarea
                            name="requirements"
                            value={formData.requirements}
                            onChange={handleInputChange}
                            rows={4}
                            className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                            placeholder="Describe the key requirements, skills, and experience needed for this role..."
                        />
                    </div>

                    {/* Notes */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Additional Notes
                        </label>
                        <textarea
                            name="notes"
                            value={formData.notes}
                            onChange={handleInputChange}
                            rows={3}
                            className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                            placeholder="Any additional information about this job order..."
                        />
                    </div>

                    {/* Form Actions */}
                    <div className="flex items-center justify-end space-x-4 pt-6 border-t border-slate-200">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="px-6 py-3 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-all duration-200"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                        >
                            {isSubmitting ? 'Saving...' : (deal ? 'Update Job' : 'Create Job')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default DealForm; 
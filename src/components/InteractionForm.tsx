import React, { useState, useEffect } from 'react';
import { Interaction, Task } from '../types';

interface InteractionFormProps {
    interaction?: Interaction | null;
    contactId: string;
    contactName: string; // Add contact name for task creation
    onSubmit: (interaction: Omit<Interaction, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<void>;
    onCancel: () => void;
    isOpen: boolean;
    onCreateFollowUpTask?: (task: Omit<Task, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<void>;
}

const InteractionForm: React.FC<InteractionFormProps> = ({ interaction, contactId, contactName, onSubmit, onCancel, isOpen, onCreateFollowUpTask }) => {
    const [formData, setFormData] = useState({
        type: 'call' as Interaction['type'],
        date: new Date().toISOString().split('T')[0], // Today's date in YYYY-MM-DD format
        notes: ''
    });
    const [followUpData, setFollowUpData] = useState({
        enabled: false,
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days from now
        notes: ''
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Reset form when interaction prop changes
    useEffect(() => {
        if (interaction) {
            // Edit mode - populate form with interaction data
            // Ensure date is properly converted to Date object
            let interactionDate = interaction.date;
            if (interactionDate && typeof interactionDate === 'object' && 'toDate' in interactionDate) {
                // It's a Firestore Timestamp, convert to Date
                interactionDate = (interactionDate as any).toDate();
            } else if (interactionDate && typeof interactionDate === 'string') {
                // It's a string, convert to Date
                interactionDate = new Date(interactionDate);
            }

            setFormData({
                type: interaction.type,
                date: interactionDate instanceof Date ? interactionDate.toISOString().split('T')[0] : '',
                notes: interaction.notes || ''
            });
            // Reset follow-up data for edit mode (since we can't edit existing follow-ups)
            setFollowUpData({
                enabled: false,
                date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                notes: ''
            });
        } else {
            // Add mode - clear form
            setFormData({
                type: 'call',
                date: new Date().toISOString().split('T')[0],
                notes: ''
            });
            setFollowUpData({
                enabled: false,
                date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                notes: ''
            });
        }
        setErrors({});
    }, [interaction]);

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.notes.trim()) {
            newErrors.notes = 'Notes are required';
        }

        if (!formData.date) {
            newErrors.date = 'Date is required';
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
            const interactionData = {
                contactId,
                type: formData.type,
                date: new Date(formData.date),
                notes: formData.notes.trim()
            };

            await onSubmit(interactionData);

            // Create follow-up task if enabled
            if (followUpData.enabled && onCreateFollowUpTask) {
                const followUpTask = {
                    title: `Follow up with ${contactName}`,
                    description: followUpData.notes.trim() || `Follow up on ${formData.type} from ${formData.date}`,
                    dueDate: new Date(followUpData.date),
                    completed: false,
                    priority: 'medium' as const,
                    relatedTo: {
                        type: 'contact' as const,
                        id: contactId
                    }
                };

                await onCreateFollowUpTask(followUpTask);
            }
        } catch (error) {
            console.error('Form submission error:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    const isEditMode = !!interaction;
    const title = isEditMode ? 'Edit Interaction' : 'Add Interaction';
    const submitText = isEditMode ? 'Update Interaction' : 'Add Interaction';

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-[70]">
            <div className="relative top-20 mx-auto p-6 border w-full max-w-lg shadow-xl rounded-xl bg-white">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                            <span className="text-primary-600 text-xl">📝</span>
                        </div>
                        <div>
                            <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
                            <p className="text-sm text-gray-500">
                                {isEditMode ? 'Update interaction details' : 'Record a new interaction with this contact'}
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
                    {/* Interaction Type */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Interaction Type *
                        </label>
                        <select
                            value={formData.type}
                            onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as Interaction['type'] }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                        >
                            <option value="call">📞 Call</option>
                            <option value="meeting">🤝 Meeting</option>
                            <option value="email">📧 Email</option>
                            <option value="note">📝 Note</option>
                            <option value="follow-up">⏰ Follow-up</option>
                        </select>
                    </div>

                    {/* Date */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Date *
                        </label>
                        <input
                            type="date"
                            value={formData.date}
                            onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors ${errors.date ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'
                                }`}
                        />
                        {errors.date && (
                            <p className="mt-1 text-sm text-red-600">{errors.date}</p>
                        )}
                    </div>

                    {/* Notes */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Notes *
                        </label>
                        <textarea
                            value={formData.notes}
                            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors min-h-[120px] resize-none ${errors.notes ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'
                                }`}
                            placeholder="Describe what happened during this interaction..."
                        />
                        {errors.notes && (
                            <p className="mt-1 text-sm text-red-600">{errors.notes}</p>
                        )}
                    </div>

                    {/* Follow-up Reminder */}
                    <div className="border-t border-gray-200 pt-6">
                        <div className="flex items-center space-x-3 mb-4">
                            <input
                                type="checkbox"
                                id="followUpEnabled"
                                checked={followUpData.enabled}
                                onChange={(e) => setFollowUpData(prev => ({ ...prev, enabled: e.target.checked }))}
                                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500 focus:ring-2"
                            />
                            <label htmlFor="followUpEnabled" className="text-sm font-medium text-gray-700">
                                Create follow-up reminder
                            </label>
                        </div>

                        {followUpData.enabled && (
                            <div className="space-y-4 pl-7 border-l-2 border-primary-200">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Follow-up Date
                                    </label>
                                    <input
                                        type="date"
                                        value={followUpData.date}
                                        onChange={(e) => setFollowUpData(prev => ({ ...prev, date: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Follow-up Notes
                                    </label>
                                    <textarea
                                        value={followUpData.notes}
                                        onChange={(e) => setFollowUpData(prev => ({ ...prev, notes: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors min-h-[80px] resize-none"
                                        placeholder="What should I follow up on? (optional)"
                                    />
                                </div>

                                <div className="bg-blue-50 p-3 rounded-lg">
                                    <div className="flex items-start space-x-2">
                                        <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <div className="text-sm text-blue-800">
                                            <p className="font-medium">This will create a task in your Tasks section</p>
                                            <p className="text-blue-700 mt-1">
                                                Task: "Follow up with {contactName}" • Due: {new Date(followUpData.date).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
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

export default InteractionForm; 
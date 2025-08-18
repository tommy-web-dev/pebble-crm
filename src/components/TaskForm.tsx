import React, { useState, useEffect } from 'react';
import { Task, Contact } from '../types';

interface TaskFormProps {
    task?: Task | null;
    contacts: Contact[];
    onSubmit: (task: Omit<Task, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<void>;
    onCancel: () => void;
    isOpen: boolean;
}

const TaskForm: React.FC<TaskFormProps> = ({ task, contacts, onSubmit, onCancel, isOpen }) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Tomorrow
        priority: 'medium' as Task['priority'],
        completed: false
    });
    const [selectedContactId, setSelectedContactId] = useState<string>('');
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Reset form when task prop changes
    useEffect(() => {
        if (task) {
            // Edit mode - populate form with task data
            setFormData({
                title: task.title,
                description: task.description || '',
                dueDate: task.dueDate ? task.dueDate.toISOString().split('T')[0] : '',
                priority: task.priority,
                completed: task.completed
            });
            setSelectedContactId(task.relatedTo?.type === 'contact' ? task.relatedTo.id : '');
        } else {
            // Add mode - clear form
            setFormData({
                title: '',
                description: '',
                dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                priority: 'medium',
                completed: false
            });
            setSelectedContactId('');
        }
        setErrors({});
    }, [task]);

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.title.trim()) {
            newErrors.title = 'Task title is required';
        }

        if (formData.dueDate && new Date(formData.dueDate) < new Date()) {
            newErrors.dueDate = 'Due date cannot be in the past';
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
            const taskData = {
                title: formData.title.trim(),
                description: formData.description.trim() || undefined,
                dueDate: formData.dueDate ? new Date(formData.dueDate) : undefined,
                priority: formData.priority,
                completed: formData.completed,
                relatedTo: selectedContactId ? {
                    type: 'contact' as const,
                    id: selectedContactId
                } : undefined
            };

            await onSubmit(taskData);
        } catch (error) {
            console.error('Form submission error:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    const isEditMode = !!task;
    const title = isEditMode ? 'Edit Task' : 'Add New Task';
    const submitText = isEditMode ? 'Update Task' : 'Create Task';

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-[70]">
            <div className="relative top-20 mx-auto p-6 border w-full max-w-lg shadow-xl rounded-xl bg-white">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                            <span className="text-primary-600 text-xl">✅</span>
                        </div>
                        <div>
                            <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
                            <p className="text-sm text-gray-500">
                                {isEditMode ? 'Update task details' : 'Create a new task to stay organized'}
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
                    {/* Task Title */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Task Title *
                        </label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors ${errors.title ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'
                                }`}
                            placeholder="What needs to be done?"
                        />
                        {errors.title && (
                            <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                        )}
                    </div>

                    {/* Task Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Description
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors min-h-[100px] resize-none"
                            placeholder="Add more details about this task..."
                        />
                    </div>

                    {/* Due Date */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Due Date
                        </label>
                        <input
                            type="date"
                            value={formData.dueDate}
                            onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors ${errors.dueDate ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'
                                }`}
                        />
                        {errors.dueDate && (
                            <p className="mt-1 text-sm text-red-600">{errors.dueDate}</p>
                        )}
                    </div>

                    {/* Priority */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Priority
                        </label>
                        <select
                            value={formData.priority}
                            onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as Task['priority'] }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                        >
                            <option value="low">🟢 Low</option>
                            <option value="medium">🟡 Medium</option>
                            <option value="high">🔴 High</option>
                        </select>
                    </div>

                    {/* Link to Contact */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Link to Contact (Optional)
                        </label>
                        <select
                            value={selectedContactId}
                            onChange={(e) => setSelectedContactId(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                        >
                            <option value="">No contact linked</option>
                            {contacts.map((contact) => (
                                <option key={contact.id} value={contact.id}>
                                    {contact.firstName} {contact.lastName}
                                    {contact.company && ` - ${contact.company}`}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Completed Status (only for edit mode) */}
                    {isEditMode && (
                        <div className="flex items-center space-x-3">
                            <input
                                type="checkbox"
                                id="completed"
                                checked={formData.completed}
                                onChange={(e) => setFormData(prev => ({ ...prev, completed: e.target.checked }))}
                                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500 focus:ring-2"
                            />
                            <label htmlFor="completed" className="text-sm font-medium text-gray-700">
                                Mark as completed
                            </label>
                        </div>
                    )}

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

export default TaskForm; 
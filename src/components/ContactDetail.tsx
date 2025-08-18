import React, { useState, useEffect } from 'react';
import { useAppStore } from '../contexts/AppContext';
import { useSettings } from '../contexts/SettingsContext';
import { useAuth } from '../contexts/AuthContext';
import { Contact, Interaction, Task } from '../types';
import { getInteractions, addInteraction, updateInteraction, deleteInteraction, addTask } from '../utils/firebase';
import InteractionForm from './InteractionForm';

interface ContactDetailProps {
    contact: Contact;
    onEdit: () => void;
    onDelete: () => void;
    onClose: () => void;
}

const ContactDetail: React.FC<ContactDetailProps> = ({ contact, onEdit, onDelete, onClose }) => {
    const { currentUser } = useAuth();
    const { addTask: addTaskToStore } = useAppStore();
    const { formatPhoneNumber } = useSettings();
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [copySuccess, setCopySuccess] = useState<string | null>(null);
    const [interactions, setInteractions] = useState<Interaction[]>([]);
    const [isInteractionFormOpen, setIsInteractionFormOpen] = useState(false);
    const [selectedInteraction, setSelectedInteraction] = useState<Interaction | null>(null);
    const [loadingInteractions, setLoadingInteractions] = useState(true);

    // Load interactions when component mounts
    useEffect(() => {
        if (currentUser && contact.id) {
            loadInteractions();
        }
    }, [currentUser, contact.id]);

    const loadInteractions = async () => {
        try {
            setLoadingInteractions(true);
            const loadedInteractions = await getInteractions(contact.id, currentUser!.uid);
            setInteractions(loadedInteractions);
        } catch (error) {
            console.error('Error loading interactions:', error);
        } finally {
            setLoadingInteractions(false);
        }
    };

    const handleAddInteraction = async (interactionData: Omit<Interaction, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
        if (!currentUser) return;

        try {
            const newInteraction = await addInteraction({
                ...interactionData,
                userId: currentUser.uid
            });

            setInteractions(prev => [newInteraction, ...prev]);
            setIsInteractionFormOpen(false);
        } catch (error) {
            console.error('Error adding interaction:', error);
            alert('Failed to add interaction. Please try again.');
        }
    };

    const handleUpdateInteraction = async (interactionData: Omit<Interaction, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
        if (!selectedInteraction) return;

        try {
            await updateInteraction(selectedInteraction.id, interactionData);

            // Update local state
            setInteractions(prev => prev.map(interaction =>
                interaction.id === selectedInteraction.id
                    ? { ...interaction, ...interactionData, updatedAt: new Date() }
                    : interaction
            ));

            setIsInteractionFormOpen(false);
            setSelectedInteraction(null);
        } catch (error) {
            console.error('Error updating interaction:', error);
            alert('Failed to update interaction. Please try again.');
        }
    };

    const handleDeleteInteraction = async (interactionId: string) => {
        try {
            await deleteInteraction(interactionId);
            setInteractions(prev => prev.filter(interaction => interaction.id !== interactionId));
        } catch (error) {
            console.error('Error deleting interaction:', error);
            alert('Failed to delete interaction. Please try again.');
        }
    };

    const openInteractionForm = (interaction?: Interaction) => {
        setSelectedInteraction(interaction || null);
        setIsInteractionFormOpen(true);
    };

    const closeInteractionForm = () => {
        setIsInteractionFormOpen(false);
        setSelectedInteraction(null);
    };

    const handleCreateFollowUpTask = async (taskData: Omit<Task, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
        if (!currentUser) return;

        try {
            const newTask = await addTask({
                ...taskData,
                userId: currentUser.uid
            });

            // Task added to Firebase - DataLoader will automatically update the store
        } catch (error) {
            console.error('Error creating follow-up task:', error);
            alert('Failed to create follow-up task. Please try again.');
        }
    };

    const formatDate = (date: Date | any) => {
        // Handle Firestore Timestamp objects
        if (date && typeof date === 'object' && 'toDate' in date) {
            date = date.toDate();
        }

        // Ensure we have a valid Date object
        if (!(date instanceof Date) || isNaN(date.getTime())) {
            return 'Invalid date';
        }

        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const copyToClipboard = async (text: string, type: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopySuccess(`${type} copied!`);
            setTimeout(() => setCopySuccess(null), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
            setCopySuccess('Failed to copy');
            setTimeout(() => setCopySuccess(null), 2000);
        }
    };

    const handleEmailClick = (email: string) => {
        window.open(`mailto:${email}`, '_blank');
    };

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-10 mx-auto p-6 border w-full max-w-2xl shadow-lg rounded-md bg-white m-4">
                {/* Success Notification */}
                {copySuccess && (
                    <div className="absolute top-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded-md shadow-lg z-10">
                        <div className="flex items-center space-x-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="text-sm font-medium">{copySuccess}</span>
                        </div>
                    </div>
                )}

                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">
                        {contact.firstName} {contact.lastName}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
                    >
                        ×
                    </button>
                </div>

                <div className="space-y-6">
                    {/* Contact Header */}
                    <div className="flex items-center space-x-4">
                        <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center">
                            <span className="text-3xl font-medium text-primary-700">
                                {contact.firstName[0]}{contact.lastName[0]}
                            </span>
                        </div>

                        <div className="flex-1">
                            <h3 className="text-xl font-semibold text-gray-900">
                                {contact.firstName} {contact.lastName}
                            </h3>
                            {contact.position && contact.company && (
                                <p className="text-gray-600">
                                    {contact.position} at {contact.company}
                                </p>
                            )}
                            {contact.position && !contact.company && (
                                <p className="text-gray-600">{contact.position}</p>
                            )}
                            {!contact.position && contact.company && (
                                <p className="text-gray-600">{contact.company}</p>
                            )}
                        </div>
                    </div>

                    {/* Contact Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <h4 className="text-lg font-medium text-gray-900 border-b pb-2">Contact Information</h4>

                            {contact.email && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-500">Email</label>
                                    <div className="flex items-center space-x-2">
                                        <button
                                            onClick={() => handleEmailClick(contact.email!)}
                                            className="text-primary-600 hover:text-primary-800 hover:underline transition-colors cursor-pointer"
                                            title="Click to open email client"
                                        >
                                            {contact.email}
                                        </button>
                                        <button
                                            onClick={() => copyToClipboard(contact.email!, 'Email')}
                                            className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                                            title="Copy email to clipboard"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            )}

                            {contact.phone && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-500">Phone</label>
                                    <div className="flex items-center space-x-2">
                                        <span className="text-gray-900">{formatPhoneNumber(contact.phone)}</span>
                                        <button
                                            onClick={() => copyToClipboard(contact.phone!, 'Phone')}
                                            className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                                            title="Copy phone to clipboard"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            )}

                            {contact.company && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-500">Company</label>
                                    <div className="flex items-center space-x-2">
                                        <span className="text-gray-900">{contact.company}</span>
                                        <button
                                            onClick={() => copyToClipboard(contact.company!, 'Company')}
                                            className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                                            title="Copy company to clipboard"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            )}

                            {contact.position && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-500">Position</label>
                                    <p className="text-gray-900">{contact.position}</p>
                                </div>
                            )}
                        </div>

                        <div className="space-y-4">
                            <h4 className="text-lg font-medium text-gray-900 border-b pb-2">Details</h4>

                            <div>
                                <label className="block text-sm font-medium text-gray-500">Created</label>
                                <p className="text-gray-900">{formatDate(contact.createdAt)}</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-500">Last Updated</label>
                                <p className="text-gray-900">{formatDate(contact.updatedAt)}</p>
                            </div>

                            {contact.tags.length > 0 && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-500">Tags</label>
                                    <div className="flex flex-wrap gap-2 mt-1">
                                        {contact.tags.map((tag, index) => (
                                            <span
                                                key={index}
                                                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800"
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Notes */}
                    {contact.notes && (
                        <div>
                            <h4 className="text-lg font-medium text-gray-900 border-b pb-2 mb-3">Notes</h4>
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <p className="text-gray-700 whitespace-pre-wrap">{contact.notes}</p>
                            </div>
                        </div>
                    )}

                    {/* Interaction History */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <h4 className="text-lg font-medium text-gray-900 border-b pb-2">Interaction History</h4>
                            <button
                                onClick={() => openInteractionForm()}
                                className="px-3 py-1 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-700 transition-colors"
                            >
                                + Add
                            </button>
                        </div>

                        {loadingInteractions ? (
                            <div className="bg-gray-50 p-4 rounded-lg text-center">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600 mx-auto mb-2"></div>
                                <p className="text-gray-500 text-sm">Loading interactions...</p>
                            </div>
                        ) : interactions.length === 0 ? (
                            <div className="bg-gray-50 p-4 rounded-lg text-center">
                                <p className="text-gray-500 text-sm mb-3">No interactions recorded yet</p>
                                <button
                                    onClick={() => openInteractionForm()}
                                    className="px-4 py-2 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-700 transition-colors"
                                >
                                    Record First Interaction
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {interactions.map((interaction) => (
                                    <div key={interaction.id} className="bg-gray-50 p-4 rounded-lg border-l-4 border-primary-500">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-2 mb-2">
                                                    <span className="text-sm font-medium text-gray-900">
                                                        {interaction.type === 'call' && '📞'}
                                                        {interaction.type === 'meeting' && '🤝'}
                                                        {interaction.type === 'email' && '📧'}
                                                        {interaction.type === 'note' && '📝'}
                                                        {interaction.type === 'follow-up' && '⏰'}
                                                        {interaction.type.charAt(0).toUpperCase() + interaction.type.slice(1)}
                                                    </span>
                                                    <span className="text-xs text-gray-500">
                                                        {formatDate(interaction.date)}
                                                    </span>
                                                </div>
                                                <p className="text-gray-700 text-sm whitespace-pre-wrap">{interaction.notes}</p>
                                            </div>
                                            <div className="flex items-center space-x-1 ml-3">
                                                <button
                                                    onClick={() => openInteractionForm(interaction)}
                                                    className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded transition-colors"
                                                    title="Edit interaction"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteInteraction(interaction.id)}
                                                    className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                                    title="Delete interaction"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex justify-between pt-4 border-t">
                        <div className="flex space-x-3">
                            <button
                                onClick={onEdit}
                                className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors"
                            >
                                Edit Contact
                            </button>

                            <button
                                onClick={() => setShowDeleteConfirm(true)}
                                className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                            >
                                Delete Contact
                            </button>
                        </div>

                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium"
                        >
                            Close
                        </button>
                    </div>
                </div>

                {/* Delete Confirmation Modal */}
                {showDeleteConfirm && (
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Delete Contact</h3>
                            <p className="text-gray-600 mb-6">
                                Are you sure you want to delete <strong>{contact.firstName} {contact.lastName}</strong>?
                                This action cannot be undone.
                            </p>

                            <div className="flex justify-end space-x-3">
                                <button
                                    onClick={() => setShowDeleteConfirm(false)}
                                    className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => {
                                        onDelete();
                                        setShowDeleteConfirm(false);
                                    }}
                                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Interaction Form Modal */}
            <InteractionForm
                interaction={selectedInteraction}
                contactId={contact.id}
                contactName={`${contact.firstName} ${contact.lastName}`}
                onSubmit={selectedInteraction ? handleUpdateInteraction : handleAddInteraction}
                onCancel={closeInteractionForm}
                isOpen={isInteractionFormOpen}
                onCreateFollowUpTask={handleCreateFollowUpTask}
            />
        </div>
    );
};

export default ContactDetail; 
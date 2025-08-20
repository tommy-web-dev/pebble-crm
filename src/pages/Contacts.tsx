import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAppStore } from '../contexts/AppContext';
import { useSettings } from '../contexts/SettingsContext';
import { useAuth } from '../contexts/AuthContext';
import { Contact } from '../types';
import { getContacts, addContact, updateContact, deleteContact } from '../utils/firebase';
import ContactForm from '../components/ContactForm';
import ContactDetail from '../components/ContactDetail';
import ContactSkeleton from '../components/ContactSkeleton';

const Contacts: React.FC = () => {
    const { contacts, setContacts, addContact: addContactToStore, updateContact: updateContactInStore, deleteContact: deleteContactFromStore } = useAppStore();
    const { currentUser } = useAuth();
    const { formatPhoneNumber } = useSettings();

    const [loading, setLoading] = useState(true);
    const [initialLoadComplete, setInitialLoadComplete] = useState(false);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTag, setSelectedTag] = useState('');
    const [sortBy, setSortBy] = useState<'name' | 'company' | 'createdAt'>('name');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

    // Load contacts from Firebase when component mounts
    useEffect(() => {
        if (currentUser) {
            const loadContacts = async () => {
                try {
                    setLoading(true);
                    const firebaseContacts = await getContacts(currentUser.uid);
                    // Replace all contacts in the store instead of adding them
                    setContacts(firebaseContacts);
                } catch (error) {
                    console.error('Error loading contacts:', error);
                } finally {
                    setLoading(false);
                    setInitialLoadComplete(true);
                }
            };
            loadContacts();
        }
    }, [currentUser, setContacts]);

    // Filter and sort contacts
    const filteredContacts = useMemo(() => {
        let filtered = contacts.filter(contact => {
            const matchesSearch = searchTerm === '' ||
                contact.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                contact.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (contact.email && contact.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (contact.company && contact.company.toLowerCase().includes(searchTerm.toLowerCase()));

            const matchesTag = selectedTag === '' ||
                (contact.tags && contact.tags.includes(selectedTag));

            return matchesSearch && matchesTag;
        });

        // Sort contacts
        filtered.sort((a, b) => {
            let aValue: string | Date;
            let bValue: string | Date;

            switch (sortBy) {
                case 'name':
                    aValue = `${a.firstName} ${a.lastName}`.toLowerCase();
                    bValue = `${b.firstName} ${b.lastName}`.toLowerCase();
                    break;
                case 'company':
                    aValue = (a.company || '').toLowerCase();
                    bValue = (b.company || '').toLowerCase();
                    break;
                case 'createdAt':
                    aValue = a.createdAt;
                    bValue = b.createdAt;
                    break;
                default:
                    aValue = a.firstName.toLowerCase();
                    bValue = b.firstName.toLowerCase();
            }

            if (sortOrder === 'asc') {
                return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
            } else {
                return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
            }
        });

        return filtered;
    }, [contacts, searchTerm, selectedTag, sortBy, sortOrder]);

    // Get all unique tags
    const allTags = useMemo(() => {
        const tags = new Set<string>();
        contacts.forEach(contact => {
            if (contact.tags) {
                contact.tags.forEach(tag => tags.add(tag));
            }
        });
        return Array.from(tags).sort();
    }, [contacts]);

    const handleAddNewContact = useCallback(() => {
        setSelectedContact(null);
        setIsFormOpen(true);
    }, []);

    const handleAddContact = useCallback(async (contactData: Omit<Contact, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
        if (!currentUser) return;

        try {
            setLoading(true);
            // Add to Firebase only - DataLoader will automatically update the store
            await addContact({
                ...contactData,
                userId: currentUser.uid
            });

            setIsFormOpen(false);
        } catch (error: any) {
            console.error('Error adding contact:', error);
            alert(`Failed to add contact: ${error.message || 'Unknown error'}`);
        } finally {
            setLoading(false);
        }
    }, [currentUser]);

    const handleUpdateContact = useCallback(async (contactData: Omit<Contact, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
        if (!selectedContact) return;

        try {
            setLoading(true);
            // Update in Firebase only - DataLoader will automatically update the store
            await updateContact(selectedContact.id, contactData);

            setIsFormOpen(false);
            setSelectedContact(null);
        } catch (error: any) {
            console.error('Error updating contact:', error);
            alert(`Failed to update contact: ${error.message || 'Unknown error'}`);
        } finally {
            setLoading(false);
        }
    }, [selectedContact]);

    const handleDeleteContact = useCallback(async (contactId: string) => {
        try {
            setLoading(true);
            // Delete from Firebase only - DataLoader will automatically update the store
            await deleteContact(contactId);
            setIsDetailOpen(false);
            setSelectedContact(null);
        } catch (error: any) {
            console.error('Error deleting contact:', error);
            alert(`Failed to delete contact: ${error.message || 'Unknown error'}`);
        } finally {
            setLoading(false);
        }
    }, []);

    const handleViewContact = useCallback((contact: Contact) => {
        setSelectedContact(contact);
        setIsDetailOpen(true);
    }, []);

    const handleFormCancel = useCallback(() => {
        setIsFormOpen(false);
    }, []);

    const formatDate = (date: Date | any) => {
        if (!date) return 'No date';
        let dateObj = date;
        if (date && typeof date === 'object' && 'toDate' in date) {
            dateObj = date.toDate();
        } else if (date && typeof date === 'string') {
            dateObj = new Date(date);
        }
        return dateObj instanceof Date ? dateObj.toLocaleDateString() : 'Invalid date';
    };

    // Show skeleton while loading initially
    if (loading && !initialLoadComplete) {
        return (
            <div className="space-y-6">
                <ContactSkeleton />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                    <div className="space-y-2">
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 bg-clip-text text-transparent">
                            Clients
                        </h1>
                        <p className="text-lg text-slate-600 font-medium">Manage your client companies and hiring managers</p>
                    </div>
                    <div className="flex items-center space-x-3">
                        <button
                            onClick={handleAddNewContact}
                            className="group inline-flex items-center px-6 py-3 bg-gradient-to-r from-slate-600 to-blue-600 text-white text-sm font-semibold rounded-xl hover:from-slate-700 hover:to-blue-700 focus:ring-4 focus:ring-blue-500/20 focus:ring-offset-2 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
                            disabled={loading}
                        >
                            <svg className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            Add Contact
                        </button>
                    </div>
                </div>

                {/* Search and Filters */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        {/* Search */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-slate-700 mb-3">Search</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Search by name, company, or email..."
                                    className="block w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm"
                                />
                            </div>
                        </div>

                        {/* Tag Filter */}
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-3">Filter by Tag</label>
                            <select
                                value={selectedTag}
                                onChange={(e) => setSelectedTag(e.target.value)}
                                className="block w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm"
                            >
                                <option value="">All Tags</option>
                                {allTags.map(tag => (
                                    <option key={tag} value={tag}>{tag}</option>
                                ))}
                            </select>
                        </div>

                        {/* Sort */}
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-3">Sort By</label>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value as 'name' | 'company' | 'createdAt')}
                                className="block w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm"
                            >
                                <option value="name">Name</option>
                                <option value="company">Company</option>
                                <option value="createdAt">Date Created</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Contacts Table */}
                {filteredContacts.length > 0 ? (
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-200">
                                <thead className="bg-gradient-to-r from-slate-50 to-blue-50">
                                    <tr>
                                        <th className="px-8 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                                            Contact
                                        </th>
                                        <th className="px-8 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                                            Company
                                        </th>
                                        <th className="px-8 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                                            Email
                                        </th>
                                        <th className="px-8 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                                            Phone
                                        </th>
                                        <th className="px-8 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                                            Tags
                                        </th>
                                        <th className="px-8 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-slate-100">
                                    {filteredContacts.map((contact) => (
                                        <tr key={contact.id} className="hover:bg-slate-50 transition-colors duration-200">
                                            <td className="px-8 py-6 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-12 w-12">
                                                        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-slate-100 to-blue-200 flex items-center justify-center">
                                                            <span className="text-lg font-semibold text-slate-600">
                                                                {contact.firstName.charAt(0)}{contact.lastName.charAt(0)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-semibold text-slate-900">
                                                            {contact.firstName} {contact.lastName}
                                                        </div>
                                                        <div className="text-sm text-slate-500">
                                                            Created {formatDate(contact.createdAt)}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 whitespace-nowrap">
                                                <div className="text-sm text-slate-900 font-medium">{contact.company || '-'}</div>
                                            </td>
                                            <td className="px-8 py-6 whitespace-nowrap">
                                                <div className="text-sm text-blue-600 font-medium">{contact.email}</div>
                                            </td>
                                            <td className="px-8 py-6 whitespace-nowrap">
                                                <div className="text-sm text-slate-900">{contact.phone ? formatPhoneNumber(contact.phone) : '-'}</div>
                                            </td>
                                            <td className="px-8 py-6 whitespace-nowrap">
                                                <div className="flex flex-wrap gap-2">
                                                    {contact.tags && contact.tags.length > 0 ? (
                                                        contact.tags.map((tag, index) => (
                                                            <span
                                                                key={index}
                                                                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200"
                                                            >
                                                                {tag}
                                                            </span>
                                                        ))
                                                    ) : (
                                                        <span className="text-sm text-slate-400">No tags</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 whitespace-nowrap text-sm font-medium">
                                                <div className="flex items-center space-x-3">
                                                    <button
                                                        onClick={() => handleViewContact(contact)}
                                                        className="text-blue-600 hover:text-blue-900 font-semibold transition-colors duration-200"
                                                    >
                                                        View
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteContact(contact.id)}
                                                        className="text-red-600 hover:text-red-900 font-semibold transition-colors duration-200"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-12 text-center">
                        <div className="text-6xl mb-4">👥</div>
                        <h3 className="text-2xl font-bold text-slate-900 mb-3">No Contacts Found</h3>
                        <p className="text-slate-600 mb-6 text-lg">
                            {searchTerm || selectedTag ? 'Try adjusting your search or filters.' : 'Start building your contact list by adding your first contact.'}
                        </p>
                        {!searchTerm && !selectedTag && (
                            <button
                                onClick={handleAddNewContact}
                                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-slate-600 to-blue-600 text-white text-lg font-semibold rounded-xl hover:from-slate-700 hover:to-blue-700 focus:ring-4 focus:ring-blue-500/20 focus:ring-offset-2 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
                            >
                                <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                Add Your First Contact
                            </button>
                        )}
                    </div>
                )}

                {/* Contact Form Modal */}
                <ContactForm
                    key={selectedContact?.id || 'new'}
                    contact={selectedContact}
                    onSubmit={selectedContact ? handleUpdateContact : handleAddContact}
                    onCancel={handleFormCancel}
                    isOpen={isFormOpen}
                />

                {/* Contact Detail Modal */}
                {selectedContact && isDetailOpen && (
                    <ContactDetail
                        contact={selectedContact}
                        onClose={() => setIsDetailOpen(false)}
                        onEdit={() => {
                            setIsDetailOpen(false);
                            setIsFormOpen(true);
                        }}
                        onDelete={() => handleDeleteContact(selectedContact.id)}
                    />
                )}
            </div>
        </div>
    );
};

export default Contacts; 
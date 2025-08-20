import React, { useState, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useAppStore } from '../contexts/AppContext';
import { Contact, Task } from '../types';
import { addContact, updateContact } from '../utils/firebase';
import ContactForm from '../components/ContactForm';
import ContactDetail from '../components/ContactDetail';

const Candidates: React.FC = () => {
    const { currentUser } = useAuth();
    const { contacts, tasks } = useAppStore();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [sortBy, setSortBy] = useState<'firstName' | 'lastName' | 'email' | 'company' | 'createdAt'>('firstName');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const [isContactFormOpen, setIsContactFormOpen] = useState(false);
    const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);

    // Filter contacts to show only candidates (you can add logic here to distinguish candidates from clients)
    const candidates = contacts.filter(contact =>
        // For now, treat all contacts as candidates - you can add specific logic later
        true
    );

    // Summary metrics for candidates
    const summaryMetrics = useMemo(() => {
        const total = candidates.length;
        const active = candidates.filter(c => c.tags && c.tags.includes('active')).length;
        const placed = candidates.filter(c => c.tags && c.tags.includes('placed')).length;
        const interviewing = candidates.filter(c => c.tags && c.tags.includes('interviewing')).length;

        return { total, active, placed, interviewing };
    }, [candidates]);

    // Filtered and sorted candidates
    const filteredCandidates = useMemo(() => {
        let filtered = [...candidates];

        // Filter by search term
        if (searchTerm) {
            filtered = filtered.filter(candidate =>
                candidate.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                candidate.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                candidate.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                candidate.company?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Filter by status
        if (selectedStatus !== 'all') {
            switch (selectedStatus) {
                case 'active':
                    filtered = filtered.filter(c => c.tags && c.tags.includes('active'));
                    break;
                case 'placed':
                    filtered = filtered.filter(c => c.tags && c.tags.includes('placed'));
                    break;
                case 'interviewing':
                    filtered = filtered.filter(c => c.tags && c.tags.includes('interviewing'));
                    break;
            }
        }

        // Sort candidates
        filtered.sort((a, b) => {
            let aValue: any, bValue: any;

            switch (sortBy) {
                case 'firstName':
                    aValue = a.firstName.toLowerCase();
                    bValue = b.firstName.toLowerCase();
                    break;
                case 'lastName':
                    aValue = a.lastName.toLowerCase();
                    bValue = b.lastName.toLowerCase();
                    break;
                case 'email':
                    aValue = a.email?.toLowerCase() || '';
                    bValue = b.email?.toLowerCase() || '';
                    break;
                case 'company':
                    aValue = a.company?.toLowerCase() || '';
                    bValue = b.company?.toLowerCase() || '';
                    break;
                case 'createdAt':
                    aValue = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                    bValue = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                    break;
                default:
                    return 0;
            }

            if (sortOrder === 'asc') {
                return aValue > bValue ? 1 : -1;
            } else {
                return aValue < bValue ? 1 : -1;
            }
        });

        return filtered;
    }, [candidates, searchTerm, selectedStatus, sortBy, sortOrder]);

    const handleAddCandidate = () => {
        setSelectedContact(null);
        setIsContactFormOpen(true);
    };

    const handleEditCandidate = (candidate: Contact) => {
        setSelectedContact(candidate);
        setIsContactFormOpen(true);
    };

    const handleViewCandidate = (candidate: Contact) => {
        setSelectedContact(candidate);
        setIsDetailOpen(true);
    };

    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString();
    };

    if (!currentUser) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-slate-900 mb-4">Please log in to view candidates</h1>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">Candidates</h1>
                    <p className="text-slate-600">Manage your candidate pipeline and track their progress</p>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-2xl p-6 shadow-lg border border-white/20">
                        <div className="flex items-center">
                            <div className="p-3 bg-blue-100 rounded-xl">
                                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-slate-600">Total Candidates</p>
                                <p className="text-2xl font-bold text-slate-900">{summaryMetrics.total}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-lg border border-white/20">
                        <div className="flex items-center">
                            <div className="p-3 bg-green-100 rounded-xl">
                                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-slate-600">Active</p>
                                <p className="text-2xl font-bold text-slate-900">{summaryMetrics.active}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-lg border border-white/20">
                        <div className="flex items-center">
                            <div className="p-3 bg-purple-100 rounded-xl">
                                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-slate-600">Interviewing</p>
                                <p className="text-2xl font-bold text-slate-900">{summaryMetrics.interviewing}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-lg border border-white/20">
                        <div className="flex items-center">
                            <div className="p-3 bg-emerald-100 rounded-xl">
                                <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-slate-600">Placed</p>
                                <p className="text-2xl font-bold text-slate-900">{summaryMetrics.placed}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Search and Filter Section */}
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-white/20 mb-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                            <input
                                type="text"
                                placeholder="Search candidates by name, email, or company..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                            />
                        </div>
                        <div className="flex gap-4">
                            <select
                                value={selectedStatus}
                                onChange={(e) => setSelectedStatus(e.target.value)}
                                className="px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                            >
                                <option value="all">All Status</option>
                                <option value="active">Active</option>
                                <option value="interviewing">Interviewing</option>
                                <option value="placed">Placed</option>
                            </select>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value as any)}
                                className="px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                            >
                                <option value="firstName">First Name</option>
                                <option value="lastName">Last Name</option>
                                <option value="email">Email</option>
                                <option value="company">Company</option>
                                <option value="createdAt">Date Added</option>
                            </select>
                            <button
                                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                                className="px-4 py-3 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors duration-200"
                            >
                                {sortOrder === 'asc' ? '↑' : '↓'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Candidates Table */}
                {filteredCandidates.length > 0 ? (
                    <div className="bg-white rounded-2xl shadow-lg border border-white/20 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-200">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                            Candidate
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                            Company
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                            Position
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                            Date Added
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-slate-200">
                                    {filteredCandidates.map((candidate) => (
                                        <tr key={candidate.id} className="hover:bg-slate-50 transition-colors duration-200">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-10 w-10">
                                                        <div className="h-10 w-10 rounded-full bg-gradient-to-r from-slate-600 to-blue-600 flex items-center justify-center">
                                                            <span className="text-sm font-medium text-white">
                                                                {candidate.firstName[0]}{candidate.lastName[0]}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-slate-900">
                                                            {candidate.firstName} {candidate.lastName}
                                                        </div>
                                                        <div className="text-sm text-slate-500">{candidate.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                                                {candidate.company || 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                                                {candidate.position || 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${candidate.tags && candidate.tags.includes('placed')
                                                        ? 'bg-green-100 text-green-800'
                                                        : candidate.tags && candidate.tags.includes('interviewing')
                                                            ? 'bg-purple-100 text-purple-800'
                                                            : 'bg-blue-100 text-blue-800'
                                                    }`}>
                                                    {candidate.tags && candidate.tags.includes('placed') ? 'Placed' :
                                                        candidate.tags && candidate.tags.includes('interviewing') ? 'Interviewing' : 'Active'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                                                {formatDate(candidate.createdAt)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <div className="flex space-x-2">
                                                    <button
                                                        onClick={() => handleViewCandidate(candidate)}
                                                        className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-100 rounded transition-colors duration-200"
                                                        title="View details"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                        </svg>
                                                    </button>
                                                    <button
                                                        onClick={() => handleEditCandidate(candidate)}
                                                        className="text-indigo-600 hover:text-indigo-900 p-1 hover:bg-indigo-100 rounded transition-colors duration-200"
                                                        title="Edit candidate"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                        </svg>
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
                        <h3 className="text-2xl font-bold text-slate-900 mb-3">No candidates found</h3>
                        <p className="text-slate-600 mb-6 text-lg">
                            {searchTerm || selectedStatus !== 'all'
                                ? 'Try adjusting your search or filter criteria.'
                                : 'Start building your candidate pipeline by adding your first candidate.'}
                        </p>
                        {!searchTerm && selectedStatus === 'all' && (
                            <button
                                onClick={handleAddCandidate}
                                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-slate-600 to-blue-600 text-white text-lg font-semibold rounded-xl hover:from-slate-700 hover:to-blue-700 focus:ring-4 focus:ring-blue-500/20 focus:ring-offset-2 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
                            >
                                <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                Add Your First Candidate
                            </button>
                        )}
                    </div>
                )}

                {/* Add Candidate Button */}
                {filteredCandidates.length > 0 && (
                    <div className="mt-6 text-center">
                        <button
                            onClick={handleAddCandidate}
                            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-slate-600 to-blue-600 text-white font-semibold rounded-xl hover:from-slate-700 hover:to-blue-700 focus:ring-4 focus:ring-blue-500/20 focus:ring-offset-2 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            Add New Candidate
                        </button>
                    </div>
                )}

                {/* Contact Form Modal */}
                <ContactForm
                    contact={selectedContact}
                    onSubmit={async (contactData) => {
                        try {
                            if (selectedContact) {
                                // Update existing candidate
                                await updateContact(selectedContact.id, contactData);
                            } else {
                                // Add new candidate
                                await addContact({
                                    ...contactData,
                                    userId: currentUser!.uid
                                });
                            }
                            setIsContactFormOpen(false);
                            setSelectedContact(null);
                        } catch (error) {
                            console.error('Error saving candidate:', error);
                            alert('Failed to save candidate. Please try again.');
                        }
                    }}
                    onCancel={() => {
                        setIsContactFormOpen(false);
                        setSelectedContact(null);
                    }}
                    isOpen={isContactFormOpen}
                />

                {/* Contact Detail Modal */}
                <ContactDetail
                    contact={selectedContact}
                    isOpen={isDetailOpen}
                    onClose={() => {
                        setIsDetailOpen(false);
                        setSelectedContact(null);
                    }}
                />
            </div>
        </div>
    );
};

export default Candidates; 
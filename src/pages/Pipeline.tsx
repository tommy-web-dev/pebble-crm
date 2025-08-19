import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAppStore } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';
import { getContacts, getDeals, addDeal, updateDeal, deleteDeal } from '../utils/firebase';
import { Contact, Deal } from '../types';
import DealForm from '../components/DealForm';

const Pipeline: React.FC = () => {
    const { currentUser } = useAuth();
    const { deals, setDeals, addDeal: addDealToStore, updateDeal: updateDealInStore, deleteDeal: deleteDealFromStore } = useAppStore();
    const { formatCurrency } = useSettings();

    const [contacts, setContacts] = useState<Contact[]>([]);
    const [loadingDeals, setLoadingDeals] = useState(true);
    const [isDealFormOpen, setIsDealFormOpen] = useState(false);
    const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
    const [showDealMenu, setShowDealMenu] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStage, setSelectedStage] = useState('');
    const [sortBy, setSortBy] = useState<'title' | 'contact' | 'value' | 'probability' | 'expectedCloseDate' | 'stage' | 'createdAt'>('title');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

    // Load deals from Firebase when component mounts
    useEffect(() => {
        if (currentUser) {
            const loadDeals = async () => {
                try {
                    setLoadingDeals(true);
                    const firebaseDeals = await getDeals(currentUser!.uid);
                    setDeals(firebaseDeals);
                } catch (error) {
                    console.error('Error loading deals:', error);
                } finally {
                    setLoadingDeals(false);
                }
            };
            loadDeals();
        }
    }, [currentUser, setDeals]);

    // Load contacts for deal creation
    useEffect(() => {
        if (currentUser) {
            const loadContacts = async () => {
                try {
                    const loadedContacts = await getContacts(currentUser.uid);
                    setContacts(loadedContacts);
                } catch (error) {
                    console.error('Error loading contacts for deals:', error);
                }
            };
            loadContacts();
        }
    }, [currentUser]);

    const stages = [
        { id: 'lead', name: 'Lead', color: 'bg-gray-500' },
        { id: 'negotiating', name: 'Negotiating', color: 'bg-orange-500' },
        { id: 'live-opportunity', name: 'Live Opportunity', color: 'bg-blue-500' },
        { id: 'closed-won', name: 'Closed Won', color: 'bg-green-500' },
        { id: 'closed-lost', name: 'Closed Lost', color: 'bg-red-500' },
    ];

    // Normalize stage names to handle any case/spelling variations
    const normalizeStage = (stage: string) => {
        const stageLower = stage.toLowerCase();
        if (stageLower.includes('negotiat')) return 'negotiating';
        if (stageLower.includes('lead')) return 'lead';
        if (stageLower.includes('live') || stageLower.includes('opportunity')) return 'live-opportunity';
        if (stageLower.includes('closed') && stageLower.includes('won')) return 'closed-won';
        if (stageLower.includes('closed') && stageLower.includes('lost')) return 'closed-lost';
        return stage; // Return original if no match
    };

    const getDealsByStage = (stageId: string) => {
        return deals.filter(deal => {
            const normalizedStage = normalizeStage(deal.stage);
            return normalizedStage === stageId;
        });
    };

    const getContactName = (contactId: string): string => {
        const contact = contacts.find(c => c.id === contactId);
        return contact ? `${contact.firstName} ${contact.lastName}` : 'Unknown Contact';
    };

    // Calculate summary metrics
    const summaryMetrics = useMemo(() => {
        const closedWon = getDealsByStage('closed-won');
        const closedLost = getDealsByStage('closed-lost');

        const totalWonValue = closedWon.reduce((sum, deal) => sum + (deal.value || 0), 0);
        const totalLostValue = closedLost.reduce((sum, deal) => sum + (deal.value || 0), 0);

        return {
            closedWon: {
                count: closedWon.length,
                value: totalWonValue
            },
            closedLost: {
                count: closedLost.length,
                value: totalLostValue
            }
        };
    }, [deals]);

    // Filter and sort deals for the table
    const filteredDeals = useMemo(() => {
        let filtered = deals.filter(deal => {
            const matchesSearch = searchTerm === '' ||
                deal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                getContactName(deal.contactId).toLowerCase().includes(searchTerm.toLowerCase());

            const matchesStage = selectedStage === '' || normalizeStage(deal.stage) === selectedStage;

            return matchesSearch && matchesStage;
        });

        // Sort deals
        filtered.sort((a, b) => {
            let aValue: string | number | Date;
            let bValue: string | number | Date;

            switch (sortBy) {
                case 'title':
                    aValue = a.title.toLowerCase();
                    bValue = b.title.toLowerCase();
                    break;
                case 'contact':
                    aValue = getContactName(a.contactId).toLowerCase();
                    bValue = getContactName(b.contactId).toLowerCase();
                    break;
                case 'value':
                    aValue = a.value || 0;
                    bValue = b.value || 0;
                    break;
                case 'probability':
                    aValue = a.probability || 0;
                    bValue = b.probability || 0;
                    break;
                case 'expectedCloseDate':
                    aValue = a.expectedCloseDate ? new Date(a.expectedCloseDate).getTime() : 0;
                    bValue = b.expectedCloseDate ? new Date(b.expectedCloseDate).getTime() : 0;
                    break;
                case 'stage':
                    aValue = normalizeStage(a.stage);
                    bValue = normalizeStage(b.stage);
                    break;
                case 'createdAt':
                    aValue = a.createdAt;
                    bValue = b.createdAt;
                    break;
                default:
                    aValue = a.title.toLowerCase();
                    bValue = b.title.toLowerCase();
            }

            if (sortOrder === 'asc') {
                return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
            } else {
                return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
            }
        });

        return filtered;
    }, [deals, searchTerm, selectedStage, sortBy, sortOrder, contacts]);

    const handleSubmit = async (dealData: Omit<Deal, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
        if (!currentUser) return;

        try {
            if (selectedDeal) {
                // Update existing deal
                await updateDeal(selectedDeal.id, dealData);
            } else {
                // Create new deal
                await addDeal({
                    ...dealData,
                    userId: currentUser.uid
                });
            }

            setIsDealFormOpen(false);
            setSelectedDeal(null);
        } catch (error) {
            console.error('Error saving deal:', error);
            alert('Failed to save deal. Please try again.');
        }
    };

    const handleUpdateDeal = async (dealId: string, updates: Partial<Deal>) => {
        if (!currentUser) return;

        try {
            // Update in Firebase only - DataLoader will automatically update the store
            await updateDeal(dealId, updates);
            setShowDealMenu(null);
        } catch (error) {
            console.error('Error updating deal:', error);
            alert('Failed to update deal. Please try again.');
        }
    };

    const handleDeleteDeal = async (dealId: string) => {
        if (!currentUser) return;

        if (window.confirm('Are you sure you want to delete this deal?')) {
            try {
                // Delete from Firebase only - DataLoader will automatically update the store
                await deleteDeal(dealId);
                setShowDealMenu(null);
            } catch (error) {
                console.error('Error deleting deal:', error);
                alert('Failed to delete deal. Please try again.');
            }
        }
    };

    const handleAddNewDeal = () => {
        setSelectedDeal(null);
        setIsDealFormOpen(true);
    };

    const handleEditDeal = (deal: Deal) => {
        setSelectedDeal(deal);
        setIsDealFormOpen(true);
    };

    const getStageColor = (stage: string) => {
        const normalizedStage = normalizeStage(stage);
        const stageConfig = stages.find(s => s.id === normalizedStage);
        return stageConfig ? stageConfig.color : 'bg-gray-500';
    };

    const getStageName = (stage: string) => {
        const normalizedStage = normalizeStage(stage);
        const stageConfig = stages.find(s => s.id === normalizedStage);
        return stageConfig ? stageConfig.name : stage;
    };

    if (loadingDeals) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
                <div className="max-w-7xl mx-auto">
                    <div className="animate-pulse">
                        <div className="h-8 bg-slate-200 rounded w-1/4 mb-4"></div>
                        <div className="h-4 bg-slate-200 rounded w-1/2 mb-8"></div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                            <div className="h-32 bg-slate-200 rounded-lg"></div>
                            <div className="h-32 bg-slate-200 rounded-lg"></div>
                        </div>
                        <div className="h-96 bg-slate-200 rounded-lg"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900 mb-2">Pipeline</h1>
                            <p className="text-lg text-slate-600 font-medium">Track your opportunities and deals</p>
                        </div>
                        <div className="flex items-center space-x-3 mt-4 sm:mt-0">
                            <button
                                onClick={handleAddNewDeal}
                                className="group inline-flex items-center px-6 py-3 bg-gradient-to-r from-slate-600 to-blue-600 text-white text-sm font-semibold rounded-xl hover:from-slate-700 hover:to-blue-700 focus:ring-4 focus:ring-blue-500/20 focus:ring-offset-2 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
                            >
                                <svg className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                Add Opportunity
                            </button>
                        </div>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    {/* Closed Won Card */}
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-600">Closed Won</p>
                                <p className="text-3xl font-bold text-green-600">{summaryMetrics.closedWon.count}</p>
                                <p className="text-lg text-green-700 font-semibold">{formatCurrency(summaryMetrics.closedWon.value)}</p>
                            </div>
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Closed Lost Card */}
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-600">Closed Lost</p>
                                <p className="text-3xl font-bold text-red-600">{summaryMetrics.closedLost.count}</p>
                                <p className="text-lg text-red-700 font-semibold">{formatCurrency(summaryMetrics.closedLost.value)}</p>
                            </div>
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Search and Filters */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-8 mb-8">
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
                                    placeholder="Search by title or contact..."
                                    className="block w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm"
                                />
                            </div>
                        </div>

                        {/* Stage Filter */}
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-3">Filter by Stage</label>
                            <select
                                value={selectedStage}
                                onChange={(e) => setSelectedStage(e.target.value)}
                                className="block w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm"
                            >
                                <option value="">All Stages</option>
                                {stages.map(stage => (
                                    <option key={stage.id} value={stage.id}>{stage.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Sort */}
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-3">Sort By</label>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value as 'title' | 'contact' | 'value' | 'probability' | 'expectedCloseDate' | 'stage' | 'createdAt')}
                                className="block w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm"
                            >
                                <option value="title">Title</option>
                                <option value="contact">Contact</option>
                                <option value="value">Value</option>
                                <option value="probability">Probability</option>
                                <option value="expectedCloseDate">Expected Close</option>
                                <option value="stage">Stage</option>
                                <option value="createdAt">Date Created</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Deals Table */}
                {filteredDeals.length > 0 ? (
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-200">
                                <thead className="bg-gradient-to-r from-slate-50 to-blue-50">
                                    <tr>
                                        <th className="px-8 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                                            Opportunity
                                        </th>
                                        <th className="px-8 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                                            Contact
                                        </th>
                                        <th className="px-8 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                                            Value
                                        </th>
                                        <th className="px-8 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                                            Probability
                                        </th>
                                        <th className="px-8 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                                            Expected Close
                                        </th>
                                        <th className="px-8 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                                            Stage
                                        </th>
                                        <th className="px-8 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-slate-100">
                                    {filteredDeals.map((deal) => (
                                        <tr key={deal.id} className="hover:bg-slate-50 transition-colors duration-200">
                                            <td className="px-8 py-6 whitespace-nowrap">
                                                <div>
                                                    <div className="text-sm font-medium text-slate-900">{deal.title}</div>
                                                    <div className="text-sm text-slate-500">{deal.notes}</div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 whitespace-nowrap">
                                                <div className="text-sm text-slate-900">{getContactName(deal.contactId)}</div>
                                            </td>
                                            <td className="px-8 py-6 whitespace-nowrap">
                                                <div className="text-sm font-medium text-slate-900">{formatCurrency(deal.value || 0)}</div>
                                            </td>
                                            <td className="px-8 py-6 whitespace-nowrap">
                                                <div className="text-sm text-slate-900">{deal.probability}%</div>
                                            </td>
                                            <td className="px-8 py-6 whitespace-nowrap">
                                                <div className="text-sm text-slate-900">
                                                    {deal.expectedCloseDate ? new Date(deal.expectedCloseDate).toLocaleDateString() : '-'}
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 whitespace-nowrap">
                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStageColor(deal.stage)} text-white`}>
                                                    {getStageName(deal.stage)}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6 whitespace-nowrap text-sm font-medium">
                                                <div className="relative">
                                                    <button
                                                        onClick={() => setShowDealMenu(showDealMenu === deal.id ? null : deal.id)}
                                                        className="text-slate-400 hover:text-slate-600 focus:outline-none focus:text-slate-600"
                                                    >
                                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                                                        </svg>
                                                    </button>

                                                    {showDealMenu === deal.id && (
                                                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-slate-200">
                                                            <button
                                                                onClick={() => handleEditDeal(deal)}
                                                                className="block w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
                                                            >
                                                                Edit
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteDeal(deal.id)}
                                                                className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                                            >
                                                                Delete
                                                            </button>
                                                        </div>
                                                    )}
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
                        <svg className="mx-auto h-12 w-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-slate-900">No opportunities found</h3>
                        <p className="mt-1 text-sm text-slate-500">
                            {searchTerm || selectedStage ? 'Try adjusting your search or filters.' : 'Get started by creating your first opportunity.'}
                        </p>
                        {!searchTerm && !selectedStage && (
                            <div className="mt-6">
                                <button
                                    onClick={handleAddNewDeal}
                                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                    Add Opportunity
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Deal Form Modal */}
            {isDealFormOpen && (
                <DealForm
                    isOpen={isDealFormOpen}
                    onCancel={() => setIsDealFormOpen(false)}
                    onSubmit={handleSubmit}
                    deal={selectedDeal}
                    contacts={contacts}
                />
            )}
        </div>
    );
};

export default Pipeline; 
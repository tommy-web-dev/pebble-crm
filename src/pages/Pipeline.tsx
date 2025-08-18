import React, { useState, useEffect, useMemo } from 'react';
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

    const handleAddDeal = async (dealData: Omit<Deal, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
        if (!currentUser) return;

        try {
            // Add to Firebase only - DataLoader will automatically update the store
            await addDeal({
                ...dealData,
                userId: currentUser.uid
            });

            setIsDealFormOpen(false);
        } catch (error) {
            console.error('Error adding deal:', error);
            alert('Failed to add deal. Please try again.');
        }
    };

    const handleUpdateDeal = async (dealData: Omit<Deal, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
        if (!selectedDeal) return;

        try {
            // Update in Firebase only - DataLoader will automatically update the store
            await updateDeal(selectedDeal.id, dealData);

            setIsDealFormOpen(false);
            setSelectedDeal(null);
        } catch (error) {
            console.error('Error updating deal:', error);
            alert('Failed to update deal. Please try again.');
        }
    };

    const handleDeleteDeal = async (dealId: string) => {
        try {
            // Delete from Firebase only - DataLoader will automatically update the store
            await deleteDeal(dealId);
            setShowDealMenu(null);
        } catch (error) {
            console.error('Error deleting deal:', error);
            alert('Failed to delete deal. Please try again.');
        }
    };

    const openDealForm = (deal?: Deal) => {
        setSelectedDeal(deal || null);
        setIsDealFormOpen(true);
    };

    const closeDealForm = () => {
        setIsDealFormOpen(false);
        setSelectedDeal(null);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="space-y-2">
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-gray-900 bg-clip-text text-transparent">
                            Pipeline
                        </h1>
                        <p className="text-lg text-gray-600 font-medium">Track your opportunities through the sales process.</p>
                    </div>
                    <button
                        onClick={() => openDealForm()}
                        className="group inline-flex items-center px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white text-sm font-semibold rounded-xl hover:from-emerald-700 hover:to-emerald-800 focus:ring-4 focus:ring-emerald-500/20 focus:ring-offset-2 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
                    >
                        <svg className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Add Opportunity
                    </button>
                </div>

                {loadingDeals ? (
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-12 text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-6"></div>
                        <p className="text-lg text-gray-600 font-medium">Loading pipeline...</p>
                    </div>
                ) : deals.length > 0 ? (
                    <div className="overflow-x-auto">
                        <div className="flex space-x-8 min-w-max pb-4">
                            {stages.map((stage) => {
                                const stageDeals = getDealsByStage(stage.id);
                                const stageValue = stageDeals.reduce((sum, deal) => sum + deal.value, 0);

                                return (
                                    <div key={stage.id} className="w-80 flex-shrink-0">
                                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden">
                                            <div className={`${stage.color} text-white px-6 py-4 rounded-t-2xl`}>
                                                <div className="flex items-center justify-between">
                                                    <h3 className="font-semibold text-lg">{stage.name}</h3>
                                                    <span className="text-sm bg-white bg-opacity-20 px-3 py-1 rounded-full font-medium">
                                                        {stageDeals.length}
                                                    </span>
                                                </div>
                                                {stageValue > 0 && (
                                                    <p className="text-sm mt-2 opacity-90 font-medium">
                                                        {formatCurrency(stageValue)}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="p-6 space-y-4">
                                                {stageDeals.map((deal) => (
                                                    <div
                                                        key={deal.id}
                                                        className="group bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 cursor-pointer hover:from-gray-100 hover:to-gray-200 transition-all duration-200 border border-gray-200 hover:border-gray-300 hover:shadow-md"
                                                    >
                                                        <div className="flex items-start justify-between">
                                                            <div className="flex-1">
                                                                <h4 className="font-semibold text-gray-900 text-sm mb-2 group-hover:text-gray-700 transition-colors">
                                                                    {deal.title}
                                                                </h4>
                                                                <p className="text-xs text-gray-600 mb-2 font-medium">
                                                                    {getContactName(deal.contactId)}
                                                                </p>
                                                                <p className="text-sm font-bold text-gray-900 mb-3">
                                                                    {formatCurrency(deal.value)}
                                                                </p>
                                                                <div className="flex items-center space-x-2 mb-3">
                                                                    <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                                                                    <span className="text-xs text-gray-500 font-medium">
                                                                        {deal.probability}% probability
                                                                    </span>
                                                                </div>
                                                                {deal.expectedCloseDate && (
                                                                    <p className="text-xs text-gray-500 font-medium">
                                                                        Due: {new Date(deal.expectedCloseDate).toLocaleDateString()}
                                                                    </p>
                                                                )}
                                                            </div>
                                                            <div className="relative">
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setShowDealMenu(showDealMenu === deal.id ? null : deal.id);
                                                                    }}
                                                                    className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-200 rounded-lg transition-all duration-200"
                                                                >
                                                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                                        <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                                                                    </svg>
                                                                </button>

                                                                {showDealMenu === deal.id && (
                                                                    <div className="absolute right-0 top-10 w-36 bg-white border border-gray-200 rounded-xl shadow-xl z-10 overflow-hidden">
                                                                        <button
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                openDealForm(deal);
                                                                                setShowDealMenu(null);
                                                                            }}
                                                                            className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200 flex items-center"
                                                                        >
                                                                            <span className="mr-2">✏️</span>
                                                                            Edit
                                                                        </button>
                                                                        <button
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                handleDeleteDeal(deal.id);
                                                                            }}
                                                                            className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200 flex items-center"
                                                                        >
                                                                            <span className="mr-2">🗑️</span>
                                                                            Delete
                                                                        </button>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}

                                                {stageDeals.length === 0 && (
                                                    <div className="text-center py-8 text-gray-400">
                                                        <div className="text-2xl mb-2">📭</div>
                                                        <p className="text-sm font-medium">No opportunities</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ) : (
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-12 text-center">
                        <div className="text-6xl mb-4">🎯</div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-3">No opportunities in your pipeline</h3>
                        <p className="text-gray-600 mb-6 text-lg">Start building your sales pipeline by adding your first opportunity.</p>
                        <button
                            onClick={() => openDealForm()}
                            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white text-lg font-semibold rounded-xl hover:from-emerald-700 hover:to-emerald-800 focus:ring-4 focus:ring-emerald-500/20 focus:ring-offset-2 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
                        >
                            <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            Add Opportunity
                        </button>
                    </div>
                )}

                {/* Deal Form Modal */}
                <DealForm
                    deal={selectedDeal}
                    contacts={contacts}
                    onSubmit={selectedDeal ? handleUpdateDeal : handleAddDeal}
                    onCancel={closeDealForm}
                    isOpen={isDealFormOpen}
                />
            </div>
        </div>
    );
};

export default Pipeline; 
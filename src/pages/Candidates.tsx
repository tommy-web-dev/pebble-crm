import React, { useState, useEffect, useMemo } from 'react';
import { useAppStore } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';
import { getCandidates, addCandidate, updateCandidate, getDeals } from '../utils/firebase';
import { Deal } from '../types';
import CandidateForm from '../components/CandidateForm';

interface Candidate {
    id: string;
    userId: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    type?: 'permanent' | 'contract';
    skills?: string[];
    expectedSalary?: number;
    cv?: string;
    assignedJobId?: string; // Job this candidate is assigned to
    candidateStage?: 'applied' | 'interview' | 'rejected' | 'offered' | 'placed';
    createdAt: Date;
    updatedAt: Date;
}

const Candidates: React.FC = () => {
    const { currentUser } = useAuth();
    const { formatCurrency } = useSettings();

    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [jobs, setJobs] = useState<Deal[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedType, setSelectedType] = useState('');
    const [sortBy, setSortBy] = useState<'name' | 'type' | 'expectedSalary' | 'createdAt'>('name');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const [isCandidateFormOpen, setIsCandidateFormOpen] = useState(false);
    const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
    const [showCandidateMenu, setShowCandidateMenu] = useState<string | null>(null);
    const [isCandidateDetailOpen, setIsCandidateDetailOpen] = useState(false);
    const [selectedCandidateForDetail, setSelectedCandidateForDetail] = useState<Candidate | null>(null);

    // Load candidates and jobs when component mounts
    useEffect(() => {
        if (currentUser) {
            const loadData = async () => {
                try {
                    setLoading(true);
                    const [firebaseCandidates, firebaseJobs] = await Promise.all([
                        getCandidates(currentUser.uid),
                        getDeals(currentUser.uid)
                    ]);
                    setCandidates(firebaseCandidates);
                    setJobs(firebaseJobs);
                } catch (error) {
                    console.error('Error loading data:', error);
                } finally {
                    setLoading(false);
                }
            };
            loadData();
        }
    }, [currentUser]);

    // Get unique values for filter dropdowns
    const getUniqueTypes = (): string[] => {
        const typeSet = new Set<string>();
        candidates.forEach(candidate => {
            if (candidate.type) {
                typeSet.add(candidate.type);
            }
        });
        return Array.from(typeSet).sort();
    };

    // Calculate summary metrics
    const summaryMetrics = useMemo(() => {
        const permanent = candidates.filter(c => c.type === 'permanent').length;
        const contract = candidates.filter(c => c.type === 'contract').length;

        return {
            permanent,
            contract,
            total: candidates.length
        };
    }, [candidates]);

    // Filter and sort candidates for the table
    const filteredCandidates = useMemo(() => {
        let filtered = candidates.filter(candidate => {
            const matchesSearch = searchTerm === '' ||
                candidate.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                candidate.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (candidate.skills && candidate.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))) ||
                (candidate.cv && candidate.cv.toLowerCase().includes(searchTerm.toLowerCase()));

            const matchesType = selectedType === '' || candidate.type === selectedType;

            return matchesSearch && matchesType;
        });

        // Sort candidates
        filtered.sort((a, b) => {
            let aValue: string | number | Date;
            let bValue: string | number | Date;

            switch (sortBy) {
                case 'name':
                    aValue = `${a.firstName} ${a.lastName}`.toLowerCase();
                    bValue = `${b.firstName} ${b.lastName}`.toLowerCase();
                    break;
                case 'type':
                    aValue = (a.type || '').toLowerCase();
                    bValue = (b.type || '').toLowerCase();
                    break;
                case 'expectedSalary':
                    aValue = a.expectedSalary || 0;
                    bValue = b.expectedSalary || 0;
                    break;
                case 'createdAt':
                    aValue = a.createdAt;
                    bValue = b.createdAt;
                    break;
                default:
                    aValue = `${a.firstName} ${a.lastName}`.toLowerCase();
                    bValue = `${b.firstName} ${b.lastName}`.toLowerCase();
            }

            if (sortOrder === 'asc') {
                return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
            } else {
                return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
            }
        });

        return filtered;
    }, [candidates, searchTerm, selectedType, sortBy, sortOrder]);

    const handleAddNewCandidate = () => {
        setSelectedCandidate(null);
        setIsCandidateFormOpen(true);
    };

    const handleEditCandidate = (candidate: Candidate) => {
        setSelectedCandidate(candidate);
        setIsCandidateFormOpen(true);
    };

    const handleOpenCandidateDetail = (candidate: Candidate) => {
        setSelectedCandidateForDetail(candidate);
        setIsCandidateDetailOpen(true);
    };

    const handleSubmitCandidate = async (candidateData: Omit<Candidate, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
        if (!currentUser) {
            console.error('No current user found');
            return;
        }

        try {
            if (selectedCandidate) {
                // Update existing candidate
                console.log('Updating existing candidate with ID:', selectedCandidate.id);
                await updateCandidate(selectedCandidate.id, candidateData);
                console.log('Candidate update successful');
            } else {
                // Create new candidate
                console.log('Creating new candidate');
                await addCandidate({
                    ...candidateData,
                    userId: currentUser.uid
                });
                console.log('Candidate creation successful');
            }

            // Refresh the candidates list to show the changes immediately
            const updatedCandidates = await getCandidates(currentUser.uid);
            setCandidates(updatedCandidates);

            setIsCandidateFormOpen(false);
            setSelectedCandidate(null);
        } catch (error) {
            console.error('Error saving candidate:', error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            alert(`Failed to save candidate: ${errorMessage}. Please try again.`);
        }
    };



    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
                <div className="max-w-none mx-auto px-8 sm:px-12 lg:px-16 py-8 space-y-8">
                    <div className="animate-pulse">
                        <div className="h-8 bg-slate-200 rounded w-1/4 mb-8"></div>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="h-32 bg-slate-200 rounded-2xl"></div>
                            ))}
                        </div>
                        <div className="h-96 bg-slate-200 rounded-2xl"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
            <div className="max-w-none mx-auto px-8 sm:px-12 lg:px-16 py-8 space-y-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 bg-clip-text text-transparent">Candidates</h1>
                        <p className="text-slate-600 mt-2">Manage your candidate database and track potential hires</p>
                    </div>
                    <button
                        onClick={handleAddNewCandidate}
                        className="inline-flex items-center px-6 py-3 border border-transparent shadow-sm text-base font-medium rounded-xl text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Add Candidate
                    </button>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {/* Total Candidates */}
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-600">Total Candidates</p>
                                <p className="text-3xl font-bold text-slate-600">{summaryMetrics.total}</p>
                            </div>
                            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
                                <svg className="w-8 h-8 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Permanent Candidates */}
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-600">Permanent</p>
                                <p className="text-3xl font-bold text-blue-600">{summaryMetrics.permanent}</p>
                            </div>
                            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Contract Candidates */}
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-600">Contract</p>
                                <p className="text-3xl font-bold text-green-600">{summaryMetrics.contract}</p>
                            </div>
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M9 11h.01" />
                                </svg>
                            </div>
                        </div>
                    </div>


                </div>

                {/* Search and Filters */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-8 mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
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
                                    placeholder="Search by name, role, company, or skills..."
                                    className="block w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm"
                                />
                            </div>
                        </div>

                        {/* Type Filter */}
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-3">Type</label>
                            <select
                                value={selectedType}
                                onChange={(e) => setSelectedType(e.target.value)}
                                className="block w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm"
                            >
                                <option value="">All Types</option>
                                {getUniqueTypes().map(type => (
                                    <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
                                ))}
                            </select>
                        </div>

                        {/* Sort */}
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-3">Sort By</label>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value as 'name' | 'type' | 'expectedSalary' | 'createdAt')}
                                className="block w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm"
                            >
                                <option value="name">Name</option>
                                <option value="type">Type</option>
                                <option value="expectedSalary">Expected Salary</option>
                                <option value="createdAt">Date Added</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Candidates Table */}
                {filteredCandidates.length > 0 ? (
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-200">
                                <thead className="bg-gradient-to-r from-slate-50 to-blue-50">
                                    <tr>
                                        <th className="px-8 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                                            Candidate
                                        </th>
                                        <th className="px-8 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                                            Type
                                        </th>
                                        <th className="px-8 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                                            Skills
                                        </th>
                                        <th className="px-8 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                                            Expected Salary
                                        </th>
                                        <th className="px-8 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-slate-100">
                                    {filteredCandidates.map((candidate) => (
                                        <tr
                                            key={candidate.id}
                                            className="hover:bg-blue-50 hover:border-l-4 hover:border-l-blue-500 transition-all duration-200 cursor-pointer"
                                            onClick={() => handleOpenCandidateDetail(candidate)}
                                        >
                                            <td className="px-8 py-6 whitespace-nowrap">
                                                <div>
                                                    <div className="text-sm font-medium text-slate-900">
                                                        {candidate.firstName} {candidate.lastName}
                                                    </div>
                                                    <a
                                                        href={`mailto:${candidate.email}`}
                                                        className="text-sm text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        {candidate.email}
                                                    </a>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 whitespace-nowrap">
                                                {candidate.type ? (
                                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${candidate.type === 'permanent' ? 'bg-blue-500' : 'bg-green-500'
                                                        } text-white`}>
                                                        {candidate.type.charAt(0).toUpperCase() + candidate.type.slice(1)}
                                                    </span>
                                                ) : (
                                                    <span className="text-slate-400">-</span>
                                                )}
                                            </td>
                                            <td className="px-8 py-6 whitespace-nowrap">
                                                <div className="text-sm text-slate-900">
                                                    {candidate.skills && candidate.skills.length > 0
                                                        ? candidate.skills.slice(0, 3).join(', ') + (candidate.skills.length > 3 ? '...' : '')
                                                        : '-'
                                                    }
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 whitespace-nowrap">
                                                <div className="text-sm text-slate-900">
                                                    {candidate.expectedSalary ? formatCurrency(candidate.expectedSalary) : '-'}
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 whitespace-nowrap text-sm font-medium">
                                                <div className="relative">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setShowCandidateMenu(showCandidateMenu === candidate.id ? null : candidate.id);
                                                        }}
                                                        className="text-slate-400 hover:text-slate-600 focus:outline-none focus:text-slate-600"
                                                    >
                                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                                                        </svg>
                                                    </button>

                                                    {showCandidateMenu === candidate.id && (
                                                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-slate-200">
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleEditCandidate(candidate);
                                                                }}
                                                                className="block w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
                                                            >
                                                                Edit
                                                            </button>
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    // Handle view details
                                                                }}
                                                                className="block w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
                                                            >
                                                                View Details
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
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-slate-900">No candidates found</h3>
                        <p className="mt-1 text-sm text-slate-500">
                            {searchTerm || selectedType ? 'Try adjusting your search or filters.' : 'Get started by adding your first candidate.'}
                        </p>
                        {!searchTerm && !selectedType && (
                            <div className="mt-6">
                                <button
                                    onClick={handleAddNewCandidate}
                                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                    Add Candidate
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Candidate Form Modal */}
            {isCandidateFormOpen && (
                <CandidateForm
                    isOpen={isCandidateFormOpen}
                    onCancel={() => setIsCandidateFormOpen(false)}
                    onSubmit={handleSubmitCandidate}
                    candidate={selectedCandidate}
                    jobs={jobs}
                />
            )}

            {/* Candidate Detail Modal */}
            {isCandidateDetailOpen && selectedCandidateForDetail && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-slate-200">
                            <div className="flex items-center justify-between">
                                <h2 className="text-2xl font-bold text-slate-900">
                                    Candidate Details: {selectedCandidateForDetail.firstName} {selectedCandidateForDetail.lastName}
                                </h2>
                                <button
                                    onClick={() => setIsCandidateDetailOpen(false)}
                                    className="text-slate-400 hover:text-slate-600 transition-colors"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Basic Information */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Name</label>
                                    <p className="text-lg text-slate-900">{selectedCandidateForDetail.firstName} {selectedCandidateForDetail.lastName}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Email</label>
                                    <a
                                        href={`mailto:${selectedCandidateForDetail.email}`}
                                        className="text-lg text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                                    >
                                        {selectedCandidateForDetail.email}
                                    </a>
                                </div>
                                {selectedCandidateForDetail.phone && (
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">Phone</label>
                                        <p className="text-lg text-slate-900">{selectedCandidateForDetail.phone}</p>
                                    </div>
                                )}
                                {selectedCandidateForDetail.type && (
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">Type</label>
                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${selectedCandidateForDetail.type === 'permanent' ? 'bg-blue-500' : 'bg-green-500'
                                            } text-white`}>
                                            {selectedCandidateForDetail.type.charAt(0).toUpperCase() + selectedCandidateForDetail.type.slice(1)}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Professional Information */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {selectedCandidateForDetail.expectedSalary && (
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">Expected Salary</label>
                                        <p className="text-lg text-slate-900">{formatCurrency(selectedCandidateForDetail.expectedSalary)}</p>
                                    </div>
                                )}
                                {selectedCandidateForDetail.skills && selectedCandidateForDetail.skills.length > 0 && (
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">Skills</label>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedCandidateForDetail.skills.map((skill, index) => (
                                                <span key={index} className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800">
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Job Assignment Information */}
                            {selectedCandidateForDetail.assignedJobId && (
                                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                                    <h3 className="text-lg font-semibold text-blue-800 mb-4">Job Assignment</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-blue-800 mb-1">Assigned Job</label>
                                            <p className="text-blue-900">
                                                {jobs.find(job => job.id === selectedCandidateForDetail.assignedJobId)?.title || 'Job not found'}
                                            </p>
                                        </div>
                                        {selectedCandidateForDetail.candidateStage && (
                                            <div>
                                                <label className="block text-sm font-semibold text-blue-800 mb-1">Stage</label>
                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${selectedCandidateForDetail.candidateStage === 'placed' ? 'bg-green-500' :
                                                    selectedCandidateForDetail.candidateStage === 'offered' ? 'bg-purple-500' :
                                                        selectedCandidateForDetail.candidateStage === 'interview' ? 'bg-orange-500' :
                                                            selectedCandidateForDetail.candidateStage === 'rejected' ? 'bg-red-500' :
                                                                'bg-gray-500'
                                                    } text-white`}>
                                                    {selectedCandidateForDetail.candidateStage.charAt(0).toUpperCase() + selectedCandidateForDetail.candidateStage.slice(1)}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* CV */}
                            {selectedCandidateForDetail.cv && (
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">CV</label>
                                    <div className="bg-slate-50 rounded-xl p-4 max-h-64 overflow-y-auto">
                                        <p className="text-slate-900 whitespace-pre-wrap">{selectedCandidateForDetail.cv}</p>
                                    </div>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex items-center justify-end space-x-4 pt-6 border-t border-slate-200">
                                <button
                                    onClick={() => setIsCandidateDetailOpen(false)}
                                    className="px-6 py-3 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-all duration-200"
                                >
                                    Close
                                </button>
                                <button
                                    onClick={() => {
                                        setIsCandidateDetailOpen(false);
                                        setSelectedCandidate(selectedCandidateForDetail);
                                        setIsCandidateFormOpen(true);
                                    }}
                                    className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
                                >
                                    Edit Candidate
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Candidates;

import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAppStore } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';
import { getContacts, getDeals, addDeal, updateDeal, deleteDeal, getCandidates } from '../utils/firebase';
import { Contact, Deal } from '../types';
import DealForm from '../components/DealForm';

// Define Candidate interface
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
    assignedJobId?: string;
    candidateStage?: 'applied' | 'interview' | 'rejected' | 'offered' | 'placed';
    createdAt: Date;
    updatedAt: Date;
}

const Pipeline: React.FC = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const { currentUser } = useAuth();
    const { deals: jobs, setDeals: setJobs } = useAppStore();
    const { formatCurrency } = useSettings();

    const [contacts, setContacts] = useState<Contact[]>([]);
    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [loadingJobs, setLoadingJobs] = useState(true);
    const [isJobFormOpen, setIsJobFormOpen] = useState(false);
    const [selectedJob, setSelectedJob] = useState<Deal | null>(null);
    const [showJobMenu, setShowJobMenu] = useState<string | null>(null);
    const [isJobDetailOpen, setIsJobDetailOpen] = useState(false);
    const [selectedJobForDetail, setSelectedJobForDetail] = useState<Deal | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStage, setSelectedStage] = useState('');
    const [selectedJobType, setSelectedJobType] = useState('');
    const [selectedExclusive, setSelectedExclusive] = useState('');
    const [selectedRecruiter, setSelectedRecruiter] = useState('');
    const [sortBy, setSortBy] = useState<'title' | 'contact' | 'value' | 'stage' | 'createdAt' | 'jobType'>('title');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

    // Load deals and candidates from Firebase when component mounts
    useEffect(() => {
        if (currentUser) {
            const loadData = async () => {
                try {
                    setLoadingJobs(true);
                    const [firebaseJobs, firebaseCandidates] = await Promise.all([
                        getDeals(currentUser!.uid),
                        getCandidates(currentUser!.uid)
                    ]);
                    setJobs(firebaseJobs);
                    setCandidates(firebaseCandidates);
                } catch (error) {
                    console.error('Error loading data:', error);
                } finally {
                    setLoadingJobs(false);
                }
            };
            loadData();
        }
    }, [currentUser, setJobs]);

    // Handle opening specific job from URL parameter
    useEffect(() => {
        const jobId = searchParams.get('jobId');
        if (jobId && jobs.length > 0 && !loadingJobs) {
            const jobToOpen = jobs.find(job => job.id === jobId);
            if (jobToOpen) {
                setSelectedJobForDetail(jobToOpen);
                setIsJobDetailOpen(true);
                // Clear the URL parameter after opening the job
                setSearchParams(prev => {
                    const newParams = new URLSearchParams(prev);
                    newParams.delete('jobId');
                    return newParams;
                });
            }
        }
    }, [jobs, loadingJobs, searchParams, setSearchParams]);

    // Load contacts for job creation
    useEffect(() => {
        if (currentUser) {
            const loadContacts = async () => {
                try {
                    const loadedContacts = await getContacts(currentUser.uid);
                    setContacts(loadedContacts);
                } catch (error) {
                    console.error('Error loading contacts for jobs:', error);
                }
            };
            loadContacts();
        }
    }, [currentUser]);

    const stages = [
        { id: 'lead', name: 'Lead', color: 'bg-gray-500' },
        { id: 'live-opportunity', name: 'Live Job', color: 'bg-blue-500' },
        { id: 'shortlist-sent', name: 'Shortlist Sent', color: 'bg-yellow-500' },
        { id: 'interview', name: 'Interview', color: 'bg-orange-500' },
        { id: 'offer', name: 'Offer', color: 'bg-purple-500' },
        { id: 'placed', name: 'Placed', color: 'bg-green-500' },
    ];

    // Normalize stage names to handle any case/spelling variations
    const normalizeStage = (stage: string) => {
        const stageLower = stage.toLowerCase();
        if (stageLower.includes('lead')) return 'lead';
        if (stageLower.includes('live') || stageLower.includes('opportunity') || stageLower.includes('job')) return 'live-opportunity';
        if (stageLower.includes('shortlist')) return 'shortlist-sent';
        if (stageLower.includes('interview')) return 'interview';
        if (stageLower.includes('offer')) return 'offer';
        if (stageLower.includes('placed')) return 'placed';
        return stage; // Return original if no match
    };

    const getJobsByStage = (stageId: string) => {
        return jobs.filter(job => {
            const normalizedStage = normalizeStage(job.stage);
            return normalizedStage === stageId;
        });
    };

    const getContactName = (contactId: string): string => {
        const contact = contacts.find(c => c.id === contactId);
        return contact ? `${contact.firstName} ${contact.lastName}` : 'Unknown Contact';
    };

    const formatDate = (dateValue: any): string => {
        if (!dateValue) return '';
        if (dateValue instanceof Date) {
            return dateValue.toLocaleDateString();
        }
        try {
            return new Date(dateValue).toLocaleDateString();
        } catch (error) {
            console.error('Error formatting date:', dateValue, error);
            return 'Invalid Date';
        }
    };

    // Get unique recruiters for filter dropdown
    const getUniqueRecruiters = (): string[] => {
        const recruiterSet = new Set<string>();
        jobs.forEach(job => {
            const recruiter = (job as any).recruiter;
            if (recruiter && recruiter.trim() !== '') {
                recruiterSet.add(recruiter.trim());
            }
        });
        return Array.from(recruiterSet).sort();
    };

    // Calculate summary metrics
    const summaryMetrics = useMemo(() => {
        const placed = getJobsByStage('placed');

        const totalPlacedFee = placed.reduce((sum, deal) => {
            // Calculate fee based on value and fee percentage
            const fee = deal.value && deal.feePercentage
                ? (deal.value * deal.feePercentage / 100)
                : 0;
            return sum + fee;
        }, 0);

        return {
            closedWon: {
                count: placed.length,
                value: totalPlacedFee
            }
        };
    }, [jobs]);

    // Filter and sort jobs for the table
    const filteredJobs = useMemo(() => {
        let filtered = jobs.filter(job => {
            const matchesSearch = searchTerm === '' ||
                job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                getContactName(job.contactId).toLowerCase().includes(searchTerm.toLowerCase()) ||
                (contacts.find(c => c.id === job.contactId)?.company?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
                ((job as any).location && (job as any).location.toLowerCase().includes(searchTerm.toLowerCase())) ||
                ((job as any).jobType && (job as any).jobType.toLowerCase().includes(searchTerm.toLowerCase())) ||
                ((job as any).recruiter && (job as any).recruiter.toLowerCase().includes(searchTerm.toLowerCase()));

            const matchesStage = selectedStage === '' || normalizeStage(job.stage) === selectedStage;
            const matchesJobType = selectedJobType === '' || (job as any).jobType === selectedJobType;
            const matchesExclusive = selectedExclusive === '' || (job as any).isExclusive === (selectedExclusive === 'true');
            const matchesRecruiter = selectedRecruiter === '' || (job as any).recruiter === selectedRecruiter;

            return matchesSearch && matchesStage && matchesJobType && matchesExclusive && matchesRecruiter;
        });

        // Sort jobs
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
                case 'jobType':
                    aValue = ((a as any).jobType || '').toLowerCase();
                    bValue = ((b as any).jobType || '').toLowerCase();
                    break;
                case 'value':
                    aValue = a.value || 0;
                    bValue = b.value || 0;
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
    }, [jobs, searchTerm, selectedStage, selectedJobType, selectedExclusive, selectedRecruiter, sortBy, sortOrder, contacts]);

    const handleSubmit = async (dealData: Omit<Deal, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
        if (!currentUser) {
            console.error('No current user found');
            return;
        }

        try {
            console.log('handleSubmit called with:', { selectedJob: selectedJob?.id, dealData });

            if (selectedJob) {
                // Update existing job
                console.log('Updating existing job with ID:', selectedJob.id);
                await updateDeal(selectedJob.id, dealData);
                console.log('Job update successful');
            } else {
                // Create new job
                console.log('Creating new job');
                await addDeal({
                    ...dealData,
                    userId: currentUser.uid
                });
                console.log('Job creation successful');
            }

            // Refresh the jobs list to show the changes immediately
            console.log('Refreshing jobs list...');
            const updatedJobs = await getDeals(currentUser.uid);
            setJobs(updatedJobs);
            console.log('Jobs list refreshed');

            setIsJobFormOpen(false);
            setSelectedJob(null);
        } catch (error) {
            console.error('Error saving job:', error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            alert(`Failed to save job: ${errorMessage}. Please try again.`);
        }
    };



    const handleEditJob = (job: Deal) => {
        setSelectedJob(job);
        setIsJobFormOpen(true);
    };

    const handleDeleteJob = async (jobId: string) => {
        if (!currentUser) return;

        if (window.confirm('Are you sure you want to delete this job? This action cannot be undone.')) {
            try {
                await deleteDeal(jobId);
                setShowJobMenu(null);
            } catch (error) {
                console.error('Error deleting job:', error);
                alert('Failed to delete job. Please try again.');
            }
        }
    };

    const handleAddNewJob = () => {
        setSelectedJob(null);
        setIsJobFormOpen(true);
    };

    const handleOpenJobDetail = (job: Deal) => {
        setSelectedJobForDetail(job);
        setIsJobDetailOpen(true);
    };

    const getStageColor = (stage: string): string => {
        const normalizedStage = normalizeStage(stage);
        const stageConfig = stages.find(s => s.id === normalizedStage);
        return stageConfig ? stageConfig.color : 'bg-gray-500';
    };

    const getStageName = (stage: string): string => {
        const normalizedStage = normalizeStage(stage);
        const stageConfig = stages.find(s => s.id === normalizedStage);
        return stageConfig ? stageConfig.name : stage;
    };

    if (loadingJobs) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
                <div className="max-w-none mx-auto px-8 sm:px-12 lg:px-16 py-8 space-y-8">
                    <div className="animate-pulse">
                        <div className="h-8 bg-slate-200 rounded w-1/4 mb-8"></div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            {[1, 2, 3].map((i) => (
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
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 bg-clip-text text-transparent">Jobs</h1>
                        <p className="text-slate-600 mt-2">Manage your recruitment pipeline and track job opportunities</p>
                    </div>
                    <button
                        onClick={handleAddNewJob}
                        className="inline-flex items-center px-6 py-3 border border-transparent shadow-sm text-base font-medium rounded-xl text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Add Job Order
                    </button>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    {/* Live Jobs Card */}
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-600">Live Jobs</p>
                                <p className="text-3xl font-bold text-blue-600">
                                    {jobs.filter(job => {
                                        const normalizedStage = normalizeStage(job.stage);
                                        return normalizedStage !== 'lead' && normalizedStage !== 'placed';
                                    }).length}
                                </p>
                                <p className="text-lg text-blue-700 font-semibold">Active Jobs</p>
                            </div>
                            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 00-2-2H8a2 2 0 00-2-2v2m8 0V6a2 2 0 00-2-2H8a2 2 0 00-2-2v2m8 0V6a2 2 0 00-2-2H8a2 2 0 00-2-2v2m8 0V6a2 2 0 00-2-2H8a2 2 0 00-2-2v2" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Placements Card */}
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-600">Placements</p>
                                <p className="text-3xl font-bold text-green-600">{summaryMetrics.closedWon.count}</p>
                                <p className="text-lg text-green-700 font-semibold">Fee: {formatCurrency(summaryMetrics.closedWon.value)}</p>
                            </div>
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Search and Filters */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-8 mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-7 gap-6">
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
                                    placeholder="Search by title, company, client, location, job type, or recruiter..."
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

                        {/* Job Type Filter */}
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-3">Filter by Job Type</label>
                            <select
                                value={selectedJobType}
                                onChange={(e) => setSelectedJobType(e.target.value)}
                                className="block w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm"
                            >
                                <option value="">All Job Types</option>
                                <option value="permanent">Permanent</option>
                                <option value="contract">Contract</option>
                                <option value="temporary">Temporary</option>
                                <option value="part-time">Part-time</option>
                                <option value="freelance">Freelance</option>
                            </select>
                        </div>

                        {/* Exclusive Terms Filter */}
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-3">Exclusive Terms</label>
                            <select
                                value={selectedExclusive}
                                onChange={(e) => setSelectedExclusive(e.target.value)}
                                className="block w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm"
                            >
                                <option value="">All Jobs</option>
                                <option value="true">Exclusive Only</option>
                                <option value="false">Non-Exclusive Only</option>
                            </select>
                        </div>

                        {/* Recruiter Filter */}
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-3">Filter by Recruiter</label>
                            <select
                                value={selectedRecruiter}
                                onChange={(e) => setSelectedRecruiter(e.target.value)}
                                className="block w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm"
                            >
                                <option value="">All Recruiters</option>
                                {getUniqueRecruiters().map(recruiter => (
                                    <option key={recruiter} value={recruiter}>{recruiter}</option>
                                ))}
                            </select>
                        </div>

                        {/* Sort */}
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-3">Sort By</label>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value as 'title' | 'contact' | 'value' | 'stage' | 'createdAt' | 'jobType')}
                                className="block w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm"
                            >
                                <option value="title">Title</option>
                                <option value="contact">Client</option>
                                <option value="jobType">Job Type</option>
                                <option value="value">Salary</option>
                                <option value="stage">Stage</option>
                                <option value="createdAt">Date Created</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Jobs Table */}
                {filteredJobs.length > 0 ? (
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-200">
                                <thead className="bg-gradient-to-r from-slate-50 to-blue-50">
                                    <tr>
                                        <th className="px-8 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                                            Job Order
                                        </th>
                                        <th className="px-8 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                                            Company
                                        </th>
                                        <th className="px-8 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                                            Client
                                        </th>
                                        <th className="px-8 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                                            Type & Location
                                        </th>
                                        <th className="px-8 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                                            Salary
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
                                    {filteredJobs.map((job) => (
                                        <tr
                                            key={job.id}
                                            className="hover:bg-blue-50 hover:border-l-4 hover:border-l-blue-500 transition-all duration-200 cursor-pointer group"
                                            onClick={() => handleOpenJobDetail(job)}
                                        >
                                            <td className="px-8 py-6 whitespace-nowrap">
                                                <div>
                                                    <div className="text-sm font-medium text-slate-900">{job.title}</div>
                                                    <div className="text-sm text-slate-500">
                                                        {(job as any).isExclusive && ' • Exclusive'}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 whitespace-nowrap">
                                                <div className="text-sm text-slate-900">
                                                    {contacts.find(c => c.id === job.contactId)?.company || '-'}
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 whitespace-nowrap">
                                                <div className="text-sm text-slate-900">{getContactName(job.contactId)}</div>
                                            </td>
                                            <td className="px-8 py-6 whitespace-nowrap">
                                                <div className="text-sm text-slate-900">
                                                    <div>{(job as any).jobType || '-'}</div>
                                                    <div className="text-slate-500">{(job as any).location || '-'}</div>
                                                    {(job as any).recruiter && (
                                                        <div className="text-xs text-blue-600 font-medium">
                                                            Recruiter: {(job as any).recruiter}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 whitespace-nowrap">
                                                <div className="text-sm font-medium text-slate-900">
                                                    {formatCurrency(job.value || 0)}
                                                    {(job as any).feePercentage && (
                                                        <div className="text-xs text-slate-500">
                                                            Fee: {formatCurrency(((job.value || 0) * (job as any).feePercentage) / 100)}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 whitespace-nowrap">
                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStageColor(job.stage)} text-white`}>
                                                    {getStageName(job.stage)}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6 whitespace-nowrap text-sm font-medium">
                                                <div className="relative">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setShowJobMenu(showJobMenu === job.id ? null : job.id);
                                                        }}
                                                        className="text-slate-400 hover:text-slate-600 focus:outline-none focus:text-slate-600"
                                                    >
                                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                                                        </svg>
                                                    </button>

                                                    {showJobMenu === job.id && (
                                                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-slate-200">
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleEditJob(job);
                                                                }}
                                                                className="block w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
                                                            >
                                                                Edit
                                                            </button>
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleDeleteJob(job.id);
                                                                }}
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
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 00-2-2H8a2 2 0 00-2-2v2m8 0V6a2 2 0 00-2-2H8a2 2 0 00-2-2v2m8 0V6a2 2 0 00-2-2H8a2 2 0 00-2-2v2m8 0V6a2 2 0 00-2-2H8a2 2 0 00-2-2v2" />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-slate-900">No jobs found</h3>
                        <p className="mt-1 text-sm text-slate-500">
                            {searchTerm || selectedStage || selectedJobType || selectedExclusive || selectedRecruiter ? 'Try adjusting your search or filters.' : 'Get started by creating your first job order.'}
                        </p>
                        {!searchTerm && !selectedStage && !selectedJobType && !selectedExclusive && !selectedRecruiter && (
                            <div className="mt-6">
                                <button
                                    onClick={handleAddNewJob}
                                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                    Add Job Order
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Job Form Modal */}
            {isJobFormOpen && (
                <DealForm
                    isOpen={isJobFormOpen}
                    onCancel={() => setIsJobFormOpen(false)}
                    onSubmit={handleSubmit}
                    deal={selectedJob}
                    contacts={contacts}
                />
            )}

            {/* Job Detail Modal */}
            {isJobDetailOpen && selectedJobForDetail && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-slate-200">
                            <div className="flex items-center justify-between">
                                <h2 className="text-2xl font-bold text-slate-900">
                                    Job Details: {selectedJobForDetail.title}
                                </h2>
                                <button
                                    onClick={() => setIsJobDetailOpen(false)}
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
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Job Title</label>
                                    <p className="text-lg text-slate-900">{selectedJobForDetail.title}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Client</label>
                                    <p className="text-lg text-slate-900">{getContactName(selectedJobForDetail.contactId)}</p>
                                    {contacts.find(c => c.id === selectedJobForDetail.contactId)?.company && (
                                        <p className="text-sm text-slate-600">
                                            {contacts.find(c => c.id === selectedJobForDetail.contactId)?.company}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Stage and Financial Information */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Stage</label>
                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStageColor(selectedJobForDetail.stage)} text-white`}>
                                        {getStageName(selectedJobForDetail.stage)}
                                    </span>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Salary</label>
                                    <p className="text-lg text-slate-900">{formatCurrency(selectedJobForDetail.value)}</p>
                                </div>
                            </div>

                            {/* Fee Information */}
                            {(selectedJobForDetail as any).feePercentage && (
                                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-blue-800 mb-1">Fee Percentage</label>
                                            <p className="text-lg font-bold text-blue-900">{(selectedJobForDetail as any).feePercentage}%</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-blue-800 mb-1">Calculated Fee</label>
                                            <p className="text-lg font-bold text-blue-900">
                                                {formatCurrency((selectedJobForDetail.value * (selectedJobForDetail as any).feePercentage) / 100)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Additional Details */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {(selectedJobForDetail as any).jobType && (
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">Job Type</label>
                                        <p className="text-slate-900 capitalize">{(selectedJobForDetail as any).jobType}</p>
                                    </div>
                                )}
                                {(selectedJobForDetail as any).location && (
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">Location</label>
                                        <p className="text-slate-900">{(selectedJobForDetail as any).location}</p>
                                    </div>
                                )}
                                {(selectedJobForDetail as any).recruiter && (
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">Recruiter</label>
                                        <p className="text-slate-900">{(selectedJobForDetail as any).recruiter}</p>
                                    </div>
                                )}
                                {(selectedJobForDetail as any).isExclusive && (
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">Terms</label>
                                        <p className="text-slate-900">Exclusive</p>
                                    </div>
                                )}
                                {selectedJobForDetail.stage === 'placed' && (selectedJobForDetail as any).startDate && (
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">Start Date</label>
                                        <p className="text-slate-900">
                                            {formatDate((selectedJobForDetail as any).startDate)}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Requirements */}
                            {(selectedJobForDetail as any).requirements && (
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Requirements</label>
                                    <div className="bg-slate-50 rounded-xl p-4">
                                        <p className="text-slate-900 whitespace-pre-wrap">{(selectedJobForDetail as any).requirements}</p>
                                    </div>
                                </div>
                            )}

                            {/* Notes */}
                            {selectedJobForDetail.notes && (
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Notes</label>
                                    <div className="bg-slate-50 rounded-xl p-4">
                                        <p className="text-slate-900 whitespace-pre-wrap">{selectedJobForDetail.notes}</p>
                                    </div>
                                </div>
                            )}

                            {/* Assigned Candidates */}
                            {(() => {
                                const assignedCandidates = candidates.filter(candidate => candidate.assignedJobId === selectedJobForDetail.id);
                                return assignedCandidates.length > 0 && (
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-4">Assigned Candidates ({assignedCandidates.length})</label>
                                        <div className="bg-slate-50 rounded-xl p-4 space-y-3">
                                            {assignedCandidates.map((candidate) => (
                                                <div key={candidate.id} className="bg-white rounded-lg p-4 border border-slate-200">
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <h4 className="font-semibold text-slate-900">
                                                                {candidate.firstName} {candidate.lastName}
                                                            </h4>
                                                            <a
                                                                href={`mailto:${candidate.email}`}
                                                                className="text-sm text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                                                            >
                                                                {candidate.email}
                                                            </a>
                                                            {candidate.skills && candidate.skills.length > 0 && (
                                                                <div className="flex flex-wrap gap-1 mt-2">
                                                                    {candidate.skills.slice(0, 3).map((skill, index) => (
                                                                        <span key={index} className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800">
                                                                            {skill}
                                                                        </span>
                                                                    ))}
                                                                    {candidate.skills.length > 3 && (
                                                                        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-600">
                                                                            +{candidate.skills.length - 3} more
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="text-right">
                                                            {candidate.candidateStage && (
                                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${candidate.candidateStage === 'placed' ? 'bg-green-500' :
                                                                    candidate.candidateStage === 'offered' ? 'bg-purple-500' :
                                                                        candidate.candidateStage === 'interview' ? 'bg-orange-500' :
                                                                            candidate.candidateStage === 'rejected' ? 'bg-red-500' :
                                                                                'bg-gray-500'
                                                                    } text-white`}>
                                                                    {candidate.candidateStage.charAt(0).toUpperCase() + candidate.candidateStage.slice(1)}
                                                                </span>
                                                            )}
                                                            {candidate.expectedSalary && (
                                                                <p className="text-sm text-slate-600 mt-1">
                                                                    Expected: {formatCurrency(candidate.expectedSalary)}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })()}

                            {/* Action Buttons */}
                            <div className="flex items-center justify-end space-x-4 pt-6 border-t border-slate-200">
                                <button
                                    onClick={() => setIsJobDetailOpen(false)}
                                    className="px-6 py-3 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-all duration-200"
                                >
                                    Close
                                </button>
                                <button
                                    onClick={() => {
                                        setIsJobDetailOpen(false);
                                        setSelectedJob(selectedJobForDetail);
                                        setIsJobFormOpen(true);
                                    }}
                                    className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
                                >
                                    Edit Job
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Pipeline; 
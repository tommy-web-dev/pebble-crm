import React, { useState, useMemo } from 'react';
import { useAppStore } from '../contexts/AppContext';
import { useSettings } from '../contexts/SettingsContext';
import { Contact } from '../types';

interface ClientDetailProps {
    contact: Contact;
    onClose: () => void;
    onEdit: () => void;
    onDelete: () => void;
    onNavigateToJob?: (jobId: string) => void;
}

const ClientDetail: React.FC<ClientDetailProps> = ({ contact, onClose, onEdit, onDelete, onNavigateToJob }) => {
    const { deals, interactions } = useAppStore();
    const { formatPhoneNumber, formatCurrency } = useSettings();
    const [activeTab, setActiveTab] = useState<'overview' | 'jobs' | 'interactions'>('overview');

    // Filter deals for this client
    const clientJobs = useMemo(() => {
        return deals.filter(deal => deal.contactId === contact.id);
    }, [deals, contact.id]);

    // Filter interactions for this client
    const clientInteractions = useMemo(() => {
        return interactions.filter(interaction => interaction.contactId === contact.id);
    }, [interactions, contact.id]);

    // Calculate client metrics
    const clientMetrics = useMemo(() => {
        const totalJobs = clientJobs.length;
        const activeJobs = clientJobs.filter(job =>
            !['placed'].includes(job.stage)
        ).length;

        // Calculate total fee value (not salary)
        const totalValue = clientJobs.reduce((sum, job) => {
            const fee = job.value && (job as any).feePercentage
                ? (job.value * (job as any).feePercentage / 100)
                : 0;
            return sum + fee;
        }, 0);

        // Calculate won fee value for placed jobs
        const wonValue = clientJobs
            .filter(job => job.stage === 'placed')
            .reduce((sum, job) => {
                const fee = job.value && (job as any).feePercentage
                    ? (job.value * (job as any).feePercentage / 100)
                    : 0;
                return sum + fee;
            }, 0);

        return { totalJobs, activeJobs, totalValue, wonValue };
    }, [clientJobs]);

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

    const getStageColor = (stage: string) => {
        switch (stage) {
            case 'lead': return 'bg-slate-100 text-slate-800';
            case 'live-opportunity': return 'bg-emerald-100 text-emerald-800';
            case 'shortlist-sent': return 'bg-yellow-100 text-yellow-800';
            case 'interview': return 'bg-orange-100 text-orange-800';
            case 'offer': return 'bg-purple-100 text-purple-800';
            case 'placed': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStageName = (stage: string) => {
        switch (stage) {
            case 'lead': return 'Lead';
            case 'live-opportunity': return 'Live Job';
            case 'shortlist-sent': return 'Shortlist Sent';
            case 'interview': return 'Interview';
            case 'offer': return 'Offer';
            case 'placed': return 'Placed';
            default: return stage;
        }
    };

    const getInteractionTypeIcon = (type: string) => {
        switch (type) {
            case 'call': return '📞';
            case 'meeting': return '🤝';
            case 'email': return '📧';
            case 'note': return '📝';
            case 'follow-up': return '⏰';
            case 'proposal': return '📄';
            case 'other': return '📋';
            default: return '📋';
        }
    };

    const formatInteractionType = (type: string) => {
        switch (type) {
            case 'call': return 'Phone Call';
            case 'meeting': return 'Meeting';
            case 'email': return 'Email';
            case 'note': return 'Note';
            case 'follow-up': return 'Follow Up';
            case 'proposal': return 'Proposal Sent';
            case 'other': return 'Other';
            default: return type;
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-200">
                    <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                            <span className="text-2xl font-bold text-blue-600">
                                {contact.firstName.charAt(0)}{contact.lastName.charAt(0)}
                            </span>
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900">
                                {contact.firstName} {contact.lastName}
                            </h2>
                            <p className="text-slate-600">
                                {contact.position} {contact.company ? `at ${contact.company}` : ''}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-3">
                        <button
                            onClick={onEdit}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Edit
                        </button>
                        <button
                            onClick={onDelete}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                            Delete
                        </button>
                        <button
                            onClick={onClose}
                            className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-slate-200">
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={`px-6 py-3 font-medium transition-colors ${activeTab === 'overview'
                            ? 'text-blue-600 border-b-2 border-blue-600'
                            : 'text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        Overview
                    </button>
                    <button
                        onClick={() => setActiveTab('jobs')}
                        className={`px-6 py-3 font-medium transition-colors ${activeTab === 'jobs'
                            ? 'text-blue-600 border-b-2 border-blue-600'
                            : 'text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        Jobs ({clientJobs.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('interactions')}
                        className={`px-6 py-3 font-medium transition-colors ${activeTab === 'interactions'
                            ? 'text-blue-600 border-b-2 border-blue-600'
                            : 'text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        Interactions ({clientInteractions.length})
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                    {activeTab === 'overview' && (
                        <div className="space-y-6">
                            {/* Client Metrics */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="bg-blue-50 p-4 rounded-lg text-center">
                                    <p className="text-2xl font-bold text-blue-600">{clientMetrics.totalJobs}</p>
                                    <p className="text-sm text-blue-600">Total Jobs</p>
                                </div>
                                <div className="bg-emerald-50 p-4 rounded-lg text-center">
                                    <p className="text-2xl font-bold text-emerald-600">{clientMetrics.activeJobs}</p>
                                    <p className="text-sm text-emerald-600">Active Jobs</p>
                                </div>
                                <div className="bg-purple-50 p-4 rounded-lg text-center">
                                    <p className="text-2xl font-bold text-purple-600">{formatCurrency(clientMetrics.totalValue)}</p>
                                    <p className="text-sm text-purple-600">Total Value</p>
                                </div>
                                <div className="bg-green-50 p-4 rounded-lg text-center">
                                    <p className="text-2xl font-bold text-green-600">{formatCurrency(clientMetrics.wonValue)}</p>
                                    <p className="text-sm text-green-600">Won Value</p>
                                </div>
                            </div>

                            {/* Client Details */}
                            <div className="bg-slate-50 p-6 rounded-lg">
                                <h3 className="text-lg font-semibold text-slate-900 mb-4">Client Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-slate-500">Email</p>
                                        {contact.email ? (
                                            <a
                                                href={`mailto:${contact.email}`}
                                                className="font-medium text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                                            >
                                                {contact.email}
                                            </a>
                                        ) : (
                                            <p className="font-medium">No email</p>
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-500">Phone</p>
                                        <p className="font-medium">{contact.phone ? formatPhoneNumber(contact.phone) : 'No phone'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-500">Company</p>
                                        <p className="font-medium">{contact.company || 'No company'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-500">Position</p>
                                        <p className="font-medium">{contact.position || 'No position'}</p>
                                    </div>
                                </div>
                                {contact.notes && (
                                    <div className="mt-4">
                                        <p className="text-sm text-slate-500">Notes</p>
                                        <p className="font-medium">{contact.notes}</p>
                                    </div>
                                )}
                                {contact.tags && contact.tags.length > 0 && (
                                    <div className="mt-4">
                                        <p className="text-sm text-slate-500">Tags</p>
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {contact.tags.map((tag, index) => (
                                                <span
                                                    key={index}
                                                    className="px-3 py-1 bg-slate-200 text-slate-700 rounded-full text-sm"
                                                >
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'jobs' && (
                        <div>
                            <h3 className="text-lg font-semibold text-slate-900 mb-4">Job Orders</h3>
                            {clientJobs.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-slate-200">
                                        <thead className="bg-slate-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                                    Job Title
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                                    Stage
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                                    Value
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                                    Created
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-slate-200">
                                            {clientJobs.map((job) => (
                                                <tr key={job.id} className="hover:bg-slate-50">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        {onNavigateToJob ? (
                                                            <button
                                                                onClick={() => onNavigateToJob(job.id)}
                                                                className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline transition-colors cursor-pointer text-left"
                                                            >
                                                                {job.title}
                                                            </button>
                                                        ) : (
                                                            <div className="text-sm font-medium text-slate-900">{job.title}</div>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStageColor(job.stage)}`}>
                                                            {getStageName(job.stage)}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-slate-900">{formatCurrency(job.value)}</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-slate-500">{formatDate(job.createdAt)}</div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="text-center py-8 text-slate-500">
                                    <p>No job orders found for this client.</p>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'interactions' && (
                        <div>
                            <h3 className="text-lg font-semibold text-slate-900 mb-4">Interaction History</h3>
                            {clientInteractions.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-slate-200">
                                        <thead className="bg-slate-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                                    Type
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                                    Date
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                                    Details
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-slate-200">
                                            {clientInteractions
                                                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                                                .map((interaction) => (
                                                    <tr key={interaction.id} className="hover:bg-slate-50">
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="flex items-center space-x-2">
                                                                <span className="text-lg">{getInteractionTypeIcon(interaction.type)}</span>
                                                                <span className="text-sm font-medium text-slate-900 capitalize">
                                                                    {formatInteractionType(interaction.type)}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="text-sm text-slate-500">{formatDate(interaction.date)}</div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="text-sm text-slate-900">{interaction.notes}</div>
                                                        </td>
                                                    </tr>
                                                ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="text-center py-8 text-slate-500">
                                    <p>No interactions found for this client.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ClientDetail; 
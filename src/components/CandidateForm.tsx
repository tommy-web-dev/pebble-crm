import React, { useState, useEffect } from 'react';

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

interface Deal {
    id: string;
    title: string;
}

interface CandidateFormProps {
    isOpen: boolean;
    onCancel: () => void;
    onSubmit: (candidateData: Omit<Candidate, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => void;
    candidate?: Candidate | null;
    jobs?: Deal[];
}

const CandidateForm: React.FC<CandidateFormProps> = ({
    isOpen,
    onCancel,
    onSubmit,
    candidate,
    jobs = []
}) => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        type: '',
        skills: '',
        expectedSalary: '',
        cv: '',
        assignedJobId: '',
        candidateStage: ''
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    // Populate form when editing
    useEffect(() => {
        if (candidate) {
            setFormData({
                firstName: candidate.firstName || '',
                lastName: candidate.lastName || '',
                email: candidate.email || '',
                phone: candidate.phone || '',
                type: candidate.type || '',
                skills: candidate.skills ? candidate.skills.join(', ') : '',
                expectedSalary: candidate.expectedSalary ? String(candidate.expectedSalary) : '',
                cv: candidate.cv || '',
                assignedJobId: candidate.assignedJobId || '',
                candidateStage: candidate.candidateStage || ''
            });
        } else {
            // Reset form for new candidate
            setFormData({
                firstName: '',
                lastName: '',
                email: '',
                phone: '',
                type: '',
                skills: '',
                expectedSalary: '',
                cv: '',
                assignedJobId: '',
                candidateStage: ''
            });
        }
        setErrors({});
    }, [candidate]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.firstName.trim()) {
            newErrors.firstName = 'First name is required';
        }
        if (!formData.lastName.trim()) {
            newErrors.lastName = 'Last name is required';
        }
        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email is invalid';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        // Parse skills from comma-separated string
        const skillsArray = formData.skills
            .split(',')
            .map(skill => skill.trim())
            .filter(skill => skill.length > 0);

        const candidateData = {
            firstName: formData.firstName.trim(),
            lastName: formData.lastName.trim(),
            email: formData.email.trim(),
            phone: formData.phone.trim() || undefined,
            type: formData.type as 'permanent' | 'contract' | undefined,
            skills: skillsArray.length > 0 ? skillsArray : undefined,
            expectedSalary: formData.expectedSalary ? parseInt(formData.expectedSalary) : undefined,
            cv: formData.cv.trim() || undefined,
            assignedJobId: formData.assignedJobId || undefined,
            candidateStage: formData.candidateStage as 'applied' | 'interview' | 'rejected' | 'offered' | 'placed' | undefined
        };

        onSubmit(candidateData);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-slate-200">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold text-slate-900">
                            {candidate ? 'Edit Candidate' : 'Add New Candidate'}
                        </h2>
                        <button
                            onClick={onCancel}
                            className="text-slate-400 hover:text-slate-600 transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-6">
                    {/* Basic Information */}
                    <div className="mb-8">
                        <h3 className="text-lg font-semibold text-slate-800 mb-4">Basic Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    First Name *
                                </label>
                                <input
                                    type="text"
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleInputChange}
                                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${errors.firstName ? 'border-red-300' : 'border-slate-200'
                                        }`}
                                    placeholder="e.g., John"
                                />
                                {errors.firstName && (
                                    <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    Last Name *
                                </label>
                                <input
                                    type="text"
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleInputChange}
                                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${errors.lastName ? 'border-red-300' : 'border-slate-200'
                                        }`}
                                    placeholder="e.g., Smith"
                                />
                                {errors.lastName && (
                                    <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    Email *
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${errors.email ? 'border-red-300' : 'border-slate-200'
                                        }`}
                                    placeholder="e.g., john.smith@email.com"
                                />
                                {errors.email && (
                                    <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    Phone
                                </label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                    placeholder="e.g., +1 (555) 123-4567"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Professional Information */}
                    <div className="mb-8">
                        <h3 className="text-lg font-semibold text-slate-800 mb-4">Professional Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    Type
                                </label>
                                <select
                                    name="type"
                                    value={formData.type}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                >
                                    <option value="">Select type</option>
                                    <option value="permanent">Permanent</option>
                                    <option value="contract">Contract</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    Skills (comma-separated)
                                </label>
                                <input
                                    type="text"
                                    name="skills"
                                    value={formData.skills}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                    placeholder="e.g., React, TypeScript, Node.js"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    Expected Salary
                                </label>
                                <input
                                    type="number"
                                    name="expectedSalary"
                                    value={formData.expectedSalary}
                                    onChange={handleInputChange}
                                    min="0"
                                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                    placeholder="e.g., 80000"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Job Assignment */}
                    <div className="mb-8">
                        <h3 className="text-lg font-semibold text-slate-800 mb-4">Job Assignment</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    Assign to Job (Optional)
                                </label>
                                <select
                                    name="assignedJobId"
                                    value={formData.assignedJobId}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                >
                                    <option value="">No job assigned</option>
                                    {jobs.map(job => (
                                        <option key={job.id} value={job.id}>{job.title}</option>
                                    ))}
                                </select>
                            </div>

                            {formData.assignedJobId && (
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        Candidate Stage
                                    </label>
                                    <select
                                        name="candidateStage"
                                        value={formData.candidateStage}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                    >
                                        <option value="">Select stage</option>
                                        <option value="applied">Applied</option>
                                        <option value="interview">Interview</option>
                                        <option value="rejected">Rejected</option>
                                        <option value="offered">Offered</option>
                                        <option value="placed">Placed</option>
                                    </select>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* CV Section */}
                    <div className="mb-8">
                        <h3 className="text-lg font-semibold text-slate-800 mb-4">CV</h3>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                CV Content
                            </label>
                            <textarea
                                name="cv"
                                value={formData.cv}
                                onChange={handleInputChange}
                                rows={12}
                                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                placeholder="Copy and paste the candidate's CV content here..."
                            />
                            <p className="mt-2 text-sm text-slate-500">
                                Paste the full CV text content here for easy reference and searching.
                            </p>
                        </div>
                    </div>

                    {/* Form Actions */}
                    <div className="flex items-center justify-end space-x-4 pt-6 border-t border-slate-200">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="px-6 py-3 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-all duration-200"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
                        >
                            {candidate ? 'Update Candidate' : 'Add Candidate'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CandidateForm;

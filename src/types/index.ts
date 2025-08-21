// User types
export interface User {
    uid: string;
    email: string;
    displayName?: string;
    photoURL?: string;
    createdAt: Date;
    subscription?: UserSubscription;
}

// Subscription types
export interface UserSubscription {
    stripeCustomerId: string;
    stripeSubscriptionId: string;
    status: 'active' | 'canceled' | 'incomplete' | 'incomplete_expired' | 'past_due' | 'trialing' | 'unpaid';
    planName: string;
    currentPeriodStart: Date;
    currentPeriodEnd: Date;
    trialStart?: Date;
    trialEnd?: Date;
    cancelAtPeriodEnd: boolean;
    createdAt: Date;
    updatedAt: Date;
}

// Contact types (now focused on clients only)
export interface Contact {
    id: string;
    userId: string;
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
    company?: string;
    position?: string;
    tags: string[];
    notes: string;
    interactions?: Array<{
        type: string;
        date: string;
        notes: string;
    }>;
    createdAt: Date;
    updatedAt: Date;
}

// Pipeline types
export interface Deal {
    id: string;
    userId: string;
    contactId: string;
    clientId?: string; // Link to the client company (optional for backward compatibility)
    title: string;
    value: number;
    stage: 'lead' | 'live-opportunity' | 'shortlist-sent' | 'interview' | 'offer' | 'placed';
    probability?: number; // Made optional since we're removing it from the form
    expectedCloseDate?: Date;
    notes: string;
    // New recruitment-specific fields
    jobType?: string; // permanent, contract, temporary, part-time, freelance
    requirements?: string; // Job requirements and skills
    startDate?: Date; // When the job starts
    salary?: string; // Salary range
    feePercentage?: number; // Recruitment fee percentage
    isExclusive?: boolean; // Exclusive recruitment terms
    companyName?: string; // Company hiring for this role
    location?: string; // Job location
    recruiter?: string; // Name of the recruiter working on this job
    contractType?: string; // permanent, fixed-term, rolling, project-based
    createdAt: Date;
    updatedAt: Date;
}

// Task types
export interface Task {
    id: string;
    userId: string;
    title: string;
    description?: string;
    dueDate?: Date;
    completed: boolean;
    priority: 'low' | 'medium' | 'high';
    relatedTo?: {
        type: 'contact' | 'deal' | 'task';
        id: string;
    };
    createdAt: Date;
    updatedAt: Date;
}

// Tag types
export interface Tag {
    id: string;
    name: string;
    userId: string;
    createdAt: Date;
}

export interface Interaction {
    id: string;
    contactId: string;
    userId: string;
    type: 'call' | 'meeting' | 'email' | 'note' | 'follow-up' | 'proposal' | 'other';
    date: Date;
    notes: string;
    createdAt: Date;
    updatedAt: Date;
} 
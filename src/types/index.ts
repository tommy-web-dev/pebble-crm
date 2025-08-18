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

// Contact types
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
    createdAt: Date;
    updatedAt: Date;
}

// Pipeline types
export interface Deal {
    id: string;
    userId: string;
    contactId: string;
    title: string;
    value: number;
    stage: 'lead' | 'negotiating' | 'live-opportunity' | 'closed-won' | 'closed-lost';
    probability: number;
    expectedCloseDate?: Date;
    notes: string;
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
    type: 'call' | 'meeting' | 'email' | 'note' | 'follow-up';
    date: Date;
    notes: string;
    createdAt: Date;
    updatedAt: Date;
} 
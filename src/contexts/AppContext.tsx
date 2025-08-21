import React, { ReactNode } from 'react';
import { create } from 'zustand';
import { Contact, Deal, Task, Tag, Interaction } from '../types';
import { getContacts, getDeals, getTasks, getTags, getAllInteractionsForUser, subscribeToContacts, subscribeToDeals, subscribeToTasks } from '../utils/firebase';

interface AppState {
    sidebarOpen: boolean;
    currentView: string;
    contacts: Contact[];
    deals: Deal[];
    tasks: Task[];
    tags: Tag[];
    interactions: Interaction[];
    loading: boolean;
    setSidebarOpen: (open: boolean) => void;
    setCurrentView: (view: string) => void;
    addContact: (contact: Contact) => void;
    updateContact: (id: string, updates: Partial<Contact>) => void;
    deleteContact: (id: string) => void;
    setContacts: (contacts: Contact[]) => void;
    addDeal: (deal: Deal) => void;
    updateDeal: (id: string, updates: Partial<Deal>) => void;
    deleteDeal: (id: string) => void;
    setDeals: (deals: Deal[]) => void;
    addTask: (task: Task) => void;
    updateTask: (id: string, updates: Partial<Task>) => void;
    deleteTask: (id: string) => void;
    setTasks: (tasks: Task[]) => void;
    addTag: (tag: Tag) => void;
    updateTag: (id: string, updates: Partial<Tag>) => void;
    deleteTag: (id: string) => void;
    setTags: (tags: Tag[]) => void;
    addInteraction: (interaction: Interaction) => void;
    updateInteraction: (id: string, updates: Partial<Interaction>) => void;
    deleteInteraction: (id: string) => void;
    setInteractions: (interactions: Interaction[]) => void;
    setLoading: (loading: boolean) => void;
    loadUserData: (userId: string) => Promise<void>;
}

export const useAppStore = create<AppState>((set) => ({
    // Initial State
    sidebarOpen: false,
    currentView: 'dashboard',
    contacts: [],
    deals: [],
    tasks: [],
    tags: [],
    interactions: [],
    loading: false,

    // Actions
    setSidebarOpen: (open) => set({ sidebarOpen: open }),
    setCurrentView: (view) => set({ currentView: view }),
    setContacts: (contacts) => set({ contacts }),
    setDeals: (deals) => set({ deals }),
    setTasks: (tasks) => set({ tasks }),
    setTags: (tags) => set({ tags }),
    setInteractions: (interactions) => set({ interactions }),

    addContact: (contact) => set((state) => ({
        contacts: [...state.contacts, contact]
    })),

    addDeal: (deal) => set((state) => ({
        deals: [...state.deals, deal]
    })),

    addTask: (task) => set((state) => ({
        tasks: [...state.tasks, task]
    })),

    addTag: (tag) => set((state) => ({
        tags: [...state.tags, tag]
    })),

    addInteraction: (interaction) => set((state) => ({
        interactions: [...state.interactions, interaction]
    })),

    updateContact: (id, updates) => set((state) => ({
        contacts: state.contacts.map(contact =>
            contact.id === id ? { ...contact, ...updates, updatedAt: new Date() } : contact
        )
    })),

    updateDeal: (id, updates) => set((state) => ({
        deals: state.deals.map(deal =>
            deal.id === id ? { ...deal, ...updates, updatedAt: new Date() } : deal
        )
    })),

    updateTask: (id, updates) => set((state) => ({
        tasks: state.tasks.map(task =>
            task.id === id ? { ...task, ...updates, updatedAt: new Date() } : task
        )
    })),

    updateTag: (id, updates) => set((state) => ({
        tags: state.tags.map(tag =>
            tag.id === id ? { ...tag, ...updates, updatedAt: new Date() } : tag
        )
    })),

    updateInteraction: (id, updates) => set((state) => ({
        interactions: state.interactions.map(interaction =>
            interaction.id === id ? { ...interaction, ...updates, updatedAt: new Date() } : interaction
        )
    })),

    deleteContact: (id) => set((state) => ({
        contacts: state.contacts.filter(contact => contact.id !== id)
    })),

    deleteDeal: (id) => set((state) => ({
        deals: state.deals.filter(deal => deal.id !== id)
    })),

    deleteTask: (id) => set((state) => ({
        tasks: state.tasks.filter(task => task.id !== id)
    })),

    deleteTag: (id) => set((state) => ({
        tags: state.tags.filter(tag => tag.id !== id)
    })),

    deleteInteraction: (id) => set((state) => ({
        interactions: state.interactions.filter(interaction => interaction.id !== id)
    })),

    setLoading: (loading) => set({ loading }),

    loadUserData: async (userId: string) => {
        set({ loading: true });
        try {
            // Load initial data
            const [contacts, deals, tasks, tags, interactions] = await Promise.all([
                getContacts(userId),
                getDeals(userId),
                getTasks(userId),
                getTags(userId),
                getAllInteractionsForUser(userId)
            ]);

            set({ contacts, deals, tasks, tags, interactions, loading: false });

            // Set up real-time subscriptions
            subscribeToContacts(userId, (contacts) => {
                set({ contacts });
            });

            subscribeToDeals(userId, (deals) => {
                set({ deals });
            });

            subscribeToTasks(userId, (tasks) => {
                set({ tasks });
            });
        } catch (error) {
            console.error('Error loading user data:', error);
            set({ loading: false });
        }
    },
}));

// AppProvider component for React Context compatibility
interface AppProviderProps {
    children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
    return <>{children}</>;
}; 
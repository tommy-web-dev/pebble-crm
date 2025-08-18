import {
    collection,
    doc,
    addDoc,
    updateDoc,
    deleteDoc,
    getDocs,
    getDoc,
    query,
    where,
    orderBy,
    onSnapshot,
    Timestamp,
    getDocsFromCache
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Contact, Deal, Task, Tag, Interaction } from '../types';

// Helper function to convert Firestore timestamps to Date objects
const convertTimestamps = (data: any) => {
    const converted = { ...data };
    if (converted.createdAt && converted.createdAt instanceof Timestamp) {
        converted.createdAt = converted.createdAt.toDate();
    }
    if (converted.updatedAt && converted.updatedAt instanceof Timestamp) {
        converted.updatedAt = converted.updatedAt.toDate();
    }
    if (converted.dueDate && converted.dueDate instanceof Timestamp) {
        converted.dueDate = converted.dueDate.toDate();
    }
    if (converted.expectedCloseDate && converted.expectedCloseDate instanceof Timestamp) {
        converted.expectedCloseDate = converted.expectedCloseDate.toDate();
    }
    if (converted.date && converted.date instanceof Timestamp) {
        converted.date = converted.date.toDate();
    }
    return converted;
};

// Test function to check Firestore connectivity
export const testFirestoreConnection = async () => {
    try {
        // Try to read from a test collection
        const testQuery = query(collection(db, 'test'), where('test', '==', 'test'));
        await getDocs(testQuery);
        return { success: true, message: 'Firestore connection successful' };
    } catch (error: any) {
        console.error('Firestore connection test failed:', error);
        return {
            success: false,
            message: error.message,
            code: error.code,
            details: error
        };
    }
};

// Test function to check basic Firestore connectivity
export const testBasicFirestoreConnection = async (userId: string) => {
    try {
        console.log('Testing basic Firestore connection...');

        // Try a simple query without any ordering
        const simpleQuery = query(
            contactsCollection,
            where('userId', '==', userId)
        );

        console.log('Simple query created:', simpleQuery);

        const snapshot = await getDocs(simpleQuery);
        console.log('Basic query successful, got', snapshot.docs.length, 'documents');

        return { success: true, message: 'Basic Firestore connection successful', count: snapshot.docs.length };
    } catch (error: any) {
        console.error('Basic Firestore connection test failed:', error);
        return {
            success: false,
            message: error.message,
            code: error.code,
            details: error
        };
    }
};

// Test function to check if basic Firestore operations work
export const testBasicFirestoreWrite = async (userId: string) => {
    try {
        console.log('Testing basic Firestore write...');

        // Try to write a simple test document
        const testDoc = {
            userId: userId,
            test: true,
            timestamp: Timestamp.now()
        };

        console.log('Writing test document:', testDoc);
        const docRef = await addDoc(contactsCollection, testDoc);
        console.log('Test document written successfully with ID:', docRef.id);

        // Now try to read it back
        console.log('Reading test document back...');
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            console.log('Test document read successfully:', docSnap.data());

            // Clean up - delete the test document
            console.log('Deleting test document...');
            await deleteDoc(docRef);
            console.log('Test document deleted successfully');

            return { success: true, message: 'Basic Firestore operations work' };
        } else {
            console.log('Test document not found after writing');
            return { success: false, message: 'Document not found after writing' };
        }
    } catch (error: any) {
        console.error('Basic Firestore test failed:', error);
        return {
            success: false,
            message: error.message,
            code: error.code,
            details: error
        };
    }
};

// Alternative approach - try to bypass configuration issues
export const testDirectFirestore = async (userId: string) => {
    try {
        console.log('Testing direct Firestore approach...');

        // Create a completely new Firestore instance with explicit settings
        const { initializeApp } = await import('firebase/app');
        const { getFirestore, collection, addDoc, getDocs, query, where, Timestamp } = await import('firebase/firestore');

        const firebaseConfig = {
            apiKey: "AIzaSyDipdhvekxXjwUGB3lhFRlCFsMsneBUvIc",
            authDomain: "pebble-99673.firebaseapp.com",
            projectId: "pebble-99673",
            storageBucket: "pebble-99673.firebasestorage.app",
            messagingSenderId: "680621796702",
            appId: "1:680621796702:web:2a7e773b5822b463b733cf",
            measurementId: "G-N1FNRPJ8K4"
        };

        // Create a fresh app instance
        const freshApp = initializeApp(firebaseConfig, 'test-app');
        const freshDb = getFirestore(freshApp);

        console.log('Fresh Firestore instance created');

        // Try to write a test document
        const testCollection = collection(freshDb, 'test');
        const testDoc = {
            userId: userId,
            test: true,
            timestamp: Timestamp.now(),
            message: 'Testing direct connection'
        };

        console.log('Attempting to write test document...');
        const docRef = await addDoc(testCollection, testDoc);
        console.log('Test document written successfully with ID:', docRef.id);

        // Try to read it back
        const q = query(testCollection, where('userId', '==', userId));
        const snapshot = await getDocs(q);
        console.log('Read back', snapshot.docs.length, 'test documents');

        return {
            success: true,
            message: 'Direct Firestore connection successful',
            docId: docRef.id,
            readCount: snapshot.docs.length
        };

    } catch (error: any) {
        console.error('Direct Firestore test failed:', error);
        return {
            success: false,
            message: error.message,
            code: error.code,
            details: error
        };
    }
};

// Contacts
export const contactsCollection = collection(db, 'contacts');

export const addContact = async (contact: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
        console.log('=== ADD CONTACT DEBUG START ===');
        console.log('Input contact data:', contact);
        console.log('Current user context - checking if we have access to db:', !!db);
        console.log('Contacts collection reference:', contactsCollection);

        // Filter out undefined values as Firestore doesn't support them
        const cleanContact = Object.fromEntries(
            Object.entries(contact).filter(([_, value]) => value !== undefined)
        );

        console.log('Cleaned contact data for Firestore:', cleanContact);
        console.log('Checking for any remaining undefined values...');

        // Additional check for undefined values
        Object.entries(cleanContact).forEach(([key, value]) => {
            if (value === undefined) {
                console.warn(`WARNING: Found undefined value for key: ${key}`);
            }
        });

        // Create the document data with Firestore timestamps
        const docData = {
            ...cleanContact,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
        };

        console.log('Final document data for Firestore:', docData);
        console.log('Data types:', Object.fromEntries(
            Object.entries(docData).map(([key, value]) => [key, typeof value])
        ));

        console.log('About to call addDoc...');
        const docRef = await addDoc(contactsCollection, docData);
        console.log('addDoc successful! Document ID:', docRef.id);

        // Return the complete contact object with JavaScript Date objects
        const newContact: Contact = {
            id: docRef.id,
            ...contact,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        console.log('Contact added successfully:', newContact);
        console.log('=== ADD CONTACT DEBUG END ===');
        return newContact;
    } catch (error) {
        console.error('=== ADD CONTACT ERROR ===');
        console.error('Error adding contact to Firestore:', error);
        console.error('Error details:', {
            code: (error as any)?.code,
            message: (error as any)?.message,
            stack: (error as any)?.stack
        });
        console.error('=== END ERROR ===');
        throw error;
    }
};

export const updateContact = async (id: string, updates: Partial<Contact>) => {
    try {
        // Filter out undefined values as Firestore doesn't support them
        const cleanUpdates = Object.fromEntries(
            Object.entries(updates).filter(([_, value]) => value !== undefined)
        );

        console.log('Original update data:', updates);
        console.log('Cleaned update data for Firestore:', cleanUpdates);

        // Create the update data with Firestore timestamp
        const updateData = {
            ...cleanUpdates,
            updatedAt: Timestamp.now(),
        };

        console.log('Final update data for Firestore:', updateData);

        const docRef = doc(db, 'contacts', id);
        await updateDoc(docRef, updateData);

        console.log('Contact updated successfully');
    } catch (error) {
        console.error('Error updating contact in Firestore:', error);
        throw error;
    }
};

export const deleteContact = async (id: string) => {
    const docRef = doc(db, 'contacts', id);
    await deleteDoc(docRef);
};

export const getContacts = async (userId: string) => {
    try {
        console.log('getContacts called for userId:', userId);

        // Use simple query without ordering to avoid 400 errors
        const q = query(
            contactsCollection,
            where('userId', '==', userId)
        );

        console.log('Executing simple query without ordering...');

        // Always try network first for fresh data, then fallback to cache
        try {
            console.log('Attempting network query for fresh data...');
            const snapshot = await getDocs(q);
            console.log('Network query successful, got', snapshot.docs.length, 'documents');

            const contacts = snapshot.docs.map(doc => ({
                id: doc.id,
                ...convertTimestamps(doc.data())
            })) as Contact[];

            // Sort by createdAt descending (newest first)
            contacts.sort((a, b) => {
                if (a.createdAt && b.createdAt) {
                    return b.createdAt.getTime() - a.createdAt.getTime();
                }
                return 0;
            });

            console.log('Returning', contacts.length, 'sorted contacts from network');
            return contacts;
        } catch (networkError) {
            console.log('Network query failed, falling back to cache...', networkError);

            // Fallback to cache
            const snapshot = await getDocsFromCache(q);
            console.log('Cache query successful, got', snapshot.docs.length, 'documents');

            const contacts = snapshot.docs.map(doc => ({
                id: doc.id,
                ...convertTimestamps(doc.data())
            })) as Contact[];

            // Sort by createdAt descending (newest first)
            contacts.sort((a, b) => {
                if (a.createdAt && b.createdAt) {
                    return b.createdAt.getTime() - a.createdAt.getTime();
                }
                return 0;
            });

            console.log('Returning', contacts.length, 'sorted contacts from cache');
            return contacts;
        }
    } catch (error: any) {
        console.error('Error in getContacts:', error);
        console.error('Error details:', {
            code: error.code,
            message: error.message
        });
        throw error;
    }
};

// Deals
export const dealsCollection = collection(db, 'deals');

export const addDeal = async (deal: Omit<Deal, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
        const docRef = await addDoc(dealsCollection, {
            ...deal,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
        });

        // Return the complete deal object with JavaScript Date objects
        const newDeal: Deal = {
            id: docRef.id,
            ...deal,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        return newDeal;
    } catch (error) {
        console.error('Error adding deal to Firestore:', error);
        throw error;
    }
};

export const updateDeal = async (id: string, updates: Partial<Deal>) => {
    const docRef = doc(db, 'deals', id);
    await updateDoc(docRef, {
        ...updates,
        updatedAt: Timestamp.now(),
    });
};

export const deleteDeal = async (id: string) => {
    const docRef = doc(db, 'deals', id);
    await deleteDoc(docRef);
};

export const getDeals = async (userId: string) => {
    try {
        console.log('getDeals called for userId:', userId);

        // Use simple query without ordering to avoid 400 errors
        const q = query(
            dealsCollection,
            where('userId', '==', userId)
        );

        const snapshot = await getDocs(q);
        const deals = snapshot.docs.map(doc => ({
            id: doc.id,
            ...convertTimestamps(doc.data())
        })) as Deal[];

        // Sort by createdAt descending (newest first)
        deals.sort((a, b) => {
            if (a.createdAt && b.createdAt) {
                return b.createdAt.getTime() - a.createdAt.getTime();
            }
            return 0;
        });

        return deals;
    } catch (error: any) {
        console.error('Error in getDeals:', error);
        throw error;
    }
};

// Tasks
export const tasksCollection = collection(db, 'tasks');

export const addTask = async (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
        console.log('=== ADD TASK DEBUG START ===');
        console.log('Input task data:', task);
        console.log('Current user context - checking if we have access to db:', !!db);
        console.log('Tasks collection reference:', tasksCollection);

        // Filter out undefined values as Firestore doesn't support them
        const cleanTask = Object.fromEntries(
            Object.entries(task).filter(([_, value]) => value !== undefined)
        );

        console.log('Cleaned task data for Firestore:', cleanTask);

        // Create the document data with Firestore timestamps
        const docData = {
            ...cleanTask,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
        };

        console.log('Final document data for Firestore:', docData);
        console.log('Data types:', Object.fromEntries(
            Object.entries(docData).map(([key, value]) => [key, typeof value])
        ));

        console.log('About to call addDoc...');
        const docRef = await addDoc(tasksCollection, docData);
        console.log('addDoc successful! Document ID:', docRef.id);

        // Return the complete task object with JavaScript Date objects
        const newTask: Task = {
            id: docRef.id,
            ...task,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        console.log('Task added successfully:', newTask);
        console.log('=== ADD TASK DEBUG END ===');
        return newTask;
    } catch (error) {
        console.error('=== ADD TASK ERROR ===');
        console.error('Error adding task to Firestore:', error);
        console.error('Error details:', {
            code: (error as any)?.code,
            message: (error as any)?.message,
            stack: (error as any)?.stack
        });
        console.error('=== END ERROR ===');
        throw error;
    }
};

export const updateTask = async (id: string, updates: Partial<Task>) => {
    const docRef = doc(db, 'tasks', id);
    await updateDoc(docRef, {
        ...updates,
        updatedAt: Timestamp.now(),
    });
};

export const deleteTask = async (id: string) => {
    const docRef = doc(db, 'tasks', id);
    await deleteDoc(docRef);
};

export const getTasks = async (userId: string) => {
    try {
        console.log('getTasks called for userId:', userId);

        // Use simple query without ordering to avoid 400 errors
        const q = query(
            tasksCollection,
            where('userId', '==', userId)
        );

        const snapshot = await getDocs(q);
        const tasks = snapshot.docs.map(doc => ({
            id: doc.id,
            ...convertTimestamps(doc.data())
        })) as Task[];

        // Sort by createdAt descending (newest first)
        tasks.sort((a, b) => {
            if (a.createdAt && b.createdAt) {
                return b.createdAt.getTime() - a.createdAt.getTime();
            }
            return 0;
        });

        return tasks;
    } catch (error: any) {
        console.error('Error in getTasks:', error);
        throw error;
    }
};

// Tags
export const tagsCollection = collection(db, 'tags');

export const addTag = async (tag: Omit<Tag, 'id' | 'createdAt'>) => {
    const docRef = await addDoc(tagsCollection, {
        ...tag,
        createdAt: Timestamp.now(),
    });
    return { id: docRef.id, ...tag };
};

export const getTags = async (userId: string) => {
    try {
        console.log('getTags called for userId:', userId);

        // Use simple query without ordering to avoid 400 errors
        const q = query(
            tagsCollection,
            where('userId', '==', userId)
        );

        const snapshot = await getDocs(q);
        const tags = snapshot.docs.map(doc => ({
            id: doc.id,
            ...convertTimestamps(doc.data())
        })) as Tag[];

        // Sort by createdAt descending (newest first)
        tags.sort((a, b) => {
            if (a.createdAt && b.createdAt) {
                return b.createdAt.getTime() - a.createdAt.getTime();
            }
            return 0;
        });

        return tags;
    } catch (error: any) {
        console.error('Error in getTags:', error);
        throw error;
    }
};

// Interactions
export const interactionsCollection = collection(db, 'interactions');

export const addInteraction = async (interaction: Omit<Interaction, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
        console.log('=== ADD INTERACTION DEBUG START ===');
        console.log('Input interaction data:', interaction);

        // Create the document data with Firestore timestamps
        const docData = {
            ...interaction,
            date: Timestamp.fromDate(interaction.date),
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
        };

        console.log('Final document data for Firestore:', docData);

        const docRef = await addDoc(interactionsCollection, docData);
        console.log('Interaction added successfully with ID:', docRef.id);

        // Return the complete interaction object with JavaScript Date objects
        const newInteraction: Interaction = {
            id: docRef.id,
            ...interaction,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        console.log('=== ADD INTERACTION DEBUG END ===');
        return newInteraction;
    } catch (error) {
        console.error('Error adding interaction to Firestore:', error);
        throw error;
    }
};

export const getInteractions = async (contactId: string, userId: string) => {
    try {
        console.log('getInteractions called for contactId:', contactId, 'userId:', userId);

        const q = query(
            interactionsCollection,
            where('contactId', '==', contactId),
            where('userId', '==', userId)
        );

        const snapshot = await getDocs(q);
        const interactions = snapshot.docs.map(doc => ({
            id: doc.id,
            ...convertTimestamps(doc.data())
        })) as Interaction[];

        // Sort by date descending (newest first)
        interactions.sort((a, b) => {
            if (a.date && b.date) {
                return b.date.getTime() - a.date.getTime();
            }
            return 0;
        });

        console.log('Returning', interactions.length, 'sorted interactions');
        return interactions;
    } catch (error: any) {
        console.error('Error in getInteractions:', error);
        throw error;
    }
};

export const updateInteraction = async (id: string, updates: Partial<Interaction>) => {
    try {
        // Filter out undefined values as Firestore doesn't support them
        const cleanUpdates = Object.fromEntries(
            Object.entries(updates).filter(([_, value]) => value !== undefined)
        );

        // Create the update data with Firestore timestamp
        const updateData: any = {
            ...cleanUpdates,
            updatedAt: Timestamp.now(),
        };

        // Convert date to Firestore timestamp if present
        if (updateData.date) {
            updateData.date = Timestamp.fromDate(updateData.date as Date);
        }

        const docRef = doc(db, 'interactions', id);
        await updateDoc(docRef, updateData);

        console.log('Interaction updated successfully');
    } catch (error) {
        console.error('Error updating interaction in Firestore:', error);
        throw error;
    }
};

export const deleteInteraction = async (id: string) => {
    const docRef = doc(db, 'interactions', id);
    await deleteDoc(docRef);
};

// Real-time listeners
export const subscribeToContacts = (userId: string, callback: (contacts: Contact[]) => void) => {
    console.log('subscribeToContacts called with userId:', userId);

    try {
        console.log('Attempting to create subscription with ordering...');
        // Try with ordering first
        const q = query(
            contactsCollection,
            where('userId', '==', userId),
            orderBy('createdAt', 'desc')
        );

        console.log('Query created successfully:', q);

        return onSnapshot(q, (snapshot) => {
            console.log('Snapshot received with ordering:', snapshot.docs.length, 'documents');
            const contacts = snapshot.docs.map(doc => ({
                id: doc.id,
                ...convertTimestamps(doc.data())
            })) as Contact[];
            callback(contacts);
        }, (error) => {
            console.error('Error in contacts subscription with ordering:', error);
            console.error('Error code:', error.code);
            console.error('Error message:', error.message);

            // If ordering fails, try without ordering
            if (error.code === 'failed-precondition' || error.code === 'unimplemented') {
                console.log('Falling back to subscription without ordering...');
                const fallbackQuery = query(
                    contactsCollection,
                    where('userId', '==', userId)
                );

                console.log('Fallback query created:', fallbackQuery);

                return onSnapshot(fallbackQuery, (snapshot) => {
                    console.log('Snapshot received without ordering:', snapshot.docs.length, 'documents');
                    const contacts = snapshot.docs.map(doc => ({
                        id: doc.id,
                        ...convertTimestamps(doc.data())
                    })) as Contact[];
                    callback(contacts);
                }, (fallbackError) => {
                    console.error('Error in fallback subscription:', fallbackError);
                });
            }
        });
    } catch (error) {
        console.error('Error setting up contacts subscription:', error);
        // Fallback to simple query
        console.log('Using fallback query due to error...');
        const fallbackQuery = query(
            contactsCollection,
            where('userId', '==', userId)
        );

        console.log('Fallback query created:', fallbackQuery);

        return onSnapshot(fallbackQuery, (snapshot) => {
            console.log('Snapshot received from fallback:', snapshot.docs.length, 'documents');
            const contacts = snapshot.docs.map(doc => ({
                id: doc.id,
                ...convertTimestamps(doc.data())
            })) as Contact[];
            callback(contacts);
        }, (fallbackError) => {
            console.error('Error in final fallback subscription:', fallbackError);
        });
    }
};

export const subscribeToDeals = (userId: string, callback: (deals: Deal[]) => void) => {
    try {
        const q = query(
            dealsCollection,
            where('userId', '==', userId),
            orderBy('createdAt', 'desc')
        );

        return onSnapshot(q, (snapshot) => {
            const deals = snapshot.docs.map(doc => ({
                id: doc.id,
                ...convertTimestamps(doc.data())
            })) as Deal[];
            callback(deals);
        }, (error) => {
            console.error('Error in deals subscription:', error);
            // Fallback without ordering
            const fallbackQuery = query(
                dealsCollection,
                where('userId', '==', userId)
            );

            return onSnapshot(fallbackQuery, (snapshot) => {
                const deals = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...convertTimestamps(doc.data())
                })) as Deal[];
                callback(deals);
            });
        });
    } catch (error) {
        console.error('Error setting up deals subscription:', error);
        const fallbackQuery = query(
            dealsCollection,
            where('userId', '==', userId)
        );

        return onSnapshot(fallbackQuery, (snapshot) => {
            const deals = snapshot.docs.map(doc => ({
                id: doc.id,
                ...convertTimestamps(doc.data())
            })) as Deal[];
            callback(deals);
        });
    }
};

export const subscribeToTasks = (userId: string, callback: (tasks: Task[]) => void) => {
    try {
        const q = query(
            tasksCollection,
            where('userId', '==', userId),
            orderBy('createdAt', 'desc')
        );

        return onSnapshot(q, (snapshot) => {
            const tasks = snapshot.docs.map(doc => ({
                id: doc.id,
                ...convertTimestamps(doc.data())
            })) as Task[];
            callback(tasks);
        }, (error) => {
            console.error('Error in tasks subscription:', error);
            // Fallback without ordering
            const fallbackQuery = query(
                tasksCollection,
                where('userId', '==', userId)
            );

            return onSnapshot(fallbackQuery, (snapshot) => {
                const tasks = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...convertTimestamps(doc.data())
                })) as Task[];
                callback(tasks);
            });
        });
    } catch (error) {
        console.error('Error setting up tasks subscription:', error);
        const fallbackQuery = query(
            tasksCollection,
            where('userId', '==', userId)
        );

        return onSnapshot(fallbackQuery, (snapshot) => {
            const tasks = snapshot.docs.map(doc => ({
                id: doc.id,
                ...convertTimestamps(doc.data())
            })) as Task[];
            callback(tasks);
        });
    }
}; 
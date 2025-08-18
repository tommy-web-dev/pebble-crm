import React, { useState, useEffect } from 'react';
import { useAppStore } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';
import { Contact, Task } from '../types';
import { getContacts, getTasks, addTask, updateTask, deleteTask } from '../utils/firebase';
import TaskForm from '../components/TaskForm';

const Tasks: React.FC = () => {
    const { currentUser } = useAuth();
    const { tasks, setTasks, addTask: addTaskToStore, updateTask: updateTaskInStore, deleteTask: deleteTaskFromStore } = useAppStore();

    const [contacts, setContacts] = useState<Contact[]>([]);
    const [loadingTasks, setLoadingTasks] = useState(true);
    const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);

    // Load tasks from Firebase when component mounts
    useEffect(() => {
        if (currentUser) {
            const loadTasks = async () => {
                try {
                    setLoadingTasks(true);
                    const firebaseTasks = await getTasks(currentUser.uid);
                    setTasks(firebaseTasks);
                } catch (error) {
                    console.error('Error loading tasks:', error);
                } finally {
                    setLoadingTasks(false);
                }
            };
            loadTasks();
        }
    }, [currentUser, setTasks]);

    // Load contacts for task creation
    useEffect(() => {
        if (currentUser) {
            const loadContacts = async () => {
                try {
                    const loadedContacts = await getContacts(currentUser.uid);
                    setContacts(loadedContacts);
                } catch (error) {
                    console.error('Error loading contacts for tasks:', error);
                }
            };
            loadContacts();
        }
    }, [currentUser]);

    const getContactName = (contactId: string): string => {
        const contact = contacts.find(c => c.id === contactId);
        return contact ? `${contact.firstName} ${contact.lastName}` : 'Unknown Contact';
    };

    const isFollowUpTask = (task: Task): boolean => {
        return task.title.toLowerCase().includes('follow-up') || task.title.toLowerCase().includes('follow up');
    };

    const handleAddTask = async (taskData: Omit<Task, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
        if (!currentUser) return;

        try {
            const newTask = await addTask({
                ...taskData,
                userId: currentUser.uid
            });

            // Task added to Firebase - DataLoader will automatically update the store
            setIsTaskFormOpen(false);
        } catch (error) {
            console.error('Error adding task:', error);
            alert('Failed to add task. Please try again.');
        }
    };

    const handleUpdateTask = async (taskData: Omit<Task, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
        if (!selectedTask) return;

        try {
            await updateTask(selectedTask.id, taskData);

            // Task updated in Firebase - DataLoader will automatically update the store
            setIsTaskFormOpen(false);
            setSelectedTask(null);
        } catch (error) {
            console.error('Error updating task:', error);
            alert('Failed to update task. Please try again.');
        }
    };

    const handleDeleteTask = async (taskId: string) => {
        try {
            await deleteTask(taskId);
            // Task deleted from Firebase - DataLoader will automatically update the store
        } catch (error) {
            console.error('Error deleting task:', error);
            alert('Failed to delete task. Please try again.');
        }
    };

    const handleToggleComplete = async (taskId: string) => {
        const task = tasks.find(t => t.id === taskId);
        if (!task) return;

        try {
            await updateTask(taskId, { completed: !task.completed });
            // Task updated in Firebase - DataLoader will automatically update the store
        } catch (error) {
            console.error('Error updating task:', error);
            alert('Failed to update task. Please try again.');
        }
    };

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

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="space-y-2">
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 bg-clip-text text-transparent">
                            Tasks
                        </h1>
                        <p className="text-lg text-slate-600 font-medium">Manage your tasks and follow-up reminders</p>
                    </div>
                    <button
                        onClick={() => setIsTaskFormOpen(true)}
                        className="group inline-flex items-center px-6 py-3 bg-gradient-to-r from-slate-600 to-blue-600 text-white text-sm font-semibold rounded-xl hover:from-slate-700 hover:to-blue-700 focus:ring-4 focus:ring-blue-500/20 focus:ring-offset-2 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
                    >
                        <svg className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Add Task
                    </button>
                </div>

                {loadingTasks ? (
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-12 text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-600 mx-auto mb-6"></div>
                        <p className="text-lg text-slate-600 font-medium">Loading tasks...</p>
                    </div>
                ) : tasks.length > 0 ? (
                    <div className="space-y-6">
                        {/* Overdue Tasks */}
                        {tasks.filter(task => !task.completed && task.dueDate && new Date(task.dueDate) < new Date()).length > 0 && (
                            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
                                <h2 className="text-xl font-bold text-red-600 mb-4 flex items-center">
                                    <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                    </svg>
                                    Overdue Tasks
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {tasks
                                        .filter(task => !task.completed && task.dueDate && new Date(task.dueDate) < new Date())
                                        .map((task) => (
                                            <div key={task.id} className="bg-gradient-to-r from-red-50 to-red-100 rounded-xl p-4 border border-red-200 hover:shadow-md transition-all duration-200">
                                                <div className="flex items-start justify-between mb-3">
                                                    <input
                                                        type="checkbox"
                                                        checked={task.completed}
                                                        onChange={() => handleToggleComplete(task.id)}
                                                        className="h-5 w-5 text-red-600 focus:ring-red-500 border-red-300 rounded mt-1"
                                                    />
                                                    <div className="flex space-x-2">
                                                        <button
                                                            onClick={() => {
                                                                setSelectedTask(task);
                                                                setIsTaskFormOpen(true);
                                                            }}
                                                            className="text-red-600 hover:text-red-800 p-1 hover:bg-red-200 rounded transition-colors duration-200"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                            </svg>
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteTask(task.id)}
                                                            className="text-red-600 hover:text-red-800 p-1 hover:bg-red-200 rounded transition-colors duration-200"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </div>
                                                <h3 className="font-semibold text-red-900 mb-2">{task.title}</h3>
                                                {task.description && (
                                                    <p className="text-sm text-red-700 mb-3">{task.description}</p>
                                                )}
                                                <div className="space-y-2">
                                                    <div className="flex items-center text-sm text-red-600">
                                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                        </svg>
                                                        Due: {formatDate(task.dueDate)}
                                                    </div>
                                                    {isFollowUpTask(task) && (
                                                        <div className="flex items-center text-sm text-red-600">
                                                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                                            </svg>
                                                            Follow-up Task
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            </div>
                        )}

                        {/* Upcoming Tasks */}
                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
                            <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center">
                                <svg className="w-6 h-6 mr-2 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                Upcoming Tasks
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {tasks
                                    .filter(task => !task.completed && (!task.dueDate || new Date(task.dueDate) >= new Date()))
                                    .map((task) => (
                                        <div key={task.id} className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl p-4 border border-slate-200 hover:shadow-md transition-all duration-200">
                                            <div className="flex items-start justify-between mb-3">
                                                <input
                                                    type="checkbox"
                                                    checked={task.completed}
                                                    onChange={() => handleToggleComplete(task.id)}
                                                    className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-slate-300 rounded mt-1"
                                                />
                                                <div className="flex space-x-2">
                                                    <button
                                                        onClick={() => {
                                                            setSelectedTask(task);
                                                            setIsTaskFormOpen(true);
                                                        }}
                                                        className="text-blue-600 hover:text-blue-800 p-1 hover:bg-blue-200 rounded transition-colors duration-200"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                        </svg>
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteTask(task.id)}
                                                        className="text-red-600 hover:text-red-800 p-1 hover:bg-red-200 rounded transition-colors duration-200"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </div>
                                            <h3 className="font-semibold text-slate-900 mb-2">{task.title}</h3>
                                            {task.description && (
                                                <p className="text-sm text-slate-700 mb-3">{task.description}</p>
                                            )}
                                            <div className="space-y-2">
                                                {task.dueDate && (
                                                    <div className="flex items-center text-sm text-slate-600">
                                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                        </svg>
                                                        Due: {formatDate(task.dueDate)}
                                                    </div>
                                                )}
                                                {isFollowUpTask(task) && (
                                                    <div className="flex items-center text-sm text-slate-600">
                                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                                        </svg>
                                                        Follow-up Task
                                                    </div>
                                                )}
                                            </div>
                                            <div className="mt-3">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${task.priority === 'high' ? 'bg-red-100 text-red-800 border border-red-200' :
                                                    task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
                                                        'bg-green-100 text-green-800 border border-green-200'
                                                    }`}>
                                                    {task.priority}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        </div>

                        {/* Completed Tasks */}
                        {tasks.filter(task => task.completed).length > 0 && (
                            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
                                <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center">
                                    <svg className="w-6 h-6 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Completed Tasks
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {tasks
                                        .filter(task => task.completed)
                                        .map((task) => (
                                            <div key={task.id} className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-4 border border-green-200 opacity-75">
                                                <div className="flex items-start justify-between mb-3">
                                                    <input
                                                        type="checkbox"
                                                        checked={task.completed}
                                                        onChange={() => handleToggleComplete(task.id)}
                                                        className="h-5 w-5 text-green-600 focus:ring-green-500 border-green-300 rounded mt-1"
                                                    />
                                                    <div className="flex space-x-2">
                                                        <button
                                                            onClick={() => handleDeleteTask(task.id)}
                                                            className="text-red-600 hover:text-red-800 p-1 hover:bg-red-200 rounded transition-colors duration-200"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </div>
                                                <h3 className="font-semibold text-green-900 mb-2 line-through">{task.title}</h3>
                                                {task.description && (
                                                    <p className="text-sm text-green-700 mb-3 line-through">{task.description}</p>
                                                )}
                                                <div className="text-sm text-green-600 font-medium">
                                                    Completed on {task.dueDate ? formatDate(task.dueDate) : 'Unknown date'}
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-12 text-center">
                        <div className="text-6xl mb-4">✅</div>
                        <h3 className="text-2xl font-bold text-slate-900 mb-3">No tasks yet</h3>
                        <p className="text-slate-600 mb-6 text-lg">Start organizing your work by adding your first task.</p>
                        <button
                            onClick={() => setIsTaskFormOpen(true)}
                            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-slate-600 to-blue-600 text-white text-lg font-semibold rounded-xl hover:from-slate-700 hover:to-blue-700 focus:ring-4 focus:ring-blue-500/20 focus:ring-offset-2 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
                        >
                            <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            Add Your First Task
                        </button>
                    </div>
                )}

                {/* Task Form Modal */}
                <TaskForm
                    task={selectedTask}
                    contacts={contacts}
                    onSubmit={selectedTask ? handleUpdateTask : handleAddTask}
                    onCancel={() => {
                        setIsTaskFormOpen(false);
                        setSelectedTask(null);
                    }}
                    isOpen={isTaskFormOpen}
                />
            </div>
        </div>
    );
};

export default Tasks;
import React, { useState, useEffect, useMemo } from 'react';
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
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStatus, setSelectedStatus] = useState<string>('all');
    const [sortBy, setSortBy] = useState<'title' | 'dueDate' | 'priority' | 'contact' | 'createdAt'>('dueDate');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

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

    const getContactName = (task: Task): string => {
        if (task.relatedTo && task.relatedTo.type === 'contact') {
            const contact = contacts.find(c => c.id === task.relatedTo!.id);
            return contact ? `${contact.firstName} ${contact.lastName}` : 'Unknown Contact';
        }
        return 'No Contact';
    };

    // Calculate summary metrics
    const summaryMetrics = useMemo(() => {
        const openTasks = tasks.filter(task => !task.completed);
        const overdueTasks = openTasks.filter(task => task.dueDate && new Date(task.dueDate) < new Date());
        const completedTasks = tasks.filter(task => task.completed);

        return {
            open: {
                count: openTasks.length,
                value: openTasks.length
            },
            overdue: {
                count: overdueTasks.length,
                value: overdueTasks.length
            },
            completed: {
                count: completedTasks.length,
                value: completedTasks.length
            }
        };
    }, [tasks]);

    // Filter and sort tasks
    const filteredTasks = useMemo(() => {
        let filtered = tasks;

        // Filter by search term
        if (searchTerm) {
            filtered = filtered.filter(task =>
                task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
                getContactName(task).toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Filter by status
        if (selectedStatus !== 'all') {
            switch (selectedStatus) {
                case 'open':
                    filtered = filtered.filter(task => !task.completed);
                    break;
                case 'overdue':
                    filtered = filtered.filter(task => !task.completed && task.dueDate && new Date(task.dueDate) < new Date());
                    break;
                case 'completed':
                    filtered = filtered.filter(task => task.completed);
                    break;
            }
        }

        // Sort tasks
        filtered.sort((a, b) => {
            let aValue: any, bValue: any;

            switch (sortBy) {
                case 'title':
                    aValue = a.title.toLowerCase();
                    bValue = b.title.toLowerCase();
                    break;
                case 'dueDate':
                    aValue = a.dueDate ? new Date(a.dueDate).getTime() : 0;
                    bValue = b.dueDate ? new Date(b.dueDate).getTime() : 0;
                    break;
                case 'priority':
                    const priorityOrder = { high: 3, medium: 2, low: 1 };
                    aValue = priorityOrder[a.priority as keyof typeof priorityOrder] || 0;
                    bValue = priorityOrder[b.priority as keyof typeof priorityOrder] || 0;
                    break;
                case 'contact':
                    aValue = getContactName(a).toLowerCase();
                    bValue = getContactName(b).toLowerCase();
                    break;
                case 'createdAt':
                    aValue = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                    bValue = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                    break;
                default:
                    return 0;
            }

            if (sortOrder === 'asc') {
                return aValue > bValue ? 1 : -1;
            } else {
                return aValue < bValue ? 1 : -1;
            }
        });

        return filtered;
    }, [tasks, searchTerm, selectedStatus, sortBy, sortOrder, contacts]);

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

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high':
                return 'bg-red-100 text-red-800 border-red-200';
            case 'medium':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'low':
                return 'bg-green-100 text-green-800 border-green-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getStatusColor = (task: Task) => {
        if (task.completed) return 'bg-green-100 text-green-800 border-green-200';
        if (task.dueDate && new Date(task.dueDate) < new Date()) return 'bg-red-100 text-red-800 border-red-200';
        return 'bg-blue-100 text-blue-800 border-blue-200';
    };

    const getStatusText = (task: Task) => {
        if (task.completed) return 'Completed';
        if (task.dueDate && new Date(task.dueDate) < new Date()) return 'Overdue';
        return 'Open';
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
                    <>
                        {/* Summary Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Open Tasks */}
                            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
                                <div className="flex items-center">
                                    <div className="p-3 rounded-xl bg-blue-100 text-blue-600 mr-4">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-slate-600">Open Tasks</p>
                                        <p className="text-2xl font-bold text-slate-900">{summaryMetrics.open.count}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Overdue Tasks */}
                            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
                                <div className="flex items-center">
                                    <div className="p-3 rounded-xl bg-red-100 text-red-600 mr-4">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-slate-600">Overdue Tasks</p>
                                        <p className="text-2xl font-bold text-red-600">{summaryMetrics.overdue.count}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Completed Tasks */}
                            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
                                <div className="flex items-center">
                                    <div className="p-3 rounded-xl bg-green-100 text-green-600 mr-4">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-slate-600">Completed Tasks</p>
                                        <p className="text-2xl font-bold text-green-600">{summaryMetrics.completed.count}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Search and Filter Section */}
                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
                            <div className="flex flex-col md:flex-row gap-4">
                                {/* Search */}
                                <div className="flex-1">
                                    <input
                                        type="text"
                                        placeholder="Search tasks..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                    />
                                </div>

                                {/* Status Filter */}
                                <div className="w-full md:w-48">
                                    <select
                                        value={selectedStatus}
                                        onChange={(e) => setSelectedStatus(e.target.value)}
                                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                    >
                                        <option value="all">All Statuses</option>
                                        <option value="open">Open</option>
                                        <option value="overdue">Overdue</option>
                                        <option value="completed">Completed</option>
                                    </select>
                                </div>

                                {/* Sort By */}
                                <div className="w-full md:w-48">
                                    <select
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value as any)}
                                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                    >
                                        <option value="dueDate">Sort by Due Date</option>
                                        <option value="title">Sort by Title</option>
                                        <option value="priority">Sort by Priority</option>
                                        <option value="contact">Sort by Contact</option>
                                        <option value="createdAt">Sort by Created</option>
                                    </select>
                                </div>

                                {/* Sort Order */}
                                <div className="w-full md:w-32">
                                    <button
                                        onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                                        className="w-full px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 flex items-center justify-center"
                                    >
                                        {sortOrder === 'asc' ? '↑' : '↓'}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Tasks Table */}
                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-slate-200">
                                    <thead className="bg-slate-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                                Status
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                                Task
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                                Contact
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                                Due Date
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                                Priority
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-slate-200">
                                        {filteredTasks.map((task) => (
                                            <tr key={task.id} className="hover:bg-slate-50 transition-colors duration-200">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(task)}`}>
                                                        {getStatusText(task)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center">
                                                        <input
                                                            type="checkbox"
                                                            checked={task.completed}
                                                            onChange={() => handleToggleComplete(task.id)}
                                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded mr-3"
                                                        />
                                                        <div>
                                                            <div className="text-sm font-medium text-slate-900">
                                                                {task.completed ? <span className="line-through">{task.title}</span> : task.title}
                                                            </div>
                                                            {task.description && (
                                                                <div className="text-sm text-slate-500">
                                                                    {task.completed ? <span className="line-through">{task.description}</span> : task.description}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                                                    {getContactName(task)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                                                    {task.dueDate ? formatDate(task.dueDate) : 'No due date'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getPriorityColor(task.priority)}`}>
                                                        {task.priority}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <div className="flex space-x-2">
                                                        <button
                                                            onClick={() => {
                                                                setSelectedTask(task);
                                                                setIsTaskFormOpen(true);
                                                            }}
                                                            className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-100 rounded transition-colors duration-200"
                                                            title="Edit task"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                            </svg>
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteTask(task.id)}
                                                            className="text-red-600 hover:text-red-900 p-1 hover:bg-red-100 rounded transition-colors duration-200"
                                                            title="Delete task"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {filteredTasks.length === 0 && (
                                <div className="text-center py-12">
                                    <div className="text-4xl mb-4">🔍</div>
                                    <h3 className="text-lg font-medium text-slate-900 mb-2">No tasks found</h3>
                                    <p className="text-slate-600">Try adjusting your search or filter criteria.</p>
                                </div>
                            )}
                        </div>
                    </>
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
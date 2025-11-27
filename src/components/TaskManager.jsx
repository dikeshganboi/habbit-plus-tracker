import { useState, useEffect, useMemo } from 'react';
import { collection, query, getDocs, addDoc, updateDoc, doc, deleteDoc, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { Plus, Trash2, Circle, CheckCircle2, AlertCircle, Search, Calendar, Tag, SortAsc, SortDesc, Edit2, X } from 'lucide-react';
import { XP_REWARDS } from './XPSystem';

function TaskManager({ userId, onXPEarned }) {
  const [tasks, setTasks] = useState([]);
  const [newTaskText, setNewTaskText] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState('Medium');
  const [newTaskCategory, setNewTaskCategory] = useState('Personal');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, active, completed
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('createdAt'); // createdAt, priority, dueDate, alphabetical
  const [sortOrder, setSortOrder] = useState('desc'); // asc, desc
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editText, setEditText] = useState('');
  
  const categories = ['Personal', 'Work', 'Health', 'Learning', 'Shopping', 'Other'];

  useEffect(() => {
    if (!userId) return;
    fetchTasks();
  }, [userId]);

  const fetchTasks = async () => {
    try {
      const tasksRef = collection(db, 'users', userId, 'tasks');
      const tasksQuery = query(tasksRef, orderBy('createdAt', 'desc'));
      const tasksSnapshot = await getDocs(tasksQuery);
      
      const tasksData = tasksSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setTasks(tasksData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setLoading(false);
    }
  };

  const addTask = async (e) => {
    e.preventDefault();
    if (!newTaskText.trim() || !userId) return;

    try {
      const tasksRef = collection(db, 'users', userId, 'tasks');
      await addDoc(tasksRef, {
        text: newTaskText.trim(),
        priority: newTaskPriority,
        category: newTaskCategory,
        dueDate: newTaskDueDate || null,
        completed: false,
        createdAt: new Date().toISOString()
      });
      
      setNewTaskText('');
      setNewTaskPriority('Medium');
      setNewTaskCategory('Personal');
      setNewTaskDueDate('');
      fetchTasks();
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };

  const updateTask = async (taskId, updates) => {
    try {
      const taskRef = doc(db, 'users', userId, 'tasks', taskId);
      await updateDoc(taskRef, updates);
      fetchTasks();
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const startEditTask = (task) => {
    setEditingTaskId(task.id);
    setEditText(task.text);
  };

  const saveEditTask = async (taskId) => {
    if (!editText.trim()) return;
    await updateTask(taskId, { text: editText.trim() });
    setEditingTaskId(null);
    setEditText('');
  };

  const cancelEdit = () => {
    setEditingTaskId(null);
    setEditText('');
  };

  const toggleTask = async (taskId) => {
    try {
      const task = tasks.find(t => t.id === taskId);
      const isCompleting = !task.completed;
      
      const taskRef = doc(db, 'users', userId, 'tasks', taskId);
      await updateDoc(taskRef, {
        completed: !task.completed
      });
      
      // Award XP for completing a task
      if (isCompleting && onXPEarned) {
        onXPEarned(XP_REWARDS.TASK_COMPLETE);
      }
      
      fetchTasks();
    } catch (error) {
      console.error('Error toggling task:', error);
    }
  };

  const deleteTask = async (taskId) => {
    try {
      const taskRef = doc(db, 'users', userId, 'tasks', taskId);
      await deleteDoc(taskRef);
      fetchTasks();
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const getPriorityStyles = (priority) => {
    switch (priority) {
      case 'High':
        return {
          bg: 'bg-red-500/20',
          text: 'text-red-400',
          border: 'border-red-500/50',
          icon: <AlertCircle size={14} />
        };
      case 'Low':
        return {
          bg: 'bg-emerald-500/20',
          text: 'text-emerald-400',
          border: 'border-emerald-500/50',
          icon: <CheckCircle2 size={14} />
        };
      default: // Medium
        return {
          bg: 'bg-yellow-500/20',
          text: 'text-yellow-400',
          border: 'border-yellow-500/50',
          icon: <Circle size={14} />
        };
    }
  };

  const filteredAndSortedTasks = useMemo(() => {
    let filtered = tasks.filter(task => {
      // Status filter
      if (filter === 'active' && task.completed) return false;
      if (filter === 'completed' && !task.completed) return false;
      
      // Category filter
      if (categoryFilter !== 'all' && task.category !== categoryFilter) return false;
      
      // Search filter
      if (searchQuery.trim() && !task.text.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      
      return true;
    });

    // Sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'priority':
          const priorityOrder = { 'High': 3, 'Medium': 2, 'Low': 1 };
          comparison = (priorityOrder[b.priority] || 2) - (priorityOrder[a.priority] || 2);
          break;
        case 'dueDate':
          const aDate = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
          const bDate = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
          comparison = aDate - bDate;
          break;
        case 'alphabetical':
          comparison = a.text.localeCompare(b.text);
          break;
        default: // createdAt
          comparison = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      
      return sortOrder === 'asc' ? -comparison : comparison;
    });

    return filtered;
  }, [tasks, filter, categoryFilter, searchQuery, sortBy, sortOrder]);

  const activeTasks = tasks.filter(t => !t.completed).length;
  const completedTasks = tasks.filter(t => t.completed).length;
  const overdueTasks = tasks.filter(t => !t.completed && t.dueDate && new Date(t.dueDate) < new Date()).length;

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Work': return '💼';
      case 'Health': return '❤️';
      case 'Learning': return '📚';
      case 'Shopping': return '🛒';
      default: return '📌';
    }
  };

  const isOverdue = (dueDate) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date() && new Date(dueDate).toDateString() !== new Date().toDateString();
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-zinc-400">Loading tasks...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Task Manager</h2>
          <p className="text-gray-600 dark:text-zinc-400 mt-1 text-sm">Organize and prioritize your to-do list</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-gradient-to-b from-white to-gray-50 dark:from-zinc-900 dark:to-zinc-900/80 border-2 border-gray-300 dark:border-zinc-700 rounded-lg sm:rounded-xl p-3 sm:p-4 text-center shadow-[0_2px_8px_rgba(0,0,0,0.1)] dark:shadow-[0_2px_12px_rgba(0,0,0,0.3)]">
          <div className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white mb-1">{tasks.length}</div>
          <div className="text-xs sm:text-sm text-gray-600 dark:text-zinc-400 font-bold">Total</div>
        </div>
        <div className="bg-gradient-to-b from-white to-blue-50 dark:from-zinc-900 dark:to-blue-900/10 border-2 border-blue-300 dark:border-blue-700 rounded-lg sm:rounded-xl p-3 sm:p-4 text-center shadow-[0_2px_8px_rgba(59,130,246,0.2)] dark:shadow-[0_2px_12px_rgba(59,130,246,0.3)]">
          <div className="text-xl sm:text-2xl font-black text-blue-700 dark:text-blue-300 mb-1">{activeTasks}</div>
          <div className="text-xs sm:text-sm text-gray-600 dark:text-zinc-400 font-bold">Active</div>
        </div>
        <div className="bg-gradient-to-b from-white to-emerald-50 dark:from-zinc-900 dark:to-emerald-900/10 border-2 border-emerald-300 dark:border-emerald-700 rounded-lg sm:rounded-xl p-3 sm:p-4 text-center shadow-[0_2px_8px_rgba(16,185,129,0.2)] dark:shadow-[0_2px_12px_rgba(16,185,129,0.3)]">
          <div className="text-xl sm:text-2xl font-black text-emerald-700 dark:text-emerald-300 mb-1">{completedTasks}</div>
          <div className="text-xs sm:text-sm text-gray-600 dark:text-zinc-400 font-bold">Done</div>
        </div>
        <div className="bg-gradient-to-b from-white to-red-50 dark:from-zinc-900 dark:to-red-900/10 border-2 border-red-300 dark:border-red-700 rounded-lg sm:rounded-xl p-3 sm:p-4 text-center shadow-[0_2px_8px_rgba(239,68,68,0.2)] dark:shadow-[0_2px_12px_rgba(239,68,68,0.3)]">
          <div className="text-xl sm:text-2xl font-black text-red-700 dark:text-red-300 mb-1">{overdueTasks}</div>
          <div className="text-xs sm:text-sm text-gray-600 dark:text-zinc-400 font-bold">Overdue</div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-gradient-to-b from-white to-gray-50 dark:from-zinc-900 dark:to-zinc-900/80 border-2 border-gray-300 dark:border-zinc-700 rounded-xl p-4 shadow-[0_4px_12px_rgba(0,0,0,0.1)] dark:shadow-[0_4px_16px_rgba(0,0,0,0.3)]">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-zinc-500" size={18} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks..."
              className="w-full bg-white dark:bg-zinc-800 border-2 border-gray-400 dark:border-zinc-600 rounded-lg pl-10 pr-4 py-2.5 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-zinc-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-sm font-medium shadow-inner"
            />
          </div>
          
          {/* Sort */}
          <div className="flex gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-white dark:bg-zinc-800 border-2 border-gray-400 dark:border-zinc-600 rounded-lg px-3 py-2.5 text-gray-900 dark:text-white focus:outline-none focus:border-indigo-500 cursor-pointer text-sm font-medium shadow-inner"
            >
              <option value="createdAt">Date Created</option>
              <option value="priority">Priority</option>
              <option value="dueDate">Due Date</option>
              <option value="alphabetical">A-Z</option>
            </select>
            
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="bg-white dark:bg-zinc-800 border-2 border-gray-400 dark:border-zinc-600 rounded-lg px-3 hover:bg-gray-50 dark:hover:bg-zinc-700 transition-colors shadow-inner"
            >
              {sortOrder === 'asc' ? <SortAsc size={18} className="text-gray-700 dark:text-zinc-300" /> : <SortDesc size={18} className="text-gray-700 dark:text-zinc-300" />}
            </button>
          </div>
        </div>
        
        {/* Category Filter */}
        <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
          <button
            onClick={() => setCategoryFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
              categoryFilter === 'all'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-gray-200 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 hover:bg-gray-300 dark:hover:bg-zinc-700'
            }`}
          >
            All
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                categoryFilter === cat
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-gray-200 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 hover:bg-gray-300 dark:hover:bg-zinc-700'
              }`}
            >
              {getCategoryIcon(cat)} {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Add Task Form */}
      <form onSubmit={addTask} className="bg-gradient-to-b from-white to-gray-50 dark:from-zinc-900 dark:to-zinc-900/80 border-2 border-gray-300 dark:border-zinc-700 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-[0_4px_16px_rgba(0,0,0,0.1)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
        <div className="space-y-3">
          <input
            type="text"
            value={newTaskText}
            onChange={(e) => setNewTaskText(e.target.value)}
            placeholder="Enter a new task..."
            className="w-full bg-white dark:bg-zinc-800 border-2 border-gray-400 dark:border-zinc-600 rounded-lg px-4 py-3 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-zinc-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-sm sm:text-base font-medium shadow-inner"
          />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <select
              value={newTaskPriority}
              onChange={(e) => setNewTaskPriority(e.target.value)}
              className="bg-white dark:bg-zinc-800 border-2 border-gray-400 dark:border-zinc-600 rounded-lg px-4 py-2.5 text-gray-900 dark:text-white focus:outline-none focus:border-indigo-500 cursor-pointer text-sm font-medium shadow-inner"
            >
              <option value="High">🔴 High Priority</option>
              <option value="Medium">🟡 Medium</option>
              <option value="Low">🟢 Low Priority</option>
            </select>
            
            <select
              value={newTaskCategory}
              onChange={(e) => setNewTaskCategory(e.target.value)}
              className="bg-white dark:bg-zinc-800 border-2 border-gray-400 dark:border-zinc-600 rounded-lg px-4 py-2.5 text-gray-900 dark:text-white focus:outline-none focus:border-indigo-500 cursor-pointer text-sm font-medium shadow-inner"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{getCategoryIcon(cat)} {cat}</option>
              ))}
            </select>
            
            <input
              type="date"
              value={newTaskDueDate}
              onChange={(e) => setNewTaskDueDate(e.target.value)}
              className="bg-white dark:bg-zinc-800 border-2 border-gray-400 dark:border-zinc-600 rounded-lg px-4 py-2.5 text-gray-900 dark:text-white focus:outline-none focus:border-indigo-500 cursor-pointer text-sm font-medium shadow-inner"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-black flex items-center justify-center space-x-2 transition-all shadow-[0_4px_12px_rgba(99,102,241,0.4)] hover:shadow-[0_6px_16px_rgba(99,102,241,0.5)] border-2 border-indigo-700"
          >
            <Plus size={20} />
            <span>Add Task</span>
          </button>
        </div>
      </form>

      {/* Filter Tabs */}
      <div className="flex space-x-2 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg sm:rounded-xl p-2">
        <button
          onClick={() => setFilter('all')}
          className={`flex-1 px-3 sm:px-4 py-2 rounded-lg font-medium transition-all text-sm sm:text-base ${
            filter === 'all'
              ? 'bg-indigo-600 text-white'
              : 'text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-zinc-800'
          }`}
        >
          All
        </button>
        <button
          onClick={() => setFilter('active')}
          className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
            filter === 'active'
              ? 'bg-indigo-600 text-white'
              : 'text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-zinc-800'
          }`}
        >
          Active
        </button>
        <button
          onClick={() => setFilter('completed')}
          className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
            filter === 'completed'
              ? 'bg-indigo-600 text-white'
              : 'text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-zinc-800'
          }`}
        >
          Completed
        </button>
      </div>

      {/* Tasks List */}
      <div className="bg-gradient-to-b from-white to-gray-50 dark:from-zinc-900 dark:to-zinc-900/80 border-2 border-gray-300 dark:border-zinc-700 rounded-2xl p-6 shadow-[0_4px_16px_rgba(0,0,0,0.1)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            {filter === 'all' && `All Tasks (${filteredAndSortedTasks.length})`}
            {filter === 'active' && `Active Tasks (${filteredAndSortedTasks.length})`}
            {filter === 'completed' && `Completed Tasks (${filteredAndSortedTasks.length})`}
          </h3>
          {searchQuery && (
            <span className="text-sm text-gray-600 dark:text-zinc-400 font-medium">
              Found {filteredAndSortedTasks.length} result{filteredAndSortedTasks.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
        
        {filteredAndSortedTasks.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-zinc-400 font-medium">
              {searchQuery ? 'No tasks match your search' : filter === 'all' ? 'No tasks yet. Add your first task above!' : filter === 'active' ? 'No active tasks. Great job!' : 'No completed tasks yet.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredAndSortedTasks.map((task) => {
              const priorityStyles = getPriorityStyles(task.priority);
              
              return (
                <div
                  key={task.id}
                  className={`bg-gradient-to-b from-white to-gray-50 dark:from-zinc-800 dark:to-zinc-850 border-2 border-gray-300 dark:border-zinc-700 rounded-xl p-4 transition-all hover:border-gray-400 dark:hover:border-zinc-600 hover:shadow-[0_4px_12px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_4px_16px_rgba(0,0,0,0.3)] ${
                    task.completed ? 'opacity-60' : 'shadow-sm'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-start gap-3">
                      {/* Checkbox */}
                      <button
                        onClick={() => toggleTask(task.id)}
                        className="flex-shrink-0 w-6 h-6 mt-0.5 rounded-lg border-2 border-gray-400 dark:border-zinc-600 flex items-center justify-center hover:border-indigo-600 transition-all"
                      >
                        {task.completed && (
                          <CheckCircle2 size={20} className="text-indigo-600" />
                        )}
                      </button>

                      {/* Task Content */}
                      <div className="flex-1 min-w-0">
                        {editingTaskId === task.id ? (
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={editText}
                              onChange={(e) => setEditText(e.target.value)}
                              className="flex-1 bg-white dark:bg-zinc-700 border-2 border-indigo-500 rounded-lg px-3 py-1.5 text-sm text-gray-900 dark:text-white font-medium"
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') saveEditTask(task.id);
                                if (e.key === 'Escape') cancelEdit();
                              }}
                            />
                            <button
                              onClick={() => saveEditTask(task.id)}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-bold"
                            >
                              Save
                            </button>
                            <button
                              onClick={cancelEdit}
                              className="px-3 py-1.5 bg-gray-500 hover:bg-gray-600 text-white rounded-lg text-sm font-bold"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        ) : (
                          <>
                            <p
                              className={`text-sm sm:text-base font-medium ${
                                task.completed ? 'line-through text-gray-500 dark:text-zinc-500' : 'text-gray-900 dark:text-white'
                              }`}
                            >
                              {task.text}
                            </p>
                            
                            {/* Metadata */}
                            <div className="flex flex-wrap items-center gap-2 mt-2">
                              <span className="text-xs text-gray-500 dark:text-zinc-500 font-medium flex items-center gap-1">
                                <Calendar size={12} />
                                {new Date(task.createdAt).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric'
                                })}
                              </span>
                              
                              {task.dueDate && (
                                <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                                  isOverdue(task.dueDate)
                                    ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                                    : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                                }`}>
                                  Due {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                </span>
                              )}
                              
                              <span className="text-xs font-bold px-2 py-0.5 rounded bg-gray-200 dark:bg-zinc-700 text-gray-700 dark:text-zinc-300">
                                {getCategoryIcon(task.category || 'Personal')} {task.category || 'Personal'}
                              </span>
                            </div>
                          </>
                        )}
                      </div>

                      {/* Actions */}
                      {editingTaskId !== task.id && (
                        <div className="flex gap-2">
                          {/* Priority Badge */}
                          <div
                            className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg border-2 ${priorityStyles.bg} ${priorityStyles.text} ${priorityStyles.border} text-xs font-bold`}
                          >
                            {priorityStyles.icon}
                            <span className="hidden sm:inline">{task.priority}</span>
                          </div>

                          {/* Edit Button */}
                          <button
                            onClick={() => startEditTask(task)}
                            className="flex-shrink-0 text-gray-500 dark:text-zinc-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                          >
                            <Edit2 size={18} />
                          </button>

                          {/* Delete Button */}
                          <button
                            onClick={() => deleteTask(task.id)}
                            className="flex-shrink-0 text-gray-500 dark:text-zinc-500 hover:text-red-500 transition-colors"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default TaskManager;

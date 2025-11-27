import { useState, useEffect } from 'react';
import { collection, query, getDocs, addDoc, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Plus, Trash2, Flame, Calendar, CalendarDays } from 'lucide-react';
import HabitMatrix from './HabitMatrix';
import HabitAnalysis from './HabitAnalysis';
import ProgressCharts from './ProgressCharts';
import MoodTracker from './MoodTracker';
import AIHabitCoach from './AIHabitCoach';
import { XP_REWARDS } from './XPSystem';

function HabitTracker({ userId, onXPEarned }) {
  const [habits, setHabits] = useState([]);
  const [moodEntries, setMoodEntries] = useState([]);
  const [newHabitTitle, setNewHabitTitle] = useState('');
  const [newHabitGoal, setNewHabitGoal] = useState('');
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('monthly'); // 'monthly' or 'weekly'
  const [editingHabitId, setEditingHabitId] = useState(null);
  const [editGoalValue, setEditGoalValue] = useState('');

  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  
  // Get current week's dates
  const getCurrentWeekDates = () => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Adjust for Monday start
    
    const monday = new Date(today);
    monday.setDate(today.getDate() + diff);
    
    const weekDates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      weekDates.push(date.toISOString().split('T')[0]);
    }
    return weekDates;
  };

  const weekDates = getCurrentWeekDates();

  // Removed relative date helper - marking restricted to today's date only
  useEffect(() => {
    if (!userId) return;
    fetchHabits();
    fetchMoods();
  }, [userId]);

  const fetchHabits = async () => {
    try {
      const habitsRef = collection(db, 'users', userId, 'habits');
      const habitsSnapshot = await getDocs(query(habitsRef));
      
      const habitsData = habitsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setHabits(habitsData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching habits:', error);
      setLoading(false);
    }
  };

  const fetchMoods = async () => {
    try {
      const moodsRef = collection(db, 'users', userId, 'moods');
      const moodsSnapshot = await getDocs(query(moodsRef));
      const moods = moodsSnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setMoodEntries(moods);
    } catch (error) {
      console.error('Error fetching moods:', error);
    }
  };

  const addHabit = async (e) => {
    e.preventDefault();
    if (!newHabitTitle.trim() || !userId) return;

    try {
      const habitsRef = collection(db, 'users', userId, 'habits');
      const goalDays = newHabitGoal ? parseInt(newHabitGoal, 10) : null;
      await addDoc(habitsRef, {
        title: newHabitTitle.trim(),
        completedDates: [],
        goalDaysPerMonth: goalDays && goalDays > 0 ? goalDays : null,
        createdAt: new Date().toISOString()
      });
      
      setNewHabitTitle('');
      setNewHabitGoal('');
      fetchHabits();
    } catch (error) {
      console.error('Error adding habit:', error);
    }
  };

  const toggleDay = async (habitId, date) => {
    const todayStr = new Date().toISOString().split('T')[0];
    // Allow marking for today or past days; disallow future dates
    const isFuture = new Date(date) > new Date(todayStr);
    if (isFuture) return;
    // Optimistic UI update: update local state first so the user sees immediate feedback
    try {
      setHabits(prev => prev.map(h => {
        if (h.id !== habitId) return h;
        const completedDates = h.completedDates || [];
        const isCompleting = !completedDates.includes(date);
        const updatedDates = isCompleting
          ? [...completedDates, date]
          : completedDates.filter(d => d !== date);
        return { ...h, completedDates: updatedDates };
      }));

      // Persist change to Firestore
      const habitRef = doc(db, 'users', userId, 'habits', habitId);
      // Get the latest copy to avoid race conditions
      const habit = habits.find(h => h.id === habitId) || { completedDates: [] };
      const wasCompleted = habit.completedDates?.includes(date);
      const isCompleting = !wasCompleted;
      const newDates = isCompleting
        ? [...(habit.completedDates || []), date]
        : (habit.completedDates || []).filter(d => d !== date);

      await updateDoc(habitRef, { completedDates: newDates });

      // Award XP only when marking completion for today (not for backfills or future marks)
      if (isCompleting && onXPEarned && date === todayStr) {
        onXPEarned(XP_REWARDS.HABIT_COMPLETE);
      }

    } catch (error) {
      console.error('Error toggling day:', error);
      // On error, refresh from server to revert optimistic update
      fetchHabits();
    }
  };

  const deleteHabit = async (habitId) => {
    try {
      const habitRef = doc(db, 'users', userId, 'habits', habitId);
      await deleteDoc(habitRef);
      fetchHabits();
    } catch (error) {
      console.error('Error deleting habit:', error);
    }
  };

  const updateHabitGoal = async (habitId) => {
    if (!userId) return;
    try {
      const habitRef = doc(db, 'users', userId, 'habits', habitId);
      const goalDays = editGoalValue ? parseInt(editGoalValue, 10) : null;
      await updateDoc(habitRef, {
        goalDaysPerMonth: goalDays && goalDays > 0 ? goalDays : null
      });
      setEditingHabitId(null);
      setEditGoalValue('');
      fetchHabits();
    } catch (error) {
      console.error('Error updating habit goal:', error);
    }
  };

  const calculateStreak = (completedDates) => {
    if (!completedDates || completedDates.length === 0) return 0;
    
    const sortedDates = [...completedDates].sort().reverse();
    const today = new Date().toISOString().split('T')[0];
    
    let streak = 0;
    let currentDate = new Date(today);
    
    for (let i = 0; i < sortedDates.length; i++) {
      const dateStr = currentDate.toISOString().split('T')[0];
      if (sortedDates.includes(dateStr)) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }
    
    return streak;
  };

  const calculateLongestStreak = (completedDates) => {
    if (!completedDates || completedDates.length === 0) return 0;
    
    const sorted = [...completedDates].sort();
    let maxStreak = 1;
    let currentStreak = 1;
    
    for (let i = 1; i < sorted.length; i++) {
      const prevDate = new Date(sorted[i - 1]);
      const currDate = new Date(sorted[i]);
      const diffDays = Math.floor((currDate - prevDate) / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        currentStreak++;
        maxStreak = Math.max(maxStreak, currentStreak);
      } else {
        currentStreak = 1;
      }
    }
    
    return maxStreak;
  };

  const getWeekCompletion = (completedDates) => {
    if (!completedDates) return 0;
    const completedThisWeek = weekDates.filter(date => completedDates.includes(date)).length;
    return Math.round((completedThisWeek / 7) * 100);
  };

  const exportHabitsToCSV = () => {
    const headers = ['Habit Title', 'Monthly Goal', 'Total Completed Days', 'Current Streak', 'Longest Streak', 'Created At'];
    const rows = habits.map(h => [
      h.title,
      h.goalDaysPerMonth || 'No goal',
      (h.completedDates || []).length,
      calculateStreak(h.completedDates),
      calculateLongestStreak(h.completedDates),
      new Date(h.createdAt).toLocaleDateString()
    ]);
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `habits_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportMoodsToCSV = () => {
    const headers = ['Date', 'Mood Score', 'Notes'];
    const rows = moodEntries.map(m => [
      m.date,
      m.score,
      m.notes ? `"${m.notes.replace(/"/g, '""')}"` : ''
    ]);
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `moods_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-zinc-400">Loading habits...</p>
      </div>
    );
  }

  // Helper for AI Coach to add habits
  const handleAIAddHabit = async (title, goal) => {
    if (!userId) return;
    try {
      const habitsRef = collection(db, 'users', userId, 'habits');
      const goalDays = goal ? parseInt(goal, 10) : null;
      await addDoc(habitsRef, {
        title: title.trim(),
        completedDates: [],
        goalDaysPerMonth: goalDays && goalDays > 0 ? goalDays : null,
        createdAt: new Date().toISOString()
      });
      fetchHabits();
    } catch (error) {
      console.error('Error adding habit from AI:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-3 sm:space-y-0">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Habit Tracker</h2>
            <p className="text-gray-600 dark:text-zinc-400 mt-1 text-sm">Build consistency, one day at a time</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <AIHabitCoach onAddHabit={handleAIAddHabit} userId={userId} existingHabits={habits} />
          <button
            onClick={exportHabitsToCSV}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-gray-200 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white text-xs sm:text-sm transition-all"
            title="Export habits to CSV"
          >
            <span>📊</span>
            <span className="hidden sm:inline">Habits</span>
          </button>
          <button
            onClick={exportMoodsToCSV}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-gray-200 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white text-xs sm:text-sm transition-all"
            title="Export moods to CSV"
          >
            <span>💭</span>
            <span className="hidden sm:inline">Moods</span>
          </button>
          <button
            onClick={() => setViewMode('monthly')}
            className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-lg transition-all ${viewMode === 'monthly' ? 'bg-indigo-600 text-white' : 'bg-gray-200 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white'}`}
          >
            <Calendar size={16} className="sm:w-[18px] sm:h-[18px]" />
            <span className="text-xs sm:text-sm font-medium">Monthly</span>
          </button>
          <button
            onClick={() => setViewMode('weekly')}
            className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-lg transition-all ${viewMode === 'weekly' ? 'bg-indigo-600 text-white' : 'bg-gray-200 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white'}`}
          >
            <CalendarDays size={16} className="sm:w-[18px] sm:h-[18px]" />
            <span className="text-xs sm:text-sm font-medium">Weekly</span>
          </button>
        </div>
      </div>

      {viewMode === 'monthly' && (
        <>
          {/* Monthly Matrix + Analysis + Mood */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
            <div className="lg:col-span-9 space-y-4 sm:space-y-6">
              <HabitMatrix 
                habits={habits} 
                toggleDay={toggleDay} 
                calculateStreak={calculateStreak} 
                deleteHabit={deleteHabit}
                addHabit={addHabit}
                newHabitTitle={newHabitTitle}
                setNewHabitTitle={setNewHabitTitle}
                newHabitGoal={newHabitGoal}
                setNewHabitGoal={setNewHabitGoal}
              />
            </div>
            <div className="lg:col-span-3 space-y-4 sm:space-y-6">
              <HabitAnalysis habits={habits} />
              <MoodTracker userId={userId} />
            </div>
          </div>

          {/* Charts */}
          <ProgressCharts habits={habits} moodEntries={moodEntries} />
        </>
      )}

      {viewMode === 'weekly' && (
        <>
          {/* Add Habit Form for Weekly View */}
          <form onSubmit={addHabit} className="bg-gradient-to-br from-white to-gray-50 dark:from-zinc-900 dark:to-zinc-900/50 border-2 border-gray-300 dark:border-zinc-700 rounded-xl p-4 sm:p-6 shadow-[0_4px_16px_rgba(0,0,0,0.1)]">
            <h3 className="text-lg font-black text-gray-900 dark:text-white mb-4">ADD NEW HABIT</h3>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                placeholder="Habit name (e.g., Morning Exercise)"
                value={newHabitTitle}
                onChange={(e) => setNewHabitTitle(e.target.value)}
                className="flex-1 px-4 py-2.5 border-2 border-gray-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-gray-900 dark:text-white font-bold placeholder-gray-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
              <input
                type="number"
                placeholder="Goal (days/month)"
                value={newHabitGoal}
                onChange={(e) => setNewHabitGoal(e.target.value)}
                min="1"
                max="31"
                className="w-full sm:w-40 px-4 py-2.5 border-2 border-gray-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-gray-900 dark:text-white font-bold placeholder-gray-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
              <button
                type="submit"
                className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-black rounded-lg shadow-[0_4px_12px_rgba(99,102,241,0.4)] transition-all duration-200 hover:shadow-[0_6px_16px_rgba(99,102,241,0.5)] active:scale-95 flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" />
                <span>ADD HABIT</span>
              </button>
            </div>
          </form>

          <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Current Week</h3>
          <div className="text-sm text-gray-600 dark:text-zinc-400">
            {new Date(weekDates[0]).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(weekDates[6]).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </div>
        </div>

        {/* Habits Grid */}
        {habits.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-zinc-400">No habits yet. Add your first habit above!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {habits.map((habit) => {
              const streak = calculateStreak(habit.completedDates);
              const longestStreak = calculateLongestStreak(habit.completedDates);
              const weekCompletion = getWeekCompletion(habit.completedDates);
              const isEditing = editingHabitId === habit.id;
              
              return (
                <div
                  key={habit.id}
                  className="bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl p-4 hover:border-gray-300 dark:hover:border-zinc-600 transition-all"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h4 className="text-gray-900 dark:text-white font-medium">{habit.title}</h4>
                        {streak > 0 && (
                          <div className="flex items-center space-x-1 bg-orange-500/20 text-orange-400 px-2 py-1 rounded-lg text-xs">
                            <Flame size={14} />
                            <span>{streak} day streak</span>
                          </div>
                        )}
                        {longestStreak > streak && (
                          <div className="flex items-center space-x-1 bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded-lg text-xs">
                            <span>🏆 Best: {longestStreak}</span>
                          </div>
                        )}
                      </div>
                      <div className="mt-1 flex items-center space-x-3 text-xs text-gray-600 dark:text-zinc-400">
                        <span>Weekly: {weekCompletion}%</span>
                        {isEditing ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              value={editGoalValue}
                              onChange={(e) => setEditGoalValue(e.target.value)}
                              placeholder="Goal"
                              min="1"
                              max="31"
                              className="w-16 bg-gray-200 dark:bg-zinc-700 border border-gray-300 dark:border-zinc-600 rounded px-2 py-1 text-gray-900 dark:text-white text-xs"
                            />
                            <button
                              onClick={() => updateHabitGoal(habit.id)}
                              className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 text-xs"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => { setEditingHabitId(null); setEditGoalValue(''); }}
                              className="text-gray-500 dark:text-zinc-500 hover:text-gray-700 dark:hover:text-zinc-300 text-xs"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => { setEditingHabitId(habit.id); setEditGoalValue(habit.goalDaysPerMonth || ''); }}
                            className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
                          >
                            Goal: {habit.goalDaysPerMonth || 'None'} ✏️
                          </button>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => deleteHabit(habit.id)}
                      className="text-gray-500 dark:text-zinc-500 hover:text-red-600 dark:hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>

                  {/* Only today can be marked now */}
                  <div className="mb-3 text-xs text-gray-500 dark:text-zinc-500">
                    You can mark only today's progress. Past and future days are locked.
                  </div>

                  {/* Week Days Grid */}
                  <div className="grid grid-cols-7 gap-2">
                    {weekDates.map((date, index) => {
                      const isCompleted = habit.completedDates && habit.completedDates.includes(date);
                      const isToday = date === new Date().toISOString().split('T')[0];
                      const isPast = new Date(date) < new Date(new Date().toISOString().split('T')[0]);
                      const isFuture = new Date(date) > new Date(new Date().toISOString().split('T')[0]);
                      const isDisabled = isPast || isFuture;
                      
                      return (
                        <button
                          key={date}
                          onClick={() => !isDisabled && toggleDay(habit.id, date)}
                          disabled={isDisabled}
                          className={`relative aspect-square rounded-lg font-medium text-sm transition-all ${
                            isCompleted
                              ? 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-lg'
                              : 'bg-gray-200 dark:bg-zinc-700 text-gray-600 dark:text-zinc-400 hover:bg-gray-300 dark:hover:bg-zinc-600'
                          } ${isToday ? 'ring-2 ring-indigo-400' : ''} ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                        >
                          <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-xs">{daysOfWeek[index]}</span>
                            <span className="text-xs opacity-70">{new Date(date).getDate()}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
          </div>
        </>
      )}
    </div>
  );
}

export default HabitTracker;

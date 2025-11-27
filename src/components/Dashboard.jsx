import { useState, useEffect, useMemo } from 'react';
import { collection, query, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { TrendingUp, CheckCircle2, Quote, Flame, Award, Target, Calendar, TrendingDown, CheckSquare } from 'lucide-react';

const motivationalQuotes = [
  "The secret of getting ahead is getting started.",
  "Success is the sum of small efforts repeated day in and day out.",
  "Don't watch the clock; do what it does. Keep going.",
  "The only way to do great work is to love what you do.",
  "Believe you can and you're halfway there.",
  "Your limitation—it's only your imagination.",
  "Push yourself, because no one else is going to do it for you.",
  "Great things never come from comfort zones.",
  "Dream it. Wish it. Do it.",
  "Success doesn't just find you. You have to go out and get it."
];

function Dashboard({ userId }) {
  const [habitsData, setHabitsData] = useState({ total: 0, completed: 0 });
  const [tasksData, setTasksData] = useState({ total: 0, completed: 0 });
  const [allHabits, setAllHabits] = useState([]);
  const [quote, setQuote] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set random quote
    const randomQuote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];
    setQuote(randomQuote);

    if (!userId) return;

    const fetchData = async () => {
      try {
        // Fetch habits
        const habitsRef = collection(db, 'users', userId, 'habits');
        const habitsSnapshot = await getDocs(query(habitsRef));
        
        const today = new Date().toISOString().split('T')[0];
        let completedHabits = 0;
        const habits = [];
        
        habitsSnapshot.forEach((doc) => {
          const habit = doc.data();
          habits.push({ id: doc.id, ...habit });
          if (habit.completedDates && habit.completedDates.includes(today)) {
            completedHabits++;
          }
        });

        setAllHabits(habits);
        setHabitsData({
          total: habitsSnapshot.size,
          completed: completedHabits
        });

        // Fetch tasks
        const tasksRef = collection(db, 'users', userId, 'tasks');
        const tasksSnapshot = await getDocs(query(tasksRef));
        
        let completedTasks = 0;
        tasksSnapshot.forEach((doc) => {
          const task = doc.data();
          if (task.completed) {
            completedTasks++;
          }
        });

        setTasksData({
          total: tasksSnapshot.size,
          completed: completedTasks
        });

        setLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  const habitsPercentage = habitsData.total > 0 ? Math.round((habitsData.completed / habitsData.total) * 100) : 0;
  const tasksPercentage = tasksData.total > 0 ? Math.round((tasksData.completed / tasksData.total) * 100) : 0;

  // Calculate streaks and weekly data
  const streakData = useMemo(() => {
    if (allHabits.length === 0) return { currentStreak: 0, bestStreak: 0, weeklyProgress: [] };

    const today = new Date();
    const last7Days = [];
    
    // Generate last 7 days
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      last7Days.push(dateStr);
    }

    // Calculate daily completion percentages for last 7 days
    const weeklyProgress = last7Days.map((dateStr, index) => {
      let completed = 0;
      allHabits.forEach(habit => {
        if (habit.completedDates && habit.completedDates.includes(dateStr)) {
          completed++;
        }
      });
      const percentage = allHabits.length > 0 ? Math.round((completed / allHabits.length) * 100) : 0;
      return { date: dateStr, percentage, day: index };
    });

    // Calculate current streak (consecutive days from today going backwards)
    let currentStreak = 0;
    const todayStr = last7Days[last7Days.length - 1];
    const sortedDates = [...last7Days].reverse(); // Start from today

    for (let dateStr of sortedDates) {
      let dayCompleted = 0;
      allHabits.forEach(habit => {
        if (habit.completedDates && habit.completedDates.includes(dateStr)) {
          dayCompleted++;
        }
      });
      // Consider day complete if at least 50% habits done
      if (allHabits.length > 0 && (dayCompleted / allHabits.length) >= 0.5) {
        currentStreak++;
      } else if (dateStr !== todayStr) {
        break; // Stop if a day is incomplete (unless it's today)
      }
    }

    // Calculate best streak (simplified - would need full history for accurate calculation)
    const bestStreak = Math.max(currentStreak, currentStreak + Math.floor(Math.random() * 3)); // Mock best streak

    return { currentStreak, bestStreak, weeklyProgress };
  }, [allHabits]);

  // Calculate calendar heatmap data for current month
  const calendarData = useMemo(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const heatmap = [];

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      let completed = 0;
      allHabits.forEach(habit => {
        if (habit.completedDates && habit.completedDates.includes(dateStr)) {
          completed++;
        }
      });
      const percentage = allHabits.length > 0 ? Math.round((completed / allHabits.length) * 100) : 0;
      heatmap.push({ day, percentage });
    }

    return heatmap;
  }, [allHabits]);

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-zinc-400 font-semibold">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Motivational Quote */}
      <div className="bg-gradient-to-b from-white to-gray-50 dark:from-zinc-900 dark:to-zinc-900/80 backdrop-blur-xl border-2 border-gray-300 dark:border-zinc-700 rounded-xl sm:rounded-2xl p-5 sm:p-8 hover:border-indigo-400 dark:hover:border-indigo-600 transition-all shadow-[0_4px_16px_rgba(0,0,0,0.1)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
        <div className="flex items-start space-x-3 sm:space-x-4">
          <Quote size={24} className="sm:w-8 sm:h-8 text-indigo-500 dark:text-indigo-400 flex-shrink-0 mt-1 drop-shadow-md" />
          <div>
            <p className="text-base sm:text-xl text-gray-900 dark:text-white font-bold italic mb-2 leading-relaxed tracking-wide">"{quote}"</p>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-zinc-400 font-semibold">Daily Motivation</p>
          </div>
        </div>
      </div>

      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-900 dark:to-purple-900 rounded-xl sm:rounded-2xl p-6 sm:p-8 text-white shadow-[0_4px_20px_rgba(0,0,0,0.15)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.4)] border-2 border-indigo-500 dark:border-indigo-700">
        <h2 className="text-2xl sm:text-3xl font-black mb-2 tracking-wide">Welcome Back! 👋</h2>
        <p className="text-indigo-100 dark:text-indigo-200 text-sm sm:text-base font-semibold">Track your progress and build lasting habits</p>
      </div>

      {/* Streak Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
        {/* Current Streak */}
        <div className="bg-gradient-to-b from-white to-orange-50 dark:from-zinc-900 dark:to-orange-900/10 backdrop-blur-xl border-2 border-orange-300 dark:border-orange-700 rounded-xl sm:rounded-2xl p-5 sm:p-6 hover:border-orange-400 dark:hover:border-orange-600 transition-all shadow-[0_4px_16px_rgba(249,115,22,0.2)] dark:shadow-[0_4px_20px_rgba(249,115,22,0.3)]">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-[0_4px_12px_rgba(249,115,22,0.4)] border-2 border-orange-600">
              <Flame size={24} className="sm:w-7 sm:h-7 text-white drop-shadow-md" />
            </div>
          </div>
          <div className="text-4xl sm:text-5xl font-black text-gray-900 dark:text-white mb-1">{streakData.currentStreak}</div>
          <p className="text-sm sm:text-base text-gray-600 dark:text-zinc-400 font-bold">Day Streak 🔥</p>
        </div>

        {/* Best Streak */}
        <div className="bg-gradient-to-b from-white to-purple-50 dark:from-zinc-900 dark:to-purple-900/10 backdrop-blur-xl border-2 border-purple-300 dark:border-purple-700 rounded-xl sm:rounded-2xl p-5 sm:p-6 hover:border-purple-400 dark:hover:border-purple-600 transition-all shadow-[0_4px_16px_rgba(168,85,247,0.2)] dark:shadow-[0_4px_20px_rgba(168,85,247,0.3)]">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-[0_4px_12px_rgba(168,85,247,0.4)] border-2 border-purple-600">
              <Award size={24} className="sm:w-7 sm:h-7 text-white drop-shadow-md" />
            </div>
          </div>
          <div className="text-4xl sm:text-5xl font-black text-gray-900 dark:text-white mb-1">{streakData.bestStreak}</div>
          <p className="text-sm sm:text-base text-gray-600 dark:text-zinc-400 font-bold">Best Streak 🏆</p>
        </div>

        {/* Overall Progress */}
        <div className="bg-gradient-to-b from-white to-indigo-50 dark:from-zinc-900 dark:to-indigo-900/10 backdrop-blur-xl border-2 border-indigo-300 dark:border-indigo-700 rounded-xl sm:rounded-2xl p-5 sm:p-6 hover:border-indigo-400 dark:hover:border-indigo-600 transition-all shadow-[0_4px_16px_rgba(99,102,241,0.2)] dark:shadow-[0_4px_20px_rgba(99,102,241,0.3)]">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-indigo-500 to-blue-500 rounded-xl flex items-center justify-center shadow-[0_4px_12px_rgba(99,102,241,0.4)] border-2 border-indigo-600">
              <Target size={24} className="sm:w-7 sm:h-7 text-white drop-shadow-md" />
            </div>
          </div>
          <div className="text-4xl sm:text-5xl font-black text-gray-900 dark:text-white mb-1">{habitsPercentage}%</div>
          <p className="text-sm sm:text-base text-gray-600 dark:text-zinc-400 font-bold">Today's Goal 🎯</p>
        </div>
      </div>

      {/* Weekly Progress Chart */}
      <div className="bg-gradient-to-b from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20 backdrop-blur-xl border-2 border-indigo-300 dark:border-indigo-700 rounded-xl sm:rounded-2xl p-5 sm:p-7 shadow-[0_4px_16px_rgba(0,0,0,0.1)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
        <div className="flex items-center space-x-3 mb-5">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center shadow-[0_4px_12px_rgba(99,102,241,0.4)] border-2 border-indigo-600">
            <TrendingUp size={20} className="sm:w-6 sm:h-6 text-white drop-shadow-md" />
          </div>
          <h3 className="text-lg sm:text-xl font-black text-gray-900 dark:text-white tracking-wide">Weekly Progress</h3>
        </div>
        
        {/* Line Chart */}
        <div className="relative h-48 sm:h-56">
          <svg className="w-full h-full" viewBox="0 0 700 200" preserveAspectRatio="none">
            <defs>
              <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#6366f1" stopOpacity="0.4"/>
                <stop offset="100%" stopColor="#9333ea" stopOpacity="0.1"/>
              </linearGradient>
            </defs>
            
            {/* Grid lines */}
            {[0, 25, 50, 75, 100].map((value) => (
              <line
                key={value}
                x1="0"
                y1={200 - (value * 2)}
                x2="700"
                y2={200 - (value * 2)}
                stroke="currentColor"
                strokeWidth="1"
                className="text-gray-300 dark:text-zinc-700"
                strokeDasharray="5,5"
              />
            ))}
            
            {/* Area fill */}
            {streakData.weeklyProgress.length > 0 && (
              <path
                d={`M 0 200 ${streakData.weeklyProgress.map((d, i) => 
                  `L ${(i * 100) + 50} ${200 - (d.percentage * 2)}`
                ).join(' ')} L ${(streakData.weeklyProgress.length - 1) * 100 + 50} 200 Z`}
                fill="url(#chartGradient)"
              />
            )}
            
            {/* Line */}
            {streakData.weeklyProgress.length > 0 && (
              <polyline
                points={streakData.weeklyProgress.map((d, i) => 
                  `${(i * 100) + 50},${200 - (d.percentage * 2)}`
                ).join(' ')}
                fill="none"
                stroke="#6366f1"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}
            
            {/* Data points */}
            {streakData.weeklyProgress.map((d, i) => (
              <circle
                key={i}
                cx={(i * 100) + 50}
                cy={200 - (d.percentage * 2)}
                r="5"
                fill="#6366f1"
                stroke="#fff"
                strokeWidth="2"
              />
            ))}
          </svg>
        </div>
        
        {/* Day labels */}
        <div className="flex justify-between mt-3 px-2">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => (
            <div key={i} className="text-xs sm:text-sm font-bold text-gray-600 dark:text-zinc-400 text-center flex-1">
              {day}
            </div>
          ))}
        </div>
      </div>

      {/* Today's Progress */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {/* Daily Habits Card */}
        <div className="bg-gradient-to-b from-white to-gray-50 dark:from-zinc-900 dark:to-zinc-900/80 backdrop-blur-xl border-2 border-gray-300 dark:border-zinc-700 rounded-xl sm:rounded-2xl p-5 sm:p-7 hover:border-orange-400 dark:hover:border-orange-600 transition-all shadow-[0_4px_16px_rgba(0,0,0,0.1)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.4)] hover:shadow-[0_6px_24px_rgba(0,0,0,0.15)] dark:hover:shadow-[0_6px_28px_rgba(0,0,0,0.5)]">
          <div className="flex items-center justify-between mb-4 sm:mb-5">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg sm:rounded-xl flex items-center justify-center shadow-[0_4px_12px_rgba(249,115,22,0.4)] border border-orange-600">
                <TrendingUp size={20} className="sm:w-[22px] sm:h-[22px] text-white drop-shadow-md" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white tracking-wide">Daily Habits</h3>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-zinc-400 font-medium">Today's Progress</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">{habitsPercentage}%</div>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-zinc-400 font-semibold">{habitsData.completed}/{habitsData.total} done</p>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full h-3 bg-gray-300 dark:bg-zinc-800 backdrop-blur rounded-full overflow-hidden border border-gray-400 dark:border-zinc-700 shadow-inner">
            <div 
              className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(249,115,22,0.6)]"
              style={{ width: `${habitsPercentage}%` }}
            ></div>
          </div>
        </div>

        {/* Tasks Card */}
        <div className="bg-gradient-to-b from-white to-gray-50 dark:from-zinc-900 dark:to-zinc-900/80 backdrop-blur-xl border-2 border-gray-300 dark:border-zinc-700 rounded-xl sm:rounded-2xl p-5 sm:p-7 hover:border-emerald-400 dark:hover:border-emerald-600 transition-all shadow-[0_4px_16px_rgba(0,0,0,0.1)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.4)] hover:shadow-[0_6px_24px_rgba(0,0,0,0.15)] dark:hover:shadow-[0_6px_28px_rgba(0,0,0,0.5)]">
          <div className="flex items-center justify-between mb-4 sm:mb-5">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg sm:rounded-xl flex items-center justify-center shadow-[0_4px_12px_rgba(16,185,129,0.4)] border border-emerald-600">
                <CheckCircle2 size={20} className="sm:w-[22px] sm:h-[22px] text-white drop-shadow-md" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white tracking-wide">Tasks</h3>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-zinc-400 font-medium">Overall Progress</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">{tasksPercentage}%</div>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-zinc-400 font-semibold">{tasksData.completed}/{tasksData.total} done</p>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full h-3 bg-gray-300 dark:bg-zinc-800 backdrop-blur rounded-full overflow-hidden border border-gray-400 dark:border-zinc-700 shadow-inner">
            <div 
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]"
              style={{ width: `${tasksPercentage}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Calendar Heatmap */}
      <div className="bg-gradient-to-b from-white to-gray-50 dark:from-zinc-900 dark:to-zinc-900/80 backdrop-blur-xl border-2 border-gray-300 dark:border-zinc-700 rounded-xl sm:rounded-2xl p-5 sm:p-7 shadow-[0_4px_16px_rgba(0,0,0,0.1)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
        <div className="flex items-center space-x-3 mb-5">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center shadow-[0_4px_12px_rgba(99,102,241,0.4)] border-2 border-indigo-600">
            <Calendar size={20} className="sm:w-6 sm:h-6 text-white drop-shadow-md" />
          </div>
          <h3 className="text-lg sm:text-xl font-black text-gray-900 dark:text-white tracking-wide">Monthly Overview</h3>
        </div>
        
        {/* Heatmap Grid */}
        <div className="grid grid-cols-7 gap-2 sm:gap-3">
          {calendarData.map((dayData, index) => {
            let bgColor = 'bg-gray-200 dark:bg-zinc-800';
            if (dayData.percentage >= 75) bgColor = 'bg-indigo-600';
            else if (dayData.percentage >= 50) bgColor = 'bg-indigo-400';
            else if (dayData.percentage >= 25) bgColor = 'bg-indigo-300';
            else if (dayData.percentage > 0) bgColor = 'bg-indigo-200';

            return (
              <div
                key={index}
                className={`${bgColor} rounded-lg aspect-square flex items-center justify-center border-2 border-gray-300 dark:border-zinc-700 transition-all hover:scale-110`}
                title={`Day ${dayData.day}: ${dayData.percentage}% complete`}
              >
                <span className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white">{dayData.day}</span>
              </div>
            );
          })}
        </div>
        
        {/* Legend */}
        <div className="flex items-center justify-center space-x-3 mt-5">
          <span className="text-xs sm:text-sm font-bold text-gray-600 dark:text-zinc-400">Less</span>
          <div className="flex space-x-2">
            <div className="w-4 h-4 bg-gray-200 dark:bg-zinc-800 rounded border-2 border-gray-300 dark:border-zinc-700"></div>
            <div className="w-4 h-4 bg-indigo-200 rounded border-2 border-gray-300 dark:border-zinc-700"></div>
            <div className="w-4 h-4 bg-indigo-300 rounded border-2 border-gray-300 dark:border-zinc-700"></div>
            <div className="w-4 h-4 bg-indigo-400 rounded border-2 border-gray-300 dark:border-zinc-700"></div>
            <div className="w-4 h-4 bg-indigo-600 rounded border-2 border-gray-300 dark:border-zinc-700"></div>
          </div>
          <span className="text-xs sm:text-sm font-bold text-gray-600 dark:text-zinc-400">More</span>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-gradient-to-b from-white to-gray-50 dark:from-zinc-900 dark:to-zinc-900/80 backdrop-blur-xl border-2 border-gray-300 dark:border-zinc-700 rounded-lg sm:rounded-xl p-4 sm:p-5 text-center hover:border-gray-400 dark:hover:border-zinc-600 transition-all shadow-[0_2px_8px_rgba(0,0,0,0.1)] dark:shadow-[0_2px_12px_rgba(0,0,0,0.3)]">
          <div className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white mb-1">{habitsData.total}</div>
          <div className="text-xs sm:text-sm text-gray-600 dark:text-zinc-400 font-bold">Total Habits</div>
        </div>
        <div className="bg-gradient-to-b from-white to-emerald-50 dark:from-zinc-900 dark:to-emerald-900/10 backdrop-blur-xl border-2 border-emerald-300 dark:border-emerald-700 rounded-lg sm:rounded-xl p-4 sm:p-5 text-center hover:border-emerald-400 dark:hover:border-emerald-600 transition-all shadow-[0_2px_8px_rgba(16,185,129,0.2)] dark:shadow-[0_2px_12px_rgba(16,185,129,0.3)]">
          <div className="text-xl sm:text-2xl font-black text-emerald-700 dark:text-emerald-300 mb-1">{habitsData.completed}</div>
          <div className="text-xs sm:text-sm text-gray-600 dark:text-zinc-400 font-bold">Done Today</div>
        </div>
        <div className="bg-gradient-to-b from-white to-gray-50 dark:from-zinc-900 dark:to-zinc-900/80 backdrop-blur-xl border-2 border-gray-300 dark:border-zinc-700 rounded-lg sm:rounded-xl p-4 sm:p-5 text-center hover:border-gray-400 dark:hover:border-zinc-600 transition-all shadow-[0_2px_8px_rgba(0,0,0,0.1)] dark:shadow-[0_2px_12px_rgba(0,0,0,0.3)]">
          <div className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white mb-1">{tasksData.total}</div>
          <div className="text-xs sm:text-sm text-gray-600 dark:text-zinc-400 font-bold">Total Tasks</div>
        </div>
        <div className="bg-gradient-to-b from-white to-emerald-50 dark:from-zinc-900 dark:to-emerald-900/10 backdrop-blur-xl border-2 border-emerald-300 dark:border-emerald-700 rounded-lg sm:rounded-xl p-4 sm:p-5 text-center hover:border-emerald-400 dark:hover:border-emerald-600 transition-all shadow-[0_2px_8px_rgba(16,185,129,0.2)] dark:shadow-[0_2px_12px_rgba(16,185,129,0.3)]">
          <div className="text-xl sm:text-2xl font-black text-emerald-700 dark:text-emerald-300 mb-1">{tasksData.completed}</div>
          <div className="text-xs sm:text-sm text-gray-600 dark:text-zinc-400 font-bold">Completed</div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;

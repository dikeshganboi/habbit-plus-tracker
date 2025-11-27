import { useState, useEffect } from 'react';
import { collection, query, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { BarChart3, TrendingUp, Target, Flame } from 'lucide-react';

function AnalyticsTab({ userId }) {
  const [habits, setHabits] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    fetchData();
  }, [userId]);

  const fetchData = async () => {
    try {
      const habitsRef = collection(db, 'users', userId, 'habits');
      const habitsSnapshot = await getDocs(query(habitsRef));
      const habitsData = habitsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      const tasksRef = collection(db, 'users', userId, 'tasks');
      const tasksSnapshot = await getDocs(query(tasksRef));
      const tasksData = tasksSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setHabits(habitsData);
      setTasks(tasksData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  // Get last 7 days
  const getLast7Days = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      days.push(date.toISOString().split('T')[0]);
    }
    return days;
  };

  const days = getLast7Days();

  // Calculate completion percentage for each day
  const getDayStats = () => {
    return days.map(date => {
      if (habits.length === 0) {
        return { date, percentage: 0, count: 0, total: 0 };
      }

      const completed = habits.filter(habit => 
        habit.completedDates && habit.completedDates.includes(date)
      ).length;

      const percentage = Math.round((completed / habits.length) * 100);
      
      return {
        date,
        percentage,
        count: completed,
        total: habits.length,
        dayName: new Date(date).toLocaleDateString('en-US', { weekday: 'short' })
      };
    });
  };

  const dayStats = getDayStats();

  // Calculate overall stats
  const calculateOverallStats = () => {
    const totalHabits = habits.length;
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.completed).length;
    
    // Calculate average daily completion
    const avgCompletion = dayStats.reduce((sum, day) => sum + day.percentage, 0) / 7;
    
    // Calculate current streak (consecutive days with >50% completion)
    let streak = 0;
    for (let i = dayStats.length - 1; i >= 0; i--) {
      if (dayStats[i].percentage >= 50) {
        streak++;
      } else {
        break;
      }
    }

    return {
      totalHabits,
      totalTasks,
      completedTasks,
      avgCompletion: Math.round(avgCompletion),
      streak
    };
  };

  const stats = calculateOverallStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-600 dark:text-zinc-400">Loading analytics...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Analytics Dashboard</h2>
        <p className="text-gray-600 dark:text-zinc-400">Track your consistency and progress over time</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-b from-white to-indigo-50 dark:from-zinc-900 dark:to-indigo-900/10 backdrop-blur-xl border-2 border-indigo-300 dark:border-indigo-700 rounded-xl p-6 hover:border-indigo-400 dark:hover:border-indigo-600 transition-all shadow-[0_4px_12px_rgba(99,102,241,0.15)] dark:shadow-[0_4px_16px_rgba(99,102,241,0.25)]">
          <div className="flex items-center justify-between mb-2">
            <Target className="w-5 h-5 text-indigo-500 dark:text-indigo-400 drop-shadow-md" />
            <span className="text-2xl font-black text-gray-900 dark:text-white">{stats.totalHabits}</span>
          </div>
          <p className="text-sm text-gray-700 dark:text-zinc-300 font-bold">Active Habits</p>
        </div>

        <div className="bg-gradient-to-b from-white to-green-50 dark:from-zinc-900 dark:to-green-900/10 backdrop-blur-xl border-2 border-green-300 dark:border-green-700 rounded-xl p-6 hover:border-green-400 dark:hover:border-green-600 transition-all shadow-[0_4px_12px_rgba(34,197,94,0.15)] dark:shadow-[0_4px_16px_rgba(34,197,94,0.25)]">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-5 h-5 text-green-500 dark:text-green-400 drop-shadow-md" />
            <span className="text-2xl font-black text-gray-900 dark:text-white">{stats.avgCompletion}%</span>
          </div>
          <p className="text-sm text-gray-700 dark:text-zinc-300 font-bold">Avg. Completion</p>
        </div>

        <div className="bg-gradient-to-b from-white to-orange-50 dark:from-zinc-900 dark:to-orange-900/10 backdrop-blur-xl border-2 border-orange-300 dark:border-orange-700 rounded-xl p-6 hover:border-orange-400 dark:hover:border-orange-600 transition-all shadow-[0_4px_12px_rgba(249,115,22,0.15)] dark:shadow-[0_4px_16px_rgba(249,115,22,0.25)]">
          <div className="flex items-center justify-between mb-2">
            <Flame className="w-5 h-5 text-orange-500 dark:text-orange-400 drop-shadow-md" />
            <span className="text-2xl font-black text-gray-900 dark:text-white">{stats.streak}</span>
          </div>
          <p className="text-sm text-gray-700 dark:text-zinc-300 font-bold">Day Streak</p>
        </div>

        <div className="bg-gradient-to-b from-white to-purple-50 dark:from-zinc-900 dark:to-purple-900/10 backdrop-blur-xl border-2 border-purple-300 dark:border-purple-700 rounded-xl p-6 hover:border-purple-400 dark:hover:border-purple-600 transition-all shadow-[0_4px_12px_rgba(168,85,247,0.15)] dark:shadow-[0_4px_16px_rgba(168,85,247,0.25)]">
          <div className="flex items-center justify-between mb-2">
            <BarChart3 className="w-5 h-5 text-purple-500 dark:text-purple-400 drop-shadow-md" />
            <span className="text-2xl font-black text-gray-900 dark:text-white">{stats.completedTasks}/{stats.totalTasks}</span>
          </div>
          <p className="text-sm text-gray-700 dark:text-zinc-300 font-bold">Tasks Complete</p>
        </div>
      </div>

      {/* 7-Day Consistency Chart */}
      <div className="bg-white/50 dark:bg-zinc-900/50 backdrop-blur-xl border border-gray-200/50 dark:border-zinc-800/50 rounded-xl p-7 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">7-Day Consistency</h3>
            <p className="text-sm text-gray-600 dark:text-zinc-400">Daily habit completion percentage</p>
          </div>
          <BarChart3 className="w-6 h-6 text-indigo-400" />
        </div>

        {/* CSS-Only Bar Chart */}
        <div className="space-y-4">
          {dayStats.map((day, index) => (
            <div key={day.date} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2">
                  <span className="text-gray-600 dark:text-zinc-400 w-10">{day.dayName}</span>
                  <span className="text-gray-500 dark:text-zinc-500 text-xs">
                    {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-gray-600 dark:text-zinc-400 text-xs">
                    {day.count}/{day.total}
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white w-12 text-right">
                    {day.percentage}%
                  </span>
                </div>
              </div>
              
              {/* Bar */}
              <div className="h-8 bg-gray-200 dark:bg-zinc-800 rounded-lg overflow-hidden relative">
                <div
                  className={`h-full transition-all duration-500 ease-out ${
                    day.percentage >= 75
                      ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                      : day.percentage >= 50
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-500'
                      : day.percentage >= 25
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500'
                      : 'bg-gradient-to-r from-red-500 to-rose-500'
                  }`}
                  style={{ width: `${day.percentage}%` }}
                >
                  {day.percentage > 10 && (
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-medium text-white">
                      {day.percentage}%
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-zinc-800">
          <div className="flex flex-wrap items-center gap-4 text-xs text-gray-600 dark:text-zinc-400">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded bg-gradient-to-r from-green-500 to-emerald-500"></div>
              <span>Excellent (75%+)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded bg-gradient-to-r from-indigo-500 to-purple-500"></div>
              <span>Good (50-74%)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded bg-gradient-to-r from-amber-500 to-orange-500"></div>
              <span>Fair (25-49%)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded bg-gradient-to-r from-red-500 to-rose-500"></div>
              <span>Needs Work (&lt;25%)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Insights */}
      <div className="bg-white/50 dark:bg-zinc-900/50 backdrop-blur-xl border border-gray-200/50 dark:border-zinc-800/50 rounded-xl p-7 shadow-xl">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-5">Insights</h3>
        <div className="space-y-3">
          {stats.avgCompletion >= 70 && (
            <div className="flex items-start space-x-3 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
              <TrendingUp className="w-5 h-5 text-green-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-green-400">Great Job!</p>
                <p className="text-sm text-gray-600 dark:text-zinc-400 mt-1">
                  You're maintaining an excellent consistency rate of {stats.avgCompletion}%. Keep it up!
                </p>
              </div>
            </div>
          )}
          
          {stats.streak >= 3 && (
            <div className="flex items-start space-x-3 p-4 bg-orange-500/10 border border-orange-500/20 rounded-lg">
              <Flame className="w-5 h-5 text-orange-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-orange-400">On Fire!</p>
                <p className="text-sm text-gray-600 dark:text-zinc-400 mt-1">
                  You've maintained a {stats.streak}-day streak. Don't break the chain!
                </p>
              </div>
            </div>
          )}

          {stats.avgCompletion < 50 && (
            <div className="flex items-start space-x-3 p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
              <Target className="w-5 h-5 text-amber-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-400">Room for Growth</p>
                <p className="text-sm text-gray-600 dark:text-zinc-400 mt-1">
                  Your average completion is {stats.avgCompletion}%. Try breaking habits into smaller, more achievable goals.
                </p>
              </div>
            </div>
          )}

          {habits.length === 0 && (
            <div className="flex items-start space-x-3 p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-lg">
              <Target className="w-5 h-5 text-indigo-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-indigo-400">Get Started</p>
                <p className="text-sm text-gray-600 dark:text-zinc-400 mt-1">
                  Add your first habit to start tracking your progress and building consistency.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AnalyticsTab;

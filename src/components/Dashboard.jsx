import { useState, useEffect, useMemo } from 'react';
import { collection, query, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { TrendingUp, CheckCircle2, Quote, Flame, Award, Target, Calendar, CheckSquare, ArrowRight } from 'lucide-react';

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

const formatDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const calculateBestStreak = (habits) => {
  const dates = habits.flatMap((habit) => habit.completedDates || []).sort();
  if (dates.length === 0) return 0;

  const firstDate = new Date(`${dates[0]}T00:00:00`);
  const lastDate = new Date(`${dates[dates.length - 1]}T00:00:00`);
  let bestStreak = 0;
  let currentStreak = 0;

  for (const date = new Date(firstDate); date <= lastDate; date.setDate(date.getDate() + 1)) {
    const dateStr = formatDate(date);
    const completedHabits = habits.filter((habit) => habit.completedDates?.includes(dateStr)).length;
    const dayIsComplete = habits.length > 0 && (completedHabits / habits.length) >= 0.5;

    if (dayIsComplete) {
      currentStreak++;
      bestStreak = Math.max(bestStreak, currentStreak);
    } else {
      currentStreak = 0;
    }
  }

  return bestStreak;
};

function Dashboard({ userId }) {
  const [habitsData, setHabitsData] = useState({ total: 0, completed: 0 });
  const [tasksData, setTasksData] = useState({ total: 0, completed: 0 });
  const [allTasks, setAllTasks] = useState([]);
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
        const tasks = [];
        tasksSnapshot.forEach((doc) => {
          const task = doc.data();
          tasks.push({ id: doc.id, ...task });
          if (task.completed) {
            completedTasks++;
          }
        });

        setAllTasks(tasks);
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

    const bestStreak = calculateBestStreak(allHabits);

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
      <div className="space-y-4 animate-pulse" aria-label="Loading dashboard">
        <div className="h-32 rounded-2xl bg-gray-200 dark:bg-zinc-800" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3"><div className="h-24 rounded-2xl bg-gray-200 dark:bg-zinc-800" /><div className="h-24 rounded-2xl bg-gray-200 dark:bg-zinc-800" /><div className="h-24 rounded-2xl bg-gray-200 dark:bg-zinc-800" /><div className="h-24 rounded-2xl bg-gray-200 dark:bg-zinc-800" /></div>
        <div className="h-64 rounded-2xl bg-gray-200 dark:bg-zinc-800" />
      </div>
    );
  }

  return (
    <div className="space-y-5 sm:space-y-7">
      <section className="flex flex-col gap-5 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-7 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-indigo-600 dark:text-indigo-300">Today</p>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-3xl">Make today count.</h2>
          <p className="mt-2 max-w-xl text-sm leading-6 text-gray-600 dark:text-zinc-400">You have {habitsData.total} habits and {allTasks.filter(task => !task.completed).length} tasks to focus on today.</p>
          <div className="mt-5 flex items-center gap-3 text-sm text-gray-500 dark:text-zinc-400"><Quote size={16} className="text-indigo-500" /><span className="italic">{quote}</span></div>
        </div>
        <div className="flex items-center gap-4 rounded-xl bg-gray-50 px-4 py-3 dark:bg-zinc-800/70 sm:min-w-[230px]">
          <div className="relative flex h-14 w-14 items-center justify-center rounded-full border-4 border-indigo-100 dark:border-indigo-950">
            <div className="absolute inset-[-4px] rounded-full border-4 border-indigo-500 border-l-transparent" style={{ transform: `rotate(${habitsPercentage * 3.6 - 45}deg)` }} />
            <span className="text-sm font-bold text-gray-900 dark:text-white">{habitsPercentage}%</span>
          </div>
          <div><p className="text-sm font-semibold text-gray-900 dark:text-white">Today's progress</p><p className="mt-1 text-xs text-gray-500 dark:text-zinc-400">{habitsData.completed} of {habitsData.total} habits</p></div>
        </div>
      </section>

      <section className="grid grid-cols-2 divide-x divide-gray-200 rounded-xl border border-gray-200 bg-white dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-900 sm:grid-cols-4">
        {[
          { label: 'Current streak', value: `${streakData.currentStreak} days`, icon: Flame, tone: 'text-amber-500' },
          { label: 'Best streak', value: `${streakData.bestStreak} days`, icon: Award, tone: 'text-indigo-500' },
          { label: 'Habits today', value: `${habitsData.completed}/${habitsData.total}`, icon: Target, tone: 'text-indigo-500' },
          { label: 'Tasks done', value: `${tasksData.completed}/${tasksData.total}`, icon: CheckSquare, tone: 'text-green-600' }
        ].map(({ label, value, icon: Icon, tone }) => <div key={label} className="flex items-center gap-3 p-4"><Icon size={17} className={tone} /><div><p className="text-sm font-semibold text-gray-900 dark:text-white">{value}</p><p className="mt-0.5 text-[11px] text-gray-500 dark:text-zinc-500">{label}</p></div></div>)}
      </section>

      <section className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="design-card p-5 sm:p-6">
          <div className="mb-4 flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-gray-500 dark:text-zinc-500">Your focus</p><h3 className="mt-1 text-lg font-bold text-gray-900 dark:text-white">Today's habits</h3></div><TrendingUp size={19} className="text-indigo-500" /></div>
          <div className="space-y-2">{allHabits.slice(0, 5).map(habit => { const done = habit.completedDates?.includes(new Date().toISOString().split('T')[0]); return <div key={habit.id} className="flex items-center justify-between rounded-lg px-2 py-3 hover:bg-gray-50 dark:hover:bg-zinc-800"><div className="flex items-center gap-3"><CheckCircle2 size={18} className={done ? 'text-green-600' : 'text-gray-300 dark:text-zinc-600'} /><span className={`text-sm ${done ? 'text-gray-400 line-through dark:text-zinc-500' : 'font-medium text-gray-900 dark:text-white'}`}>{habit.title}</span></div><span className="text-xs text-gray-500 dark:text-zinc-500">{done ? 'Done' : 'Open'}</span></div> })}{allHabits.length === 0 && <p className="py-5 text-sm text-gray-500 dark:text-zinc-500">Your first habit will appear here.</p>}</div>
        </div>
        <div className="design-card p-5 sm:p-6">
          <div className="mb-4 flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-gray-500 dark:text-zinc-500">Next up</p><h3 className="mt-1 text-lg font-bold text-gray-900 dark:text-white">Today's tasks</h3></div><ArrowRight size={19} className="text-gray-400" /></div>
          <div className="space-y-2">{allTasks.filter(task => !task.completed).slice(0, 5).map(task => <div key={task.id} className="flex items-center justify-between gap-3 rounded-lg px-2 py-3 hover:bg-gray-50 dark:hover:bg-zinc-800"><div className="flex min-w-0 items-center gap-3"><span className={`h-2 w-2 shrink-0 rounded-full ${task.priority === 'High' ? 'bg-red-500' : task.priority === 'Low' ? 'bg-green-500' : 'bg-amber-500'}`} /><span className="truncate text-sm font-medium text-gray-900 dark:text-white">{task.text}</span></div><span className="shrink-0 text-xs text-gray-500 dark:text-zinc-500">{task.category || 'Personal'}</span></div>)}{allTasks.filter(task => !task.completed).length === 0 && <p className="py-5 text-sm text-gray-500 dark:text-zinc-500">Nothing urgent. Enjoy the clear space.</p>}</div>
        </div>
      </section>

      <section className="design-card p-5 sm:p-6">
        <div className="mb-5 flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-gray-500 dark:text-zinc-500">This week</p><h3 className="mt-1 text-lg font-bold text-gray-900 dark:text-white">Consistency at a glance</h3></div><Calendar size={19} className="text-gray-400" /></div>
        <div className="grid grid-cols-7 gap-2 sm:gap-3">{streakData.weeklyProgress.map((day, index) => <div key={day.date} className="text-center"><div className="mb-2 text-[11px] font-medium text-gray-500 dark:text-zinc-500">{['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][index]}</div><div className="flex h-24 items-end justify-center rounded-lg bg-gray-50 p-2 dark:bg-zinc-800"><div className="w-full rounded-md bg-indigo-500 transition-all" style={{ height: `${Math.max(day.percentage, 7)}%`, opacity: day.percentage ? 1 : 0.22 }} /></div><div className="mt-2 text-xs font-semibold text-gray-700 dark:text-zinc-300">{day.percentage}%</div></div>)}</div>
      </section>
    </div>
  );
}

export default Dashboard;

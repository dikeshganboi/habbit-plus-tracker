import { useMemo, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar, TrendingUp, Award, Flame, Target, Trash2, CheckSquare, Plus, Lock } from 'lucide-react';

// Professional Habit Tracker with Spreadsheet-style UI
function HabitMatrix({ habits, toggleDay, calculateStreak, deleteHabit, addHabit, newHabitTitle, setNewHabitTitle, newHabitGoal, setNewHabitGoal }) {
  const today = new Date();
  // Get local date in YYYY-MM-DD format without timezone conversion
  const todayISO = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const [viewDate, setViewDate] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth());
  
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  // Context menu state
  const [contextMenu, setContextMenu] = useState(null);
  const [contextMenuHabit, setContextMenuHabit] = useState(null);

  // Generate years dropdown (current year ± 5 years)
  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);
  }, []);

  // Month days
  const monthDays = useMemo(() => {
    const list = [];
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    for (let d = 1; d <= daysInMonth; d++) {
      list.push(new Date(year, month, d).toISOString().split('T')[0]);
    }
    return list;
  }, [year, month]);

  // Calendar structure (weeks with 7 days each)
  const weeks = useMemo(() => {
    const daysInMonth = monthDays.length;
    const weeksArray = [];
    
    // Week 1 always starts from day 1
    for (let startDay = 1; startDay <= daysInMonth; startDay += 7) {
      const currentWeek = [];
      for (let i = 0; i < 7; i++) {
        const day = startDay + i;
        currentWeek.push(day <= daysInMonth ? day : null);
      }
      weeksArray.push(currentWeek);
    }
    
    // Ensure we have exactly 5 weeks
    while (weeksArray.length < 5) {
      weeksArray.push(Array(7).fill(null));
    }
    
    return weeksArray;
  }, [year, month, monthDays]);

  // Week labels
  const weekLabels = weeks.map((_, idx) => `WEEK ${idx + 1}`);
  const dayLabels = ['Thu', 'Fri', 'Sat', 'Sun', 'Mon', 'Tue', 'Wed'];

  // Calculate weekly stats
  const weeklyStats = useMemo(() => {
    return weeks.map(week => {
      let completed = 0;
      let goal = 0;
      
      week.forEach(day => {
        if (day) {
          const dateStr = new Date(year, month, day).toISOString().split('T')[0];
          habits.forEach(habit => {
            goal++;
            if (habit.completedDates?.includes(dateStr)) {
              completed++;
            }
          });
        }
      });
      
      const left = goal - completed;
      const percent = goal > 0 ? ((completed / goal) * 100).toFixed(1) : 0;
      return { completed, goal, left, percent };
    });
  }, [weeks, habits, year, month]);

  // Calculate overall daily progress
  const dailyProgress = useMemo(() => {
    const totalPossible = habits.length * monthDays.length;
    let totalCompleted = 0;
    
    habits.forEach(habit => {
      const completed = habit.completedDates?.filter(d => monthDays.includes(d)).length || 0;
      totalCompleted += completed;
    });
    
    const completedPercent = totalPossible > 0 ? ((totalCompleted / totalPossible) * 100).toFixed(1) : 0;
    const leftPercent = (100 - completedPercent).toFixed(1);
    
    return { completed: completedPercent, left: leftPercent, totalCompleted, totalPossible };
  }, [habits, monthDays]);

  // Top 10 habits by completion rate
  const topHabits = useMemo(() => {
    return habits
      .map(habit => {
        const completed = habit.completedDates?.filter(d => monthDays.includes(d)).length || 0;
        const percent = monthDays.length > 0 ? ((completed / monthDays.length) * 100).toFixed(0) : 0;
        return { ...habit, percent: parseInt(percent), completed };
      })
      .sort((a, b) => b.percent - a.percent)
      .slice(0, 10);
  }, [habits, monthDays]);

  // Weekly progress graph data (percentage per week)
  const weeklyGraphData = weeklyStats.map(stat => parseFloat(stat.percent));
  const maxWeeklyPercent = Math.max(...weeklyGraphData, 100);

  // Handle year/month change
  useEffect(() => {
    setViewDate(new Date(selectedYear, selectedMonth, 1));
  }, [selectedYear, selectedMonth]);

  // Context menu handlers
  useEffect(() => {
    const handleClick = () => setContextMenu(null);
    if (contextMenu) {
      document.addEventListener('click', handleClick);
      return () => document.removeEventListener('click', handleClick);
    }
  }, [contextMenu]);

  const handleContextMenu = (e, habit) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY });
    setContextMenuHabit(habit);
  };

  const handleDeleteHabit = () => {
    if (contextMenuHabit && deleteHabit) {
      if (window.confirm(`Delete "${contextMenuHabit.title}"?`)) {
        deleteHabit(contextMenuHabit.id);
      }
    }
    setContextMenu(null);
    setContextMenuHabit(null);
  };

  const handleToggle = (habitId, dateStr) => {
    // Only allow toggling today's date
    if (dateStr === todayISO && toggleDay) {
      toggleDay(habitId, dateStr);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Section with Calendar Settings */}
      <div className="bg-gradient-to-br from-indigo-100 to-purple-50 dark:from-indigo-900/30 dark:to-purple-800/20 border-2 border-indigo-600 dark:border-indigo-500 rounded-xl p-4 sm:p-6 shadow-[0_4px_16px_rgba(0,0,0,0.1)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
          <h2 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight">HABIT TRACKER</h2>
          
          {/* Calendar Settings - Inline */}
          <div className="flex items-center gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-zinc-300 mb-1">YEAR</label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="px-3 py-2 border-2 border-gray-800 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-gray-900 dark:text-white font-bold text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {years.map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-zinc-300 mb-1">MONTH</label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                className="px-3 py-2 border-2 border-gray-800 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-gray-900 dark:text-white font-bold text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((m, idx) => (
                  <option key={idx} value={idx}>{m}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Add New Habit Form */}
      {addHabit && (
        <div className="bg-gradient-to-br from-white to-gray-50 dark:from-zinc-900 dark:to-zinc-900/50 border-2 border-gray-300 dark:border-zinc-700 rounded-xl p-4 sm:p-6 shadow-[0_4px_16px_rgba(0,0,0,0.1)]">
          <h3 className="text-lg font-black text-gray-900 dark:text-white mb-4">ADD NEW HABIT</h3>
          <form onSubmit={addHabit} className="flex flex-col sm:flex-row gap-3">
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
        </form>
        </div>
      )}

      {/* Daily Habits Calendar Table - MAIN FOCUS */}
      <div className="bg-white dark:bg-zinc-900 border-2 border-gray-800 dark:border-zinc-700 rounded-xl overflow-hidden shadow-[0_4px_16px_rgba(0,0,0,0.1)]">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              {/* Header Row 1: Title & Week Labels */}
              <tr className="bg-gradient-to-br from-indigo-100 to-purple-50 dark:from-indigo-900/50 dark:to-purple-800/30">
                <th rowSpan="3" className="px-4 py-3 text-left font-black text-gray-900 dark:text-white border-r-2 border-gray-800 dark:border-zinc-700 sticky left-0 bg-gradient-to-br from-indigo-100 to-purple-50 dark:from-indigo-900/50 dark:to-purple-800/30 z-10">
                  DAILY HABITS
                </th>
                <th rowSpan="3" className="px-3 py-3 text-center font-black text-gray-900 dark:text-white border-r-2 border-gray-800 dark:border-zinc-700">
                  GOALS
                </th>
                {weekLabels.map((label, idx) => (
                  <th
                    key={idx}
                    colSpan="7"
                    className={`px-2 py-2 text-center font-black text-gray-900 dark:text-white border-r-2 border-gray-800 dark:border-zinc-700 ${
                      idx === 0 ? 'bg-red-200 dark:bg-red-900/40' :
                      idx === 1 ? 'bg-purple-200 dark:bg-purple-900/40' :
                      idx === 2 ? 'bg-indigo-200 dark:bg-indigo-900/40' :
                      idx === 3 ? 'bg-blue-200 dark:bg-blue-900/40' :
                      'bg-orange-200 dark:bg-orange-900/40'
                    }`}
                  >
                    {label}
                  </th>
                ))}
                <th rowSpan="3" className="px-3 py-3 text-center font-black text-gray-900 dark:text-white bg-gradient-to-br from-indigo-300 to-purple-200 dark:from-indigo-800/50 dark:to-purple-700/40">
                  COMPLETED
                </th>
              </tr>
              
              {/* Header Row 2: Day Names */}
              <tr className="bg-gradient-to-br from-indigo-100 to-purple-50 dark:from-indigo-900/50 dark:to-purple-800/30">
                {weeks.map((week, weekIdx) => 
                  week.map((day, dayIdx) => {
                    let dayName = '';
                    if (day) {
                      const date = new Date(year, month, day);
                      const dayOfWeek = date.getDay();
                      dayName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][dayOfWeek];
                    }
                    return (
                      <th
                        key={`${weekIdx}-${dayIdx}`}
                        className={`px-1 py-1.5 text-center text-xs font-black text-gray-900 dark:text-white border-r border-gray-300 dark:border-zinc-700 ${
                          weekIdx === 0 ? 'bg-red-200 dark:bg-red-900/40' :
                          weekIdx === 1 ? 'bg-purple-200 dark:bg-purple-900/40' :
                          weekIdx === 2 ? 'bg-indigo-200 dark:bg-indigo-900/40' :
                          weekIdx === 3 ? 'bg-blue-200 dark:bg-blue-900/40' :
                          'bg-orange-200 dark:bg-orange-900/40'
                        }`}
                      >
                        {dayName}
                      </th>
                    );
                  })
                )}
              </tr>
              
              {/* Header Row 3: Day Numbers */}
              <tr className="bg-gradient-to-br from-indigo-100 to-purple-50 dark:from-indigo-900/50 dark:to-purple-800/30 border-b-2 border-gray-800 dark:border-zinc-700">
                {weeks.map((week, weekIdx) => 
                  week.map((day, dayIdx) => (
                    <th
                      key={`${weekIdx}-${dayIdx}`}
                      className={`px-1 py-2 text-center font-bold text-gray-800 dark:text-zinc-300 border-r border-gray-300 dark:border-zinc-700 ${
                        weekIdx === 0 ? 'bg-red-100 dark:bg-red-900/30' :
                        weekIdx === 1 ? 'bg-purple-100 dark:bg-purple-900/30' :
                        weekIdx === 2 ? 'bg-indigo-100 dark:bg-indigo-900/30' :
                        weekIdx === 3 ? 'bg-blue-100 dark:bg-blue-900/30' :
                        'bg-orange-100 dark:bg-orange-900/30'
                      }`}
                    >
                      {day || ''}
                    </th>
                  ))
                )}
              </tr>
            </thead>
            
            <tbody>
              {habits.map((habit, habitIdx) => {
                const monthCompleted = habit.completedDates?.filter(d => monthDays.includes(d)).length || 0;
                const goal = habit.goal || monthDays.length;
                
                return (
                  <tr
                    key={habit.id}
                    className={`border-b border-gray-200 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-800/50 ${
                      habitIdx % 2 === 0 ? 'bg-white dark:bg-zinc-900' : 'bg-gray-50/50 dark:bg-zinc-900/50'
                    }`}
                    onContextMenu={(e) => handleContextMenu(e, habit)}
                  >
                    {/* Habit Name */}
                    <td className="px-4 py-2 font-bold text-gray-900 dark:text-white border-r-2 border-gray-300 dark:border-zinc-700 sticky left-0 bg-white dark:bg-zinc-900 z-10">
                      {habit.title}
                    </td>
                    
                    {/* Goal */}
                    <td className="px-3 py-2 text-center font-bold text-gray-900 dark:text-white border-r-2 border-gray-300 dark:border-zinc-700">
                      {goal}
                    </td>
                    
                    {/* Checkboxes for each day */}
                    {weeks.map((week, weekIdx) =>
                      week.map((day, dayIdx) => {
                        if (!day) {
                          return <td key={`${weekIdx}-${dayIdx}`} className="border-r border-gray-200 dark:border-zinc-800"></td>;
                        }
                        
                        // Create date string in local timezone
                        const dateObj = new Date(year, month, day);
                        const dateStr = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;
                        const isCompleted = habit.completedDates?.includes(dateStr);
                        const isToday = dateStr === todayISO;
                        
                        // Compare dates properly
                        const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
                        const cellDate = new Date(year, month, day);
                        const isPast = cellDate < todayDate;
                        const isFuture = cellDate > todayDate;
                        
                        return (
                          <td
                            key={`${weekIdx}-${dayIdx}`}
                            className="px-2 py-2 text-center border-r border-gray-200 dark:border-zinc-800"
                          >
                            <button
                              onClick={() => handleToggle(habit.id, dateStr)}
                              disabled={!isToday}
                              className={`w-5 h-5 border-2 rounded flex items-center justify-center transition-colors ${
                                isToday 
                                  ? 'border-gray-400 dark:border-zinc-600 hover:border-indigo-500 dark:hover:border-indigo-400 cursor-pointer' 
                                  : isCompleted
                                    ? 'border-gray-300 dark:border-zinc-700 cursor-default'
                                    : isPast
                                      ? 'border-red-300 dark:border-red-900/40 cursor-not-allowed bg-red-50 dark:bg-red-900/10'
                                      : 'border-gray-300 dark:border-zinc-800 cursor-not-allowed opacity-40'
                              }`}
                              style={{
                                backgroundColor: isCompleted ? 'rgb(99, 102, 241)' : (isPast && !isCompleted ? undefined : 'transparent'),
                                opacity: isCompleted && !isToday ? 0.7 : 1
                              }}
                              title={isToday ? 'Click to toggle' : isPast ? (isCompleted ? 'Completed on past date' : 'Missed - Past date locked') : 'Future date - cannot modify'}
                            >
                              {isCompleted ? (
                                <CheckSquare className="w-4 h-4 text-white" strokeWidth={3} />
                              ) : isPast ? (
                                <Lock className="w-3 h-3 text-red-500 dark:text-red-400" strokeWidth={2.5} />
                              ) : null}
                            </button>
                          </td>
                        );
                      })
                    )}
                    
                    {/* Completed Count */}
                    <td className="px-3 py-2 text-center font-black text-gray-900 dark:text-white bg-indigo-50 dark:bg-indigo-900/20">
                      {monthCompleted}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Overview Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Weekly Progress Graph - Takes more space */}
        <div className="lg:col-span-7">
          <div className="bg-gradient-to-br from-indigo-100 to-purple-50 dark:from-indigo-900/30 dark:to-purple-800/20 border-2 border-indigo-600 dark:border-indigo-500 rounded-xl p-4 sm:p-6 shadow-[0_4px_16px_rgba(0,0,0,0.1)] h-full">
            <h3 className="text-xl font-black text-gray-900 dark:text-white mb-4">OVERVIEW</h3>
            
            {/* Graph Title */}
            <div className="text-sm font-bold text-gray-700 dark:text-zinc-300 mb-4">WEEKLY PROGRESS BY GRAPH</div>
            
            {/* Line Graph */}
            <div className="bg-white dark:bg-zinc-900 border-2 border-gray-300 dark:border-zinc-700 rounded-lg p-6 h-64 relative">
              {/* Y-axis labels */}
              <div className="absolute left-0 top-0 bottom-8 flex flex-col justify-between text-xs font-bold text-gray-600 dark:text-zinc-400 pr-2">
                <span>100.0%</span>
                <span>75.0%</span>
                <span>50.0%</span>
                <span>25.0%</span>
                <span>0.0%</span>
              </div>
              
              {/* Graph area */}
              <div className="ml-12 h-full relative">
                {/* Grid lines */}
                {[0, 25, 50, 75, 100].map(percent => (
                  <div
                    key={percent}
                    className="absolute left-0 right-0 border-t border-gray-200 dark:border-zinc-700"
                    style={{ top: `${100 - percent}%` }}
                  />
                ))}
                
                {/* Line chart */}
                <svg className="w-full h-full" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="lineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="rgb(165, 180, 252)" stopOpacity="0.5" />
                      <stop offset="100%" stopColor="rgb(165, 180, 252)" stopOpacity="0.05" />
                    </linearGradient>
                  </defs>
                  
                  {/* Fill area under line */}
                  <polygon
                    points={`
                      0,${240 * (1 - weeklyGraphData[0] / 100)}
                      ${(100 / 5) * 1},${240 * (1 - weeklyGraphData[1] / 100)}
                      ${(100 / 5) * 2},${240 * (1 - weeklyGraphData[2] / 100)}
                      ${(100 / 5) * 3},${240 * (1 - weeklyGraphData[3] / 100)}
                      ${(100 / 5) * 4},${240 * (1 - weeklyGraphData[4] / 100)}
                      100,240 0,240
                    `}
                    fill="url(#lineGradient)"
                  />
                  
                  {/* Line */}
                  <polyline
                    points={weeklyGraphData.map((percent, idx) => 
                      `${(100 / 5) * idx},${240 * (1 - percent / 100)}`
                    ).join(' ')}
                    fill="none"
                    stroke="rgb(99, 102, 241)"
                    strokeWidth="3"
                    vectorEffect="non-scaling-stroke"
                  />
                  
                  {/* Points */}
                  {weeklyGraphData.map((percent, idx) => (
                    <circle
                      key={idx}
                      cx={`${(100 / 5) * idx}%`}
                      cy={`${100 * (1 - percent / 100)}%`}
                      r="4"
                      fill="rgb(99, 102, 241)"
                      stroke="white"
                      strokeWidth="2"
                      vectorEffect="non-scaling-stroke"
                    />
                  ))}
                </svg>
              </div>
            </div>

            {/* Weekly Stats Table */}
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm">
                <tbody>
                  <tr className="border-b-2 border-gray-800 dark:border-zinc-700">
                    <td className="py-2 px-3 font-bold text-gray-900 dark:text-white">COMPLETED</td>
                    {weeklyStats.map((stat, idx) => (
                      <td key={idx} className="py-2 px-3 text-center font-bold text-gray-900 dark:text-white">{stat.completed}</td>
                    ))}
                  </tr>
                  <tr className="border-b-2 border-gray-800 dark:border-zinc-700">
                    <td className="py-2 px-3 font-bold text-gray-900 dark:text-white">GOAL</td>
                    {weeklyStats.map((stat, idx) => (
                      <td key={idx} className="py-2 px-3 text-center font-bold text-gray-900 dark:text-white">{stat.goal}</td>
                    ))}
                  </tr>
                  <tr className="border-b-2 border-gray-800 dark:border-zinc-700">
                    <td className="py-2 px-3 font-bold text-gray-900 dark:text-white">LEFT</td>
                    {weeklyStats.map((stat, idx) => (
                      <td key={idx} className="py-2 px-3 text-center font-bold text-gray-900 dark:text-white">{stat.left}</td>
                    ))}
                  </tr>
                  <tr className="border-b border-gray-300 dark:border-zinc-700">
                    <td className="py-2 px-3 font-bold text-gray-900 dark:text-white"></td>
                    {weeklyStats.map((stat, idx) => (
                      <td key={idx} className="py-2 px-3 text-center text-xs font-bold text-gray-600 dark:text-zinc-400">{stat.completed}/{stat.goal}</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-bold text-gray-900 dark:text-white">WEEKLY PROGRESS</td>
                    {weeklyStats.map((stat, idx) => (
                      <td key={idx} className="py-2 px-3 text-center font-bold text-indigo-600 dark:text-indigo-400">{stat.percent}%</td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Side: Daily Progress & Top Habits in 2 columns */}
        <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
          {/* Daily Progress Donut */}
          <div className="bg-gradient-to-br from-indigo-100 to-purple-50 dark:from-indigo-900/30 dark:to-purple-800/20 border-2 border-indigo-600 dark:border-indigo-500 rounded-xl p-4 sm:p-6 shadow-[0_4px_16px_rgba(0,0,0,0.1)]">
            <h3 className="text-lg font-black text-gray-900 dark:text-white mb-4">OVERVIEW DAILY PROGRESS</h3>
            
            <div className="relative w-48 h-48 mx-auto">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="96"
                  cy="96"
                  r="70"
                  fill="none"
                  stroke="rgb(254, 215, 170)"
                  strokeWidth="40"
                  opacity="0.3"
                />
                <circle
                  cx="96"
                  cy="96"
                  r="70"
                  fill="none"
                  stroke="rgb(165, 180, 252)"
                  strokeWidth="40"
                  strokeDasharray={`${(parseFloat(dailyProgress.completed) / 100) * 440} 440`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-3xl font-black text-gray-900 dark:text-white">{dailyProgress.completed}%</div>
                  <div className="text-xs font-bold text-gray-600 dark:text-zinc-400">COMPLETED</div>
                </div>
              </div>
            </div>
            
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-bold text-gray-700 dark:text-zinc-300">LEFT</span>
                <span className="font-bold text-gray-900 dark:text-white">{dailyProgress.left}%</span>
              </div>
            </div>
          </div>

          {/* Top 10 Habits */}
          <div className="bg-gradient-to-br from-indigo-100 to-purple-50 dark:from-indigo-900/30 dark:to-purple-800/20 border-2 border-indigo-600 dark:border-indigo-500 rounded-xl p-4 sm:p-6 shadow-[0_4px_16px_rgba(0,0,0,0.1)]">
            <h3 className="text-base sm:text-lg font-black text-gray-900 dark:text-white mb-3 sm:mb-4">TOP 10 DAILY HABITS</h3>
            
            <div className="space-y-2">
              {topHabits.map((habit, idx) => (
                <div key={habit.id} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-gray-900 dark:text-white w-6">{idx + 1}</span>
                    <span className="font-bold text-gray-800 dark:text-zinc-200">{habit.title}</span>
                  </div>
                  <span className="font-black text-indigo-600 dark:text-indigo-400">{habit.percent}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Progress Summary - Full Width Below */}
      <div className="bg-gradient-to-br from-indigo-100 to-purple-50 dark:from-indigo-900/30 dark:to-purple-800/20 border-2 border-indigo-600 dark:border-indigo-500 rounded-xl p-4 sm:p-6">
        <h4 className="text-base sm:text-lg font-black text-gray-900 dark:text-white mb-4">HABIT PROGRESS SUMMARY</h4>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {habits.slice(0, 10).map(habit => {
            const completed = habit.completedDates?.filter(d => monthDays.includes(d)).length || 0;
            const goal = habit.goal || monthDays.length;
            const percent = goal > 0 ? ((completed / goal) * 100).toFixed(1) : 0;
              
            return (
              <div key={habit.id} className="bg-white dark:bg-zinc-900 border-2 border-gray-300 dark:border-zinc-700 rounded-lg p-3">
                <div className="text-xs font-bold text-gray-900 dark:text-white mb-2 truncate" title={habit.title}>
                  {habit.title}
                </div>
                <div className="flex justify-between text-xs font-bold mb-2">
                  <span className="text-gray-600 dark:text-zinc-400">{completed}/{goal}</span>
                  <span className="text-indigo-600 dark:text-indigo-400">{percent}%</span>
                </div>
                <div className="h-3 bg-gray-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-300"
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Context Menu */}
      {contextMenu && contextMenuHabit && (
        <div
          className="fixed bg-white dark:bg-zinc-900 border-2 border-gray-800 dark:border-zinc-700 rounded-lg shadow-[0_4px_20px_rgba(0,0,0,0.3)] py-2 z-50 min-w-[200px]"
          style={{ top: contextMenu.y, left: contextMenu.x }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-4 py-2 text-sm font-bold text-gray-900 dark:text-white border-b-2 border-gray-200 dark:border-zinc-800">
            {contextMenuHabit.title}
          </div>
          <button
            onClick={handleDeleteHabit}
            className="w-full px-4 py-2 text-left text-sm font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Delete Habit
          </button>
          <button
            onClick={() => setContextMenu(null)}
            className="w-full px-4 py-2 text-left text-sm font-bold text-gray-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}

export default HabitMatrix;

import { useMemo } from 'react';

function HabitAnalysis({ habits }) {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthDays = useMemo(() => {
    return Array.from({ length: daysInMonth }, (_, i) => new Date(year, month, i + 1).toISOString().split('T')[0]);
  }, [year, month, daysInMonth]);

  const analysis = useMemo(() => {
    return habits.map(h => {
      const completedThisMonth = h.completedDates?.filter(d => monthDays.includes(d)).length || 0;
      const goal = h.goalDaysPerMonth || daysInMonth;
      const progressPct = goal ? Math.round((completedThisMonth / goal) * 100) : 0;
      return {
        id: h.id,
        title: h.title,
        completed: completedThisMonth,
        goal,
        pct: progressPct
      };
    });
  }, [habits, monthDays, daysInMonth]);

  return (
    <div className="bg-gradient-to-b from-white to-gray-50 dark:from-zinc-900 dark:to-zinc-900/80 border-2 border-gray-300 dark:border-zinc-700 rounded-2xl p-4 shadow-[0_4px_12px_rgba(0,0,0,0.1)] dark:shadow-[0_4px_16px_rgba(0,0,0,0.3)]">
      <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-3">Analysis</h4>
      <div className="space-y-3">
        {analysis.length === 0 && <p className="text-xs text-gray-500 dark:text-zinc-500 font-medium">No habits to analyze.</p>}
        {analysis.map(item => (
          <div key={item.id} className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-gray-900 dark:text-white truncate pr-2 font-bold">{item.title}</span>
              <span className="text-gray-600 dark:text-zinc-400 font-semibold">{item.completed}/{item.goal}</span>
            </div>
            <div className="h-2 bg-gray-300 dark:bg-zinc-800 rounded overflow-hidden border border-gray-400 dark:border-zinc-700 shadow-inner">
              <div className="h-full bg-gradient-to-r from-indigo-600 to-purple-600 shadow-[0_0_6px_rgba(99,102,241,0.5)]" style={{ width: `${item.pct}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default HabitAnalysis;

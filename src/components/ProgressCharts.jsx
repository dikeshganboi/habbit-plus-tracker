import { useMemo } from 'react';
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, AreaChart, Area } from 'recharts';

function ProgressCharts({ habits, moodEntries = [] }) {
  const today = new Date();
  // Build last 30 days array
  const days = useMemo(() => {
    const arr = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      arr.push(d.toISOString().split('T')[0]);
    }
    return arr;
  }, [today]);

  const completionData = useMemo(() => {
    return days.map(dateStr => {
      const completed = habits.filter(h => h.completedDates?.includes(dateStr)).length;
      const percent = habits.length ? +(completed / habits.length * 100).toFixed(0) : 0;
      return {
        date: new Date(dateStr).getDate(),
        percent
      };
    });
  }, [days, habits]);

  // Real mood data from Firestore
  const mentalStateData = useMemo(() => {
    return days.map(dateStr => {
      const entry = moodEntries.find(m => m.date === dateStr);
      return {
        date: new Date(dateStr).getDate(),
        mood: entry ? entry.score : null
      };
    });
  }, [days, moodEntries]);

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <div className="bg-gradient-to-b from-white to-gray-50 dark:from-zinc-900 dark:to-zinc-900/80 border-2 border-gray-300 dark:border-zinc-700 rounded-2xl p-4 shadow-[0_4px_12px_rgba(0,0,0,0.1)] dark:shadow-[0_4px_16px_rgba(0,0,0,0.3)]">
        <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-2">Completion Trend (30d)</h4>
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={completionData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorComp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity={0.6} />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" tick={{ fill: '#71717a', fontSize: 10 }} />
              <YAxis domain={[0, 100]} tick={{ fill: '#71717a', fontSize: 10 }} />
              <Tooltip contentStyle={{ background: '#18181b', border: '1px solid #27272a' }} />
              <Area type="monotone" dataKey="percent" stroke="#6366f1" fill="url(#colorComp)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-4">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Mood Trend (30d)</h4>
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={mentalStateData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <XAxis dataKey="date" tick={{ fill: '#71717a', fontSize: 10 }} />
              <YAxis domain={[0, 100]} tick={{ fill: '#71717a', fontSize: 10 }} />
              <Tooltip contentStyle={{ background: '#18181b', border: '1px solid #27272a' }} />
              <Line type="monotone" dataKey="mood" stroke="#f472b6" strokeWidth={2} dot={false} connectNulls />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export default ProgressCharts;

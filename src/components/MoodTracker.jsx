import { useState, useEffect } from 'react';
import { collection, query, getDocs, addDoc, updateDoc, doc, where } from 'firebase/firestore';
import { db } from '../firebase';
import { Smile, Meh, Frown } from 'lucide-react';

function MoodTracker({ userId }) {
  const [moodEntries, setMoodEntries] = useState([]);
  const [todayMood, setTodayMood] = useState(null);
  const [todayNotes, setTodayNotes] = useState('');
  const [loading, setLoading] = useState(true);

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (!userId) return;
    fetchMoods();
  }, [userId]);

  const fetchMoods = async () => {
    try {
      const moodsRef = collection(db, 'users', userId, 'moods');
      const moodsSnapshot = await getDocs(query(moodsRef));
      
      const moods = moodsSnapshot.docs.map(d => ({
        id: d.id,
        ...d.data()
      }));
      
      setMoodEntries(moods);
      const todayEntry = moods.find(m => m.date === today);
      setTodayMood(todayEntry ? todayEntry.score : null);
      setTodayNotes(todayEntry ? todayEntry.notes || '' : '');
      setLoading(false);
    } catch (error) {
      console.error('Error fetching moods:', error);
      setLoading(false);
    }
  };

  const setMood = async (score) => {
    if (!userId) return;
    try {
      const existingEntry = moodEntries.find(m => m.date === today);
      if (existingEntry) {
        const moodRef = doc(db, 'users', userId, 'moods', existingEntry.id);
        await updateDoc(moodRef, { score, notes: todayNotes, updatedAt: new Date().toISOString() });
      } else {
        const moodsRef = collection(db, 'users', userId, 'moods');
        await addDoc(moodsRef, {
          date: today,
          score,
          notes: todayNotes,
          createdAt: new Date().toISOString()
        });
      }
      setTodayMood(score);
      fetchMoods();
    } catch (error) {
      console.error('Error setting mood:', error);
    }
  };

  const saveNotes = async () => {
    if (!userId) return;
    try {
      const existingEntry = moodEntries.find(m => m.date === today);
      if (existingEntry) {
        const moodRef = doc(db, 'users', userId, 'moods', existingEntry.id);
        await updateDoc(moodRef, { notes: todayNotes, updatedAt: new Date().toISOString() });
      } else if (todayMood !== null) {
        const moodsRef = collection(db, 'users', userId, 'moods');
        await addDoc(moodsRef, {
          date: today,
          score: todayMood,
          notes: todayNotes,
          createdAt: new Date().toISOString()
        });
      }
      fetchMoods();
    } catch (error) {
      console.error('Error saving notes:', error);
    }
  };

  const moodOptions = [
    { value: 30, label: 'Low', icon: Frown, color: 'text-red-400', bg: 'bg-red-500/20', border: 'border-red-500' },
    { value: 50, label: 'Neutral', icon: Meh, color: 'text-yellow-400', bg: 'bg-yellow-500/20', border: 'border-yellow-500' },
    { value: 80, label: 'Good', icon: Smile, color: 'text-emerald-400', bg: 'bg-emerald-500/20', border: 'border-emerald-500' }
  ];

  if (loading) {
    return <div className="text-xs text-gray-500 dark:text-zinc-500">Loading mood...</div>;
  }

  return (
    <div className="bg-gradient-to-b from-white to-gray-50 dark:from-zinc-900 dark:to-zinc-900/80 border-2 border-gray-300 dark:border-zinc-700 rounded-2xl p-4 shadow-[0_4px_12px_rgba(0,0,0,0.1)] dark:shadow-[0_4px_16px_rgba(0,0,0,0.3)]">
      <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-3">Today's Mood</h4>
      <div className="flex gap-2">
        {moodOptions.map(opt => {
          const Icon = opt.icon;
          const isSelected = todayMood === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => setMood(opt.value)}
              className={`flex-1 flex flex-col items-center justify-center py-3 rounded-lg border-2 transition-all shadow-md ${
                isSelected ? `${opt.bg} ${opt.border} border-2 shadow-[0_4px_12px_rgba(99,102,241,0.3)]` : 'bg-gradient-to-b from-white to-gray-100 dark:from-zinc-800 dark:to-zinc-850 border-gray-400 dark:border-zinc-600 hover:border-gray-500 dark:hover:border-zinc-500'
              }`}
            >
              <Icon className={`mb-1 drop-shadow-md ${isSelected ? opt.color : 'text-gray-400 dark:text-zinc-500'}`} size={24} />
              <span className={`text-xs ${isSelected ? 'text-gray-900 dark:text-white font-black' : 'text-gray-600 dark:text-zinc-400 font-bold'}`}>{opt.label}</span>
            </button>
          );
        })}
      </div>
      <div className="mt-3">
        <textarea
          value={todayNotes}
          onChange={(e) => setTodayNotes(e.target.value)}
          onBlur={saveNotes}
          placeholder="Add notes about your day (optional)..."
          className="w-full bg-white dark:bg-zinc-800 border-2 border-gray-400 dark:border-zinc-600 rounded-lg px-3 py-2 text-gray-900 dark:text-white text-xs placeholder-gray-500 dark:placeholder-zinc-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 resize-none font-medium shadow-inner"
          rows={3}
        />
      </div>
    </div>
  );
}

export default MoodTracker;

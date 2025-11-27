import { useEffect, useState } from 'react';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Trophy, Sparkles } from 'lucide-react';

// XP thresholds for each level (exponential growth)
const LEVEL_THRESHOLDS = [
  0,     // Level 1
  100,   // Level 2
  250,   // Level 3
  450,   // Level 4
  700,   // Level 5
  1000,  // Level 6
  1350,  // Level 7
  1750,  // Level 8
  2200,  // Level 9
  2700,  // Level 10
  3250,  // Level 11
  3850,  // Level 12
  4500,  // Level 13
  5200,  // Level 14
  5950,  // Level 15
  6750,  // Level 16
  7600,  // Level 17
  8500,  // Level 18
  9450,  // Level 19
  10450, // Level 20
];

export const XP_REWARDS = {
  HABIT_COMPLETE: 10,
  TASK_COMPLETE: 5,
  PERFECT_WEEK: 50,
  MOOD_LOG: 3,
};

export const useXPSystem = (userId) => {
  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showLevelUp, setShowLevelUp] = useState(false);

  useEffect(() => {
    if (!userId) return;
    loadProfile();
  }, [userId]);

  const loadProfile = async () => {
    try {
      const profileRef = doc(db, 'users', userId, 'profile', 'gamification');
      const profileDoc = await getDoc(profileRef);
      
      if (profileDoc.exists()) {
        const data = profileDoc.data();
        setXp(data.xp || 0);
        setLevel(data.level || 1);
      } else {
        // Initialize profile
        await setDoc(profileRef, {
          xp: 0,
          level: 1,
          createdAt: new Date().toISOString(),
        });
      }
      setLoading(false);
    } catch (error) {
      console.error('Error loading profile:', error);
      setLoading(false);
    }
  };

  const addXP = async (amount) => {
    try {
      const newXP = xp + amount;
      const newLevel = calculateLevel(newXP);
      
      const profileRef = doc(db, 'users', userId, 'profile', 'gamification');
      await updateDoc(profileRef, {
        xp: newXP,
        level: newLevel,
        lastUpdated: new Date().toISOString(),
      });

      setXp(newXP);
      
      // Check for level up
      if (newLevel > level) {
        setLevel(newLevel);
        setShowLevelUp(true);
        setTimeout(() => setShowLevelUp(false), 3000);
      }
    } catch (error) {
      console.error('Error adding XP:', error);
    }
  };

  const calculateLevel = (currentXP) => {
    for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
      if (currentXP >= LEVEL_THRESHOLDS[i]) {
        return i + 1;
      }
    }
    return 1;
  };

  const getProgressToNextLevel = () => {
    if (level >= LEVEL_THRESHOLDS.length) {
      return { current: xp, needed: xp, percentage: 100 };
    }
    
    const currentThreshold = LEVEL_THRESHOLDS[level - 1];
    const nextThreshold = LEVEL_THRESHOLDS[level];
    const progress = xp - currentThreshold;
    const needed = nextThreshold - currentThreshold;
    const percentage = Math.floor((progress / needed) * 100);
    
    return { current: progress, needed, percentage };
  };

  return {
    xp,
    level,
    loading,
    showLevelUp,
    addXP,
    getProgressToNextLevel,
  };
};

export function XPProgressBar({ xp, level, getProgressToNextLevel }) {
  const progress = getProgressToNextLevel();

  return (
    <div className="flex items-center space-x-2 sm:space-x-3">
      {/* Level Badge */}
      <div className="flex items-center space-x-1 sm:space-x-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg bg-gradient-to-r from-amber-500/30 to-orange-500/30 border-2 border-amber-500/50 shadow-[0_2px_8px_rgba(245,158,11,0.3)]">
        <Trophy className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 drop-shadow-md" />
        <span className="text-xs sm:text-sm font-black text-amber-400">Lvl {level}</span>
      </div>

      {/* Progress Bar */}
      <div className="flex-1 min-w-[100px] sm:min-w-[150px]">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] sm:text-xs text-gray-600 dark:text-zinc-400">
            {progress.current} / {progress.needed} XP
          </span>
          <span className="text-[10px] sm:text-xs font-medium text-amber-400">
            {progress.percentage}%
          </span>
        </div>
        <div className="h-1.5 sm:h-2 bg-gray-300 dark:bg-zinc-800 rounded-full overflow-hidden border border-gray-400 dark:border-zinc-700 shadow-inner">
          <div
            className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-500 ease-out shadow-[0_0_8px_rgba(245,158,11,0.6)]"
            style={{ width: `${progress.percentage}%` }}
          />
        </div>
      </div>

      {/* Total XP */}
      <div className="hidden lg:block text-sm text-gray-600 dark:text-zinc-400">
        <span className="font-medium text-gray-900 dark:text-white">{xp}</span> XP
      </div>
    </div>
  );
}

export function LevelUpNotification({ show, level }) {
  if (!show) return null;

  return (
    <div className="fixed top-20 sm:top-24 left-1/2 transform -translate-x-1/2 z-50 animate-bounce px-3">
      <div className="px-4 sm:px-6 py-3 sm:py-4 rounded-lg sm:rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 shadow-[0_8px_32px_rgba(245,158,11,0.5)] border-2 border-amber-600">
        <div className="flex items-center space-x-2 sm:space-x-3">
          <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-white animate-pulse drop-shadow-md" />
          <div>
            <p className="text-white font-black text-base sm:text-lg tracking-wide">Level Up!</p>
            <p className="text-white/95 text-xs sm:text-sm font-bold">You've reached Level {level}</p>
          </div>
          <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-white animate-pulse drop-shadow-md" />
        </div>
      </div>
    </div>
  );
}

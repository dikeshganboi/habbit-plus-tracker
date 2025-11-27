import { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './firebase';
import { Home, Target, CheckSquare, Loader2, User, BarChart3 } from 'lucide-react';
import Dashboard from './components/Dashboard';
import HabitTracker from './components/HabitTracker';
import TaskManager from './components/TaskManager';
import AnalyticsTab from './components/AnalyticsTab';
import AuthForm from './components/AuthForm';
import ProfileSettings from './components/ProfileSettings';
import AuthGuard from './components/guards/AuthGuard';
import SubscriptionGuard from './components/SubscriptionGuard';
import ThemeToggle from './components/ThemeToggle';
import { useXPSystem, XPProgressBar, LevelUpNotification } from './components/XPSystem';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('home');
  
  // XP System
  const { xp, level, loading: xpLoading, showLevelUp, addXP, getProgressToNextLevel } = useXPSystem(user?.uid);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (!loading && !user) {
    return <AuthForm onAuth={(u) => setUser(u)} />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-black flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-zinc-400">Loading FocusLab...</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'habits', label: 'Habits', icon: Target },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'profile', label: 'Profile', icon: User }
  ];

  return (
    <SubscriptionGuard userId={user?.uid}>
      <div className="min-h-screen bg-gray-50 dark:bg-black">
        {/* Level Up Notification */}
        <LevelUpNotification show={showLevelUp} level={level} />

        {/* Header */}
        <header className="border-b-2 border-gray-300 dark:border-zinc-700 bg-gradient-to-b from-white/95 to-white/90 dark:from-zinc-900/95 dark:to-zinc-900/90 backdrop-blur-xl sticky top-0 z-40 shadow-[0_2px_8px_rgba(0,0,0,0.05)] dark:shadow-[0_2px_12px_rgba(0,0,0,0.3)]">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16 gap-2">
          <button 
            onClick={() => setActiveTab('home')} 
            className="flex items-center space-x-2 sm:space-x-3 transition-all hover:opacity-80 active:scale-95 cursor-pointer"
            aria-label="Go to home"
          >
            <img src="/logo.svg" alt="FocusLab Logo" className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg shadow-[0_2px_8px_rgba(99,102,241,0.4)]" />
            <h1 className="text-lg sm:text-xl font-black text-gray-900 dark:text-white tracking-wide">FocusLab</h1>
          </button>
            <div className="flex items-center gap-2 sm:gap-4">
              {/* XP Progress Bar */}
              {!xpLoading && (
                <div className="hidden sm:block">
                  <XPProgressBar 
                    xp={xp} 
                    level={level} 
                    getProgressToNextLevel={getProgressToNextLevel} 
                  />
                </div>
              )}
              <div className="hidden sm:block h-6 w-px bg-gray-300 dark:bg-zinc-700"></div>
              {/* Theme Toggle */}
              <ThemeToggle />
              <div className="hidden md:block h-6 w-px bg-gray-300 dark:bg-zinc-700"></div>
              <div className="hidden md:block text-xs lg:text-sm text-gray-600 dark:text-zinc-400 max-w-[120px] lg:max-w-none truncate">
                {user?.email ? user.email : 'Signed in'}
              </div>
              <button
                onClick={() => signOut(auth)}
                className="text-xs sm:text-sm px-2 sm:px-3 py-1.5 rounded-md bg-gray-200 hover:bg-gray-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-gray-700 dark:text-zinc-200 border border-gray-300 dark:border-zinc-700 whitespace-nowrap"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="border-b border-gray-200 dark:border-zinc-800/50 bg-white/60 dark:bg-zinc-900/60 backdrop-blur-lg sticky top-14 sm:top-16 z-30 overflow-x-auto">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex space-x-2 sm:space-x-8 min-w-max">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-1.5 sm:space-x-2 px-3 sm:px-4 py-3 sm:py-4 border-b-2 transition-all whitespace-nowrap ${
                    isActive
                      ? 'border-indigo-600 text-gray-900 dark:text-white'
                      : 'border-transparent text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white hover:border-gray-300 dark:hover:border-zinc-700'
                  }`}
                >
                  <Icon size={18} className="sm:w-5 sm:h-5" />
                  <span className="font-medium text-sm sm:text-base">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        <AuthGuard user={user} fallback={null}>
          {activeTab === 'home' && <Dashboard userId={user?.uid} />}
          {activeTab === 'habits' && <HabitTracker userId={user?.uid} onXPEarned={addXP} />}
          {activeTab === 'tasks' && <TaskManager userId={user?.uid} onXPEarned={addXP} />}
          {activeTab === 'analytics' && <AnalyticsTab userId={user?.uid} />}
          {activeTab === 'profile' && (
            <ProfileSettings
              user={user}
              onUserUpdated={(updated) => setUser({ ...updated })}
            />
          )}
        </AuthGuard>
      </main>
    </div>
    </SubscriptionGuard>
  );
}

export default App;

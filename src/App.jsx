import { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './firebase';
import { Home, Target, CheckSquare, Loader2, User, BarChart3, LogOut } from 'lucide-react';
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
      <div className="app-shell min-h-screen">
        {/* Level Up Notification */}
        <LevelUpNotification show={showLevelUp} level={level} />

        {/* Header */}
        <header className="app-header border-b sticky top-0 z-40 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-[4.25rem] gap-2">
          <button 
            onClick={() => setActiveTab('home')} 
            className="flex items-center space-x-2.5 hover:opacity-80 active:scale-95 cursor-pointer"
            aria-label="Go to home"
          >
            <div className="flex items-center gap-2.5">
              <img src="/logo.svg" alt="FocusLab Logo" className="h-8 w-8" />
              <div className="text-left leading-none">
                <span className="block text-lg font-bold tracking-tight text-gray-900 dark:text-white">Focus<span className="text-indigo-600 dark:text-indigo-400">Lab</span></span>
                <span className="mt-1 block text-[8px] font-medium uppercase tracking-[0.22em] text-gray-500 dark:text-zinc-400">Build a better you</span>
              </div>
            </div>
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
              <button
                onClick={() => setActiveTab('profile')}
                className="soft-button inline-flex h-7 w-7 items-center justify-center p-0 sm:hidden"
                aria-label="Open profile settings"
                title="Profile settings"
              >
                <User size={15} />
              </button>
              <div className="hidden md:block h-6 w-px bg-gray-300 dark:bg-zinc-700"></div>
              <div className="hidden md:block text-xs lg:text-sm text-gray-600 dark:text-zinc-400 max-w-[120px] lg:max-w-none truncate">
                {user?.email ? user.email : 'Signed in'}
              </div>
              <button
                onClick={() => signOut(auth)}
                className="soft-button inline-flex items-center gap-2 text-xs sm:text-sm px-3 py-2 whitespace-nowrap"
                aria-label="Sign out"
              >
                <LogOut size={15} />
                <span className="hidden sm:inline">Sign out</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="app-nav border-b backdrop-blur-lg sticky top-[4.25rem] z-30 overflow-x-auto">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex justify-between sm:justify-start sm:space-x-2 min-w-max">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                    className={`${tab.id === 'profile' ? 'hidden sm:flex' : 'flex'} items-center space-x-1.5 sm:space-x-2 px-3 sm:px-4 py-3 border-b-2 transition-all whitespace-nowrap ${
                    isActive
                      ? 'border-indigo-600 text-indigo-700 dark:text-indigo-300'
                      : 'border-transparent text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white hover:border-gray-300 dark:hover:border-zinc-700'
                  }`}
                >
                  <Icon size={18} className="sm:w-5 sm:h-5" />
                  <span className="font-semibold text-xs sm:text-sm">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="app-content max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-8 pb-8">
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

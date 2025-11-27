import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

function ThemeToggle() {
  const { theme, toggleTheme, isDark } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="relative w-14 h-7 bg-zinc-700 dark:bg-zinc-800 rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-black"
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      {/* Sliding background */}
      <span
        className={`absolute inset-0 rounded-full transition-colors duration-300 ${
          isDark ? 'bg-indigo-600' : 'bg-amber-400'
        }`}
      />
      
      {/* Sliding circle */}
      <span
        className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow-lg transform transition-transform duration-300 flex items-center justify-center ${
          isDark ? 'translate-x-7' : 'translate-x-0'
        }`}
      >
        {/* Icons with fade transition */}
        <Sun
          size={14}
          className={`absolute text-amber-500 transition-opacity duration-300 ${
            isDark ? 'opacity-0' : 'opacity-100'
          }`}
        />
        <Moon
          size={14}
          className={`absolute text-indigo-600 transition-opacity duration-300 ${
            isDark ? 'opacity-100' : 'opacity-0'
          }`}
        />
      </span>
    </button>
  );
}

export default ThemeToggle;

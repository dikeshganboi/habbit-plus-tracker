import { useState } from 'react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../firebase';

function AuthForm({ onAuth }) {
  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  const toggleMode = () => {
    setMode(mode === 'login' ? 'signup' : 'login');
    setError('');
    setInfo('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setInfo('');
    if (!email || !password) {
      setError('Email and password are required.');
      return;
    }
    setLoading(true);
    try {
      let userCredential;
      if (mode === 'signup') {
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
      } else {
        userCredential = await signInWithEmailAndPassword(auth, email, password);
      }
      onAuth?.(userCredential.user);
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    setError('');
    setInfo('');
    if (!email) {
      setError('Enter your email above first.');
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      setInfo('Password reset email sent. Check your inbox.');
    } catch (err) {
      setError(err.message || 'Failed to send reset email');
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setInfo('');
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      onAuth?.(result.user);
    } catch (err) {
      setError(err.message || 'Google sign-in failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black flex items-center justify-center px-3 sm:px-4 py-6">
      <div className="w-full max-w-md bg-gradient-to-b from-white to-gray-50 dark:from-zinc-900 dark:to-zinc-900/80 border-2 border-gray-300 dark:border-zinc-700 rounded-xl p-6 sm:p-8 shadow-[0_8px_32px_rgba(0,0,0,0.15)] dark:shadow-[0_8px_40px_rgba(0,0,0,0.4)]">
        <div className="flex items-center space-x-2 sm:space-x-3 mb-6">
          <img src="/logo.svg" alt="FocusLab Logo" className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg shadow-[0_2px_8px_rgba(99,102,241,0.4)]" />
          <h1 className="text-lg sm:text-xl font-black text-gray-900 dark:text-white tracking-wide">FocusLab</h1>
        </div>
        <h2 className="text-gray-900 dark:text-white text-base sm:text-lg font-semibold mb-4">
          {mode === 'login' ? 'Sign In to Your Account' : 'Create a New Account'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs sm:text-sm text-gray-700 dark:text-zinc-300 mb-1 font-bold" htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white dark:bg-zinc-800 border-2 border-gray-400 dark:border-zinc-600 rounded-md px-3 py-2.5 sm:py-2 text-sm sm:text-base text-gray-900 dark:text-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 font-medium shadow-inner"
              placeholder="you@example.com"
              autoComplete="email"
            />
          </div>
          <div>
            <label className="block text-xs sm:text-sm text-gray-700 dark:text-zinc-300 mb-1 font-bold" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white dark:bg-zinc-800 border-2 border-gray-400 dark:border-zinc-600 rounded-md px-3 py-2.5 sm:py-2 text-sm sm:text-base text-gray-900 dark:text-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 font-medium shadow-inner"
              placeholder="••••••••"
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            />
          </div>
          {error && (
            <div className="text-xs sm:text-sm text-red-500 bg-red-500/10 border-2 border-red-600 rounded-md px-3 py-2 font-semibold">
              {error}
            </div>
          )}
          {info && (
            <div className="text-xs sm:text-sm text-emerald-500 bg-emerald-500/10 border-2 border-emerald-600 rounded-md px-3 py-2 font-semibold">
              {info}
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center items-center space-x-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:pointer-events-none text-white font-black px-4 py-3 sm:py-2.5 rounded-md transition-colors text-sm sm:text-base shadow-[0_4px_12px_rgba(99,102,241,0.4)] hover:shadow-[0_6px_16px_rgba(99,102,241,0.5)] border-2 border-indigo-700"
          >
            <span>{loading ? (mode === 'login' ? 'Signing In...' : 'Creating...') : (mode === 'login' ? 'Sign In' : 'Sign Up')}</span>
          </button>
        </form>
        {/* Social Sign-in */}
        <div className="mt-4">
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-white dark:bg-zinc-800 border-2 border-gray-400 dark:border-zinc-600 rounded-md px-4 py-3 sm:py-2.5 text-sm sm:text-base font-semibold text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-zinc-700 transition-colors"
            aria-label="Sign in with Google"
          >
            <span>Continue with Google</span>
          </button>
        </div>
        <div className="mt-6 text-center">
          <button
            onClick={toggleMode}
            className="text-xs sm:text-sm text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            {mode === 'login' ? 'Need an account? Sign up' : 'Already have an account? Sign in'}
          </button>
          {mode === 'login' && (
            <div className="mt-3">
              <button
                onClick={handleReset}
                className="text-xs text-indigo-600 dark:text-indigo-500 hover:text-indigo-700 dark:hover:text-indigo-400"
                type="button"
              >
                Forgot password? Reset
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AuthForm;

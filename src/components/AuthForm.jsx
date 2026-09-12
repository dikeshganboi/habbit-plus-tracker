import { useState, useEffect } from 'react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail, GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult } from 'firebase/auth';
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
      // Fallback to redirect in environments where popup is blocked/not supported
      const fallbackCodes = [
        'auth/popup-blocked',
        'auth/popup-closed-by-user',
        'auth/operation-not-supported-in-this-environment',
        'auth/auth-domain-config-required'
      ];
      if (err?.code && fallbackCodes.includes(err.code)) {
        try {
          const provider = new GoogleAuthProvider();
          await signInWithRedirect(auth, provider);
          return; // Redirect will navigate away
        } catch (redirectErr) {
          setError(redirectErr.message || 'Google sign-in failed');
        }
      } else {
        setError(err.message || 'Google sign-in failed');
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle sign-in redirect result when returning to the app
  useEffect(() => {
    let mounted = true;
    getRedirectResult(auth)
      .then((result) => {
        if (!mounted) return;
        if (result?.user) {
          onAuth?.(result.user);
        }
      })
      .catch((err) => {
        if (!mounted) return;
        // Avoid noisy errors; show concise message
        if (err?.code && err.code !== 'auth/no-auth-event') {
          setError(err.message || 'Google sign-in failed');
        }
      });
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="app-shell min-h-screen flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md design-card p-6 sm:p-8 shadow-[0_20px_50px_rgba(37,43,75,0.12)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
        <div className="mb-6 flex items-center gap-3">
          <img src="/logo.svg" alt="FocusLab Logo" className="h-10 w-10" />
          <div className="leading-none">
            <span className="block text-xl font-bold tracking-tight text-gray-900 dark:text-white">Focus<span className="text-indigo-600 dark:text-indigo-400">Lab</span></span>
            <span className="mt-1 block text-[9px] font-medium uppercase tracking-[0.2em] text-gray-500 dark:text-zinc-400">Build a better you</span>
          </div>
        </div>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-indigo-600 dark:text-indigo-300 mb-2">Welcome back</p>
        <h2 className="text-gray-900 dark:text-white text-2xl font-extrabold tracking-tight mb-6">
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
              className="w-full bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-600 rounded-lg px-3 py-3 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 font-medium"
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
              className="w-full bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-600 rounded-lg px-3 py-3 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 font-medium"
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
            className="primary-button w-full flex justify-center items-center space-x-2 disabled:opacity-50 disabled:pointer-events-none font-bold px-4 py-3 text-sm"
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
            className="soft-button w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold"
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

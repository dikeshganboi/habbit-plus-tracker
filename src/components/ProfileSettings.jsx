import { useState, useEffect } from 'react';
import { updateProfile } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { Crown, Calendar, CreditCard, CheckCircle2, XCircle, Clock, Ticket } from 'lucide-react';

function ProfileSettings({ user, onUserUpdated }) {
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [subscription, setSubscription] = useState(null);
  const [loadingSubscription, setLoadingSubscription] = useState(true);

  useEffect(() => {
    fetchSubscription();
  }, [user]);

  const fetchSubscription = async () => {
    if (!user?.uid) return;
    
    setLoadingSubscription(true);
    try {
      const subRef = doc(db, 'users', user.uid, 'subscription', 'status');
      const subDoc = await getDoc(subRef);
      
      if (subDoc.exists()) {
        const data = subDoc.data();
        const expiryDate = data.expiryDate?.toDate();
        const paymentDate = data.paymentDate?.toDate();
        const isActive = expiryDate && expiryDate > new Date();
        const daysRemaining = isActive ? Math.ceil((expiryDate - new Date()) / (1000 * 60 * 60 * 24)) : 0;
        
        setSubscription({
          isActive,
          expiryDate,
          paymentDate,
          transactionId: data.transactionId,
          amount: data.amount,
          currency: data.currency,
          usedCoupon: data.usedCoupon || false,
          couponUsed: data.couponUsed,
          daysRemaining
        });
      } else {
        setSubscription({ isActive: false });
      }
    } catch (err) {
      console.error('Error fetching subscription:', err);
      setSubscription({ isActive: false });
    } finally {
      setLoadingSubscription(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return date.toLocaleDateString('en-IN', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    setInfo('');
    if (!auth.currentUser) {
      setError('No authenticated user.');
      return;
    }
    setSaving(true);
    try {
      await updateProfile(auth.currentUser, { displayName: displayName.trim() || null });
      onUserUpdated?.(auth.currentUser);
      setInfo('Profile updated successfully.');
    } catch (err) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white mb-2 tracking-wide">Account Settings</h2>
        <p className="text-sm sm:text-base text-gray-600 dark:text-zinc-400 font-semibold">Manage your profile and subscription</p>
      </div>

      {/* Subscription Details Card */}
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 border-2 border-indigo-300 dark:border-indigo-700 rounded-xl sm:rounded-2xl p-6 sm:p-8 shadow-[0_4px_20px_rgba(99,102,241,0.2)] dark:shadow-[0_4px_24px_rgba(99,102,241,0.3)]">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-[0_4px_12px_rgba(99,102,241,0.4)]">
            <Crown className="w-6 h-6 text-white drop-shadow-md" />
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white tracking-wide">Subscription Status</h3>
            <p className="text-sm text-gray-600 dark:text-zinc-400 font-semibold">Your premium membership details</p>
          </div>
        </div>

        {loadingSubscription ? (
          <div className="text-center py-8">
            <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-gray-600 dark:text-zinc-400 font-semibold">Loading subscription...</p>
          </div>
        ) : subscription?.isActive ? (
          <div className="space-y-4">
            {/* Active Status Banner */}
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-8 h-8 text-white drop-shadow-md" strokeWidth={2.5} />
                <div>
                  <p className="text-white font-black text-lg">Active Premium Member</p>
                  <p className="text-green-100 text-sm font-semibold">All features unlocked</p>
                </div>
              </div>
              <div className="hidden sm:block">
                <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/30">
                  <p className="text-white font-black text-2xl">{subscription.daysRemaining}</p>
                  <p className="text-green-100 text-xs font-bold">Days Left</p>
                </div>
              </div>
            </div>

            {/* Subscription Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Payment Date */}
              <div className="bg-white dark:bg-zinc-900 border-2 border-gray-300 dark:border-zinc-700 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <p className="text-sm font-bold text-gray-600 dark:text-zinc-400">Activated On</p>
                </div>
                <p className="text-lg font-black text-gray-900 dark:text-white ml-13">{formatDate(subscription.paymentDate)}</p>
              </div>

              {/* Expiry Date */}
              <div className="bg-white dark:bg-zinc-900 border-2 border-gray-300 dark:border-zinc-700 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                    <Clock className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                  </div>
                  <p className="text-sm font-bold text-gray-600 dark:text-zinc-400">Valid Until</p>
                </div>
                <p className="text-lg font-black text-gray-900 dark:text-white ml-13">{formatDate(subscription.expiryDate)}</p>
              </div>

              {/* Payment Method */}
              <div className="bg-white dark:bg-zinc-900 border-2 border-gray-300 dark:border-zinc-700 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                    {subscription.amount === 0 ? (
                      <Ticket className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    ) : (
                      <CreditCard className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    )}
                  </div>
                  <p className="text-sm font-bold text-gray-600 dark:text-zinc-400">Payment Method</p>
                </div>
                <p className="text-lg font-black text-gray-900 dark:text-white ml-13">
                  {subscription.amount === 0 ? 'Coupon Code' : 'Online Payment'}
                </p>
              </div>

              {/* Amount Paid */}
              <div className="bg-white dark:bg-zinc-900 border-2 border-gray-300 dark:border-zinc-700 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <p className="text-sm font-bold text-gray-600 dark:text-zinc-400">Amount Paid</p>
                </div>
                <p className="text-lg font-black text-gray-900 dark:text-white ml-13">
                  {subscription.amount === 0 ? (
                    <span className="text-green-600 dark:text-green-400">FREE (Coupon)</span>
                  ) : (
                    `₹${subscription.amount}`
                  )}
                </p>
              </div>
            </div>

            {/* Transaction Details */}
            {subscription.transactionId && (
              <div className="bg-white dark:bg-zinc-900 border-2 border-gray-300 dark:border-zinc-700 rounded-xl p-4">
                <p className="text-sm font-bold text-gray-600 dark:text-zinc-400 mb-2">Transaction ID</p>
                <p className="text-xs font-mono text-gray-900 dark:text-white bg-gray-100 dark:bg-zinc-800 px-3 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 break-all">
                  {subscription.transactionId}
                </p>
              </div>
            )}

            {/* Coupon Info */}
            {subscription.usedCoupon && subscription.couponUsed && (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-300 dark:border-green-700 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <Ticket className="w-6 h-6 text-green-600 dark:text-green-400" />
                  <div>
                    <p className="text-sm font-bold text-gray-700 dark:text-zinc-300">Coupon Applied</p>
                    <p className="text-lg font-black text-green-600 dark:text-green-400">{subscription.couponUsed}</p>
                  </div>
                </div>
                <p className="text-xs text-gray-600 dark:text-zinc-400 font-semibold mt-2">
                  ✓ You have used your one-time coupon. After expiry, payment will be required.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {/* Inactive Status Banner */}
            <div className="bg-gradient-to-r from-gray-500 to-gray-600 dark:from-zinc-700 dark:to-zinc-800 rounded-xl p-4 flex items-center gap-3">
              <XCircle className="w-8 h-8 text-white drop-shadow-md" strokeWidth={2.5} />
              <div>
                <p className="text-white font-black text-lg">No Active Subscription</p>
                <p className="text-gray-200 text-sm font-semibold">Subscribe to unlock premium features</p>
              </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 border-2 border-gray-300 dark:border-zinc-700 rounded-xl p-6 text-center">
              <p className="text-gray-600 dark:text-zinc-400 font-semibold mb-4">
                Access will be restricted until you subscribe
              </p>
              <div className="inline-flex items-center gap-2 text-sm font-bold text-indigo-600 dark:text-indigo-400">
                <Crown className="w-5 h-5" />
                <span>Subscribe for just ₹10/month</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Profile Settings Card */}
      <div className="bg-gradient-to-b from-white to-gray-50 dark:from-zinc-900 dark:to-zinc-900/80 border-2 border-gray-300 dark:border-zinc-700 rounded-xl sm:rounded-2xl p-6 sm:p-8 space-y-6 shadow-[0_4px_16px_rgba(0,0,0,0.1)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
        <div>
          <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2 tracking-wide">Profile Information</h3>
          <p className="text-sm text-gray-600 dark:text-zinc-400 font-semibold">Update your personal details</p>
        </div>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-700 dark:text-zinc-300 mb-1 font-bold" htmlFor="email">Email (read-only)</label>
            <input
              id="email"
              type="email"
              value={user?.email || ''}
              disabled
              className="w-full bg-gray-200 dark:bg-zinc-800 border-2 border-gray-400 dark:border-zinc-600 rounded-md px-3 py-2 text-gray-500 dark:text-zinc-400 cursor-not-allowed font-medium shadow-inner"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-700 dark:text-zinc-300 mb-1 font-bold" htmlFor="displayName">Display Name</label>
            <input
              id="displayName"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your name"
              className="w-full bg-white dark:bg-zinc-800 border-2 border-gray-400 dark:border-zinc-600 rounded-md px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 font-medium shadow-inner"
            />
          </div>
          {error && (
            <div className="text-sm text-red-500 bg-red-500/10 border-2 border-red-600 rounded-md px-3 py-2 font-semibold">{error}</div>
          )}
          {info && (
            <div className="text-sm text-emerald-500 bg-emerald-500/10 border-2 border-emerald-600 rounded-md px-3 py-2 font-semibold">{info}</div>
          )}
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center px-4 py-2 rounded-md bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-sm font-black disabled:opacity-50 shadow-[0_4px_12px_rgba(99,102,241,0.4)] hover:shadow-[0_6px_16px_rgba(99,102,241,0.5)] border-2 border-indigo-700"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ProfileSettings;

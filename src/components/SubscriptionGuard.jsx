import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Lock, Crown, CheckCircle2, X } from 'lucide-react';

function SubscriptionGuard({ userId, children }) {
  const [subscriptionStatus, setSubscriptionStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState('');
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  useEffect(() => {
    checkSubscription();
  }, [userId]);

  const checkSubscription = async () => {
    if (!userId) return;
    
    try {
      const userRef = doc(db, 'users', userId, 'subscription', 'status');
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        const data = userDoc.data();
        const expiryDate = data.expiryDate?.toDate();
        const isActive = expiryDate && expiryDate > new Date();
        
        setSubscriptionStatus({
          isActive,
          expiryDate,
          paymentDate: data.paymentDate?.toDate(),
          transactionId: data.transactionId,
          usedCoupon: data.usedCoupon || false
        });
      } else {
        setSubscriptionStatus({ isActive: false, usedCoupon: false });
      }
    } catch (error) {
      console.error('Error checking subscription:', error);
      setSubscriptionStatus({ isActive: false, usedCoupon: false });
    } finally {
      setLoading(false);
    }
  };

  const handleCouponApply = async () => {
    if (!couponCode.trim()) {
      setCouponError('Please enter a coupon code');
      return;
    }

    // Check if user already used a coupon
    if (subscriptionStatus?.usedCoupon) {
      setCouponError('You have already used a coupon. Only one coupon per user allowed.');
      return;
    }

    setApplyingCoupon(true);
    setCouponError('');

    try {
      // Valid coupon code: 10get0
      if (couponCode.toUpperCase() === '10GET0') {
        // Grant 1 month free access
        const expiryDate = new Date();
        expiryDate.setMonth(expiryDate.getMonth() + 1); // 1 month free

        await setDoc(doc(db, 'users', userId, 'subscription', 'status'), {
          isActive: true,
          paymentDate: new Date(),
          expiryDate: expiryDate,
          transactionId: 'COUPON_10GET0',
          amount: 0,
          currency: 'INR',
          couponUsed: '10GET0',
          usedCoupon: true
        });

        // Update local state
        setSubscriptionStatus({
          isActive: true,
          expiryDate,
          paymentDate: new Date(),
          transactionId: 'COUPON_10GET0',
          usedCoupon: true
        });

        alert('🎉 Coupon applied successfully! You have 1 month free access!');
      } else {
        setCouponError('Invalid coupon code. Try: 10GET0');
      }
    } catch (error) {
      console.error('Error applying coupon:', error);
      setCouponError('Error applying coupon. Please try again.');
    } finally {
      setApplyingCoupon(false);
    }
  };

  const handlePayment = async () => {
    setProcessing(true);
    
    // Load Razorpay script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);

    script.onload = () => {
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: 1000, // Amount in paise (10 Rs = 1000 paise)
        currency: 'INR',
        name: 'Habbit+ Task Tracker',
        description: 'Monthly Subscription',
        image: '/logo.svg',
        handler: async function (response) {
          try {
            // Save subscription to Firestore
            const expiryDate = new Date();
            expiryDate.setMonth(expiryDate.getMonth() + 1); // 1 month subscription

            await setDoc(doc(db, 'users', userId, 'subscription', 'status'), {
              isActive: true,
              paymentDate: new Date(),
              expiryDate: expiryDate,
              transactionId: response.razorpay_payment_id,
              amount: 10,
              currency: 'INR'
            });

            // Update local state
            setSubscriptionStatus({
              isActive: true,
              expiryDate,
              paymentDate: new Date(),
              transactionId: response.razorpay_payment_id
            });

            setShowPaymentModal(false);
            alert('Payment successful! Welcome to Habbit+ Premium 🎉');
          } catch (error) {
            console.error('Error saving subscription:', error);
            alert('Payment successful but error saving subscription. Please contact support.');
          } finally {
            setProcessing(false);
          }
        },
        prefill: {
          email: userId // You can use user's email if available
        },
        notes: {
          userId: userId,
          plan: 'monthly'
        },
        theme: {
          color: '#6366f1'
        },
        modal: {
          ondismiss: function() {
            setProcessing(false);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    };

    script.onerror = () => {
      alert('Failed to load payment gateway. Please try again.');
      setProcessing(false);
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-zinc-400 font-semibold">Checking subscription...</p>
        </div>
      </div>
    );
  }

  // If subscription is active, show the app
  if (subscriptionStatus?.isActive) {
    return <>{children}</>;
  }

  // Show subscription required screen
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-zinc-950 dark:to-indigo-950 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Subscription Card */}
        <div className="bg-white dark:bg-zinc-900 border-2 border-indigo-300 dark:border-indigo-700 rounded-2xl shadow-[0_8px_30px_rgba(99,102,241,0.3)] overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-900 dark:to-purple-900 p-8 text-center">
            <Crown className="w-16 h-16 text-yellow-300 mx-auto mb-4 drop-shadow-lg" />
            <h1 className="text-3xl sm:text-4xl font-black text-white mb-2">Unlock Premium Features</h1>
            <p className="text-indigo-100 dark:text-indigo-200 text-lg font-semibold">Get full access to Habbit+ Task Tracker</p>
          </div>

          {/* Content */}
          <div className="p-8">
            {/* Price */}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="text-5xl font-black text-gray-900 dark:text-white">₹10</span>
                <span className="text-xl text-gray-600 dark:text-zinc-400 font-bold">/month</span>
              </div>
              <p className="text-sm text-gray-500 dark:text-zinc-500 font-semibold">Billed monthly</p>
            </div>

            {/* Features */}
            <div className="space-y-4 mb-8">
              <h3 className="text-xl font-black text-gray-900 dark:text-white mb-4">Premium Features:</h3>
              {[
                'Unlimited Habit Tracking',
                'Advanced Analytics & Reports',
                'AI Habit Coach',
                'XP & Gamification System',
                'Mood Tracking',
                'Priority Support',
                'Dark Mode',
                'Cloud Sync Across Devices'
              ].map((feature, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" strokeWidth={3} />
                  </div>
                  <span className="text-gray-700 dark:text-zinc-300 font-semibold">{feature}</span>
                </div>
              ))}
            </div>

            {/* Coupon Section */}
            <div className="mb-6 p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-300 dark:border-green-700 rounded-xl">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-black text-gray-900 dark:text-white">🎁 Have a Coupon Code?</h4>
                {!subscriptionStatus?.usedCoupon && (
                  <span className="text-xs font-bold text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded">
                    Try: 10GET0
                  </span>
                )}
              </div>
              
              {subscriptionStatus?.usedCoupon ? (
                <p className="text-xs text-gray-600 dark:text-zinc-400 font-semibold">
                  ✓ You have already used your one-time coupon
                </p>
              ) : (
                <>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Enter coupon code"
                      value={couponCode}
                      onChange={(e) => {
                        setCouponCode(e.target.value.toUpperCase());
                        setCouponError('');
                      }}
                      disabled={applyingCoupon}
                      className="flex-1 px-3 py-2 border-2 border-gray-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-gray-900 dark:text-white font-bold text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:opacity-50"
                    />
                    <button
                      onClick={handleCouponApply}
                      disabled={applyingCoupon || !couponCode.trim()}
                      className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white font-bold text-sm rounded-lg transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                    >
                      {applyingCoupon ? 'Applying...' : 'Apply'}
                    </button>
                  </div>
                  {couponError && (
                    <p className="text-xs text-red-600 dark:text-red-400 font-semibold mt-2">
                      {couponError}
                    </p>
                  )}
                  <p className="text-xs text-gray-600 dark:text-zinc-400 font-semibold mt-2">
                    💡 Get 1 month FREE with coupon code (One-time use only)
                  </p>
                </>
              )}
            </div>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t-2 border-gray-200 dark:border-zinc-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-3 bg-white dark:bg-zinc-900 text-gray-500 dark:text-zinc-400 font-bold">
                  OR
                </span>
              </div>
            </div>

            {/* Payment Button */}
            <button
              onClick={() => setShowPaymentModal(true)}
              disabled={processing}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-black text-lg py-4 rounded-xl shadow-[0_4px_16px_rgba(99,102,241,0.4)] hover:shadow-[0_6px_20px_rgba(99,102,241,0.5)] transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {processing ? 'Processing...' : 'Subscribe Now'}
            </button>

            {/* UPI Info */}
            <div className="mt-6 p-4 bg-indigo-50 dark:bg-indigo-900/20 border-2 border-indigo-200 dark:border-indigo-800 rounded-lg">
              <p className="text-sm text-center text-gray-700 dark:text-zinc-300 font-semibold">
                💳 Pay with UPI, Cards, Net Banking & More
              </p>
            </div>

            {/* Trust Badge */}
            <div className="mt-6 text-center">
              <p className="text-xs text-gray-500 dark:text-zinc-500 font-semibold">
                🔒 Secure payment powered by Razorpay
              </p>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <p className="text-center mt-6 text-sm text-gray-600 dark:text-zinc-400 font-semibold">
          Cancel anytime • Full refund if not satisfied
        </p>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-zinc-900 border-2 border-gray-300 dark:border-zinc-700 rounded-2xl max-w-md w-full p-6 shadow-[0_8px_30px_rgba(0,0,0,0.4)]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-black text-gray-900 dark:text-white">Confirm Payment</h3>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="w-8 h-8 bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 rounded-lg flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5 text-gray-600 dark:text-zinc-400" />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div className="p-4 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border-2 border-indigo-200 dark:border-indigo-800 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-bold text-gray-700 dark:text-zinc-300">Subscription Plan</span>
                  <span className="text-sm font-black text-gray-900 dark:text-white">Monthly</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-gray-700 dark:text-zinc-300">Amount</span>
                  <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">₹10</span>
                </div>
              </div>

              <div className="text-sm text-gray-600 dark:text-zinc-400 font-semibold space-y-2">
                <p>✓ Access to all premium features</p>
                <p>✓ Valid for 30 days</p>
                <p>✓ Auto-renewal can be disabled</p>
              </div>
            </div>

            <button
              onClick={handlePayment}
              disabled={processing}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-black py-3 rounded-xl shadow-[0_4px_12px_rgba(99,102,241,0.4)] transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {processing ? 'Opening Payment Gateway...' : 'Proceed to Payment'}
            </button>

            <p className="text-xs text-center text-gray-500 dark:text-zinc-500 mt-4 font-semibold">
              Clicking will open Razorpay payment gateway
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default SubscriptionGuard;

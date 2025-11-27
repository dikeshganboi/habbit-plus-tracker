# Payment Integration Setup Guide

## Overview

Your Habbit+ Task Tracker now has subscription-based access with Razorpay payment integration for ₹10/month.

## How It Works

### User Flow

1. User signs up/logs in
2. Subscription check happens automatically
3. If no active subscription → Payment screen is shown
4. User pays ₹10 via Razorpay (UPI/Cards/Net Banking)
5. After successful payment → Access granted for 30 days
6. Subscription stored in Firebase Firestore

### Features

- ✅ Razorpay Integration (UPI, Cards, Net Banking, Wallets)
- ✅ Automatic subscription verification
- ✅ 30-day access after payment
- ✅ Beautiful payment UI
- ✅ Secure transaction handling
- ✅ Firebase Firestore storage

---

## Setup Instructions

### Step 1: Create Razorpay Account

1. Go to [https://razorpay.com](https://razorpay.com)
2. Click **Sign Up** (Free account)
3. Complete KYC verification with:
   - PAN Card
   - Bank Account Details (where you want to receive payments)
   - Business/Personal details

### Step 2: Get Your Razorpay Keys

1. After login, go to **Settings** → **API Keys**
2. Generate API Keys (Test Mode for testing, Live Mode for production)
3. Copy your **Key ID** (starts with `rzp_test_` or `rzp_live_`)
4. **IMPORTANT**: Keep the Key Secret safe (never share it)

### Step 3: Update Your Code

Open `src/components/SubscriptionGuard.jsx` and find this line (around line 50):

```javascript
key: 'YOUR_RAZORPAY_KEY_ID', // Replace with your Razorpay Key ID
```

Replace `YOUR_RAZORPAY_KEY_ID` with your actual Razorpay Key ID:

```javascript
key: 'rzp_test_1234567890ABC', // Your actual Key ID
```

### Step 4: Configure Your Bank Account in Razorpay

1. Go to Razorpay Dashboard → **Settings** → **Settlements**
2. Add your bank account details:
   - Account Number
   - IFSC Code
   - Account Holder Name
3. Complete verification (usually instant for major banks)

### Step 5: Enable UPI Payments

1. In Razorpay Dashboard → **Settings** → **Payment Methods**
2. Enable:
   - ✅ UPI
   - ✅ Cards (Debit/Credit)
   - ✅ Net Banking
   - ✅ Wallets (Paytm, PhonePe, etc.)

---

## Testing Payment Flow

### Test Mode (Before Going Live)

1. Use Test Mode Key ID (`rzp_test_...`)
2. Razorpay provides test cards and UPI IDs:
   - **Test UPI ID**: `success@razorpay`
   - **Test Card**: 4111 1111 1111 1111 (any CVV, future expiry)
3. No real money is charged in Test Mode
4. Test the complete flow:
   - Sign up → Payment screen → Test payment → Access granted

### Live Mode (Production)

1. Complete KYC verification on Razorpay
2. Switch to Live Mode Key ID (`rzp_live_...`)
3. Update the code with Live Key ID
4. Real payments will be processed
5. Money will be settled to your bank account in 2-3 business days

---

## Firebase Firestore Structure

Subscription data is stored at:

```
users/
  └── {userId}/
      └── subscription/
          └── status/
              ├── isActive: true/false
              ├── paymentDate: timestamp
              ├── expiryDate: timestamp (30 days from payment)
              ├── transactionId: "pay_xxx" or "COUPON_10GET0"
              ├── amount: 10 (or 0 for coupon)
              ├── currency: "INR"
              ├── usedCoupon: true/false
              └── couponUsed: "10GET0" (if coupon was used)
```

---

## Coupon System

### How It Works

- **Coupon Code**: `10GET0` (case-insensitive)
- **Benefit**: 1 month FREE access
- **Usage**: One-time per user only
- **Expiry**: After 30 days, user must pay to continue

### Coupon Features

1. ✅ Users can apply coupon code on subscription screen
2. ✅ Coupon is valid once per user (tracked in Firebase)
3. ✅ After using coupon, user cannot use another coupon
4. ✅ After 1 month expires, user must pay ₹10 to continue
5. ✅ Coupon usage is stored in Firestore

### Add More Coupons

To add additional coupon codes, edit `src/components/SubscriptionGuard.jsx`:

```javascript
// Around line 60, in handleCouponApply function
if (couponCode.toUpperCase() === "10GET0") {
  // Grant 1 month free access
} else if (couponCode.toUpperCase() === "NEWYEAR25") {
  // Add new coupon logic here
} else {
  setCouponError("Invalid coupon code");
}
```

### Disable Coupon System

To remove coupon feature:

1. Open `src/components/SubscriptionGuard.jsx`
2. Remove the coupon section (search for "Have a Coupon Code?")
3. Remove coupon state variables and handler function

---

## Payment Amount

Current subscription price: **₹10/month**

To change the price:

1. Open `src/components/SubscriptionGuard.jsx`
2. Find line 51:
   ```javascript
   amount: 1000, // Amount in paise (10 Rs = 1000 paise)
   ```
3. Change to your desired amount (in paise):

   - ₹10 = 1000 paise
   - ₹50 = 5000 paise
   - ₹100 = 10000 paise

4. Also update the display price in the UI (around line 140):
   ```javascript
   <span className="text-5xl font-black text-gray-900 dark:text-white">
     ₹10
   </span>
   ```

---

## Security Best Practices

### ✅ DO:

- Keep your Razorpay Key Secret secure (never commit to Git)
- Use environment variables for API keys in production
- Enable webhook signature verification for production
- Monitor transactions in Razorpay Dashboard

### ❌ DON'T:

- Don't share your Key Secret publicly
- Don't hardcode credentials in client-side code (Key ID is safe)
- Don't skip KYC verification
- Don't accept payments before Razorpay account activation

---

## Money Settlement

### How You Receive Payments

1. User pays ₹10 via Razorpay
2. Razorpay holds the amount
3. After T+2 days (2 business days), money is settled to your bank account
4. You can see all settlements in Razorpay Dashboard → **Settlements**

### Transaction Fees

Razorpay charges a small fee per transaction:

- **2% + ₹0** for most payment methods
- For ₹10 payment, you receive approximately ₹9.80

---

## Monitoring & Support

### Check Payments

- Razorpay Dashboard → **Transactions**
- See all successful/failed payments
- Download reports for accounting

### User Subscription Check

- Firebase Console → Firestore Database
- Navigate to: `users/{userId}/subscription/status`
- See active subscriptions

### Support Resources

- Razorpay Docs: [https://razorpay.com/docs](https://razorpay.com/docs)
- Razorpay Support: support@razorpay.com
- Integration Help: [https://razorpay.com/docs/payments/payment-gateway/web-integration/standard](https://razorpay.com/docs/payments/payment-gateway/web-integration/standard)

---

## Troubleshooting

### Payment Gateway Not Opening

- Check if Razorpay script is loaded (`https://checkout.razorpay.com/v1/checkout.js`)
- Verify Key ID is correct
- Check browser console for errors

### Payment Successful but Subscription Not Active

- Check Firebase Firestore rules (ensure write permission)
- Verify userId is correct
- Check browser console for error messages

### Settlement Not Received

- Wait for T+2 business days
- Verify bank account details in Razorpay
- Check Razorpay Dashboard → Settlements

---

## Next Steps

1. ✅ Create Razorpay account
2. ✅ Complete KYC verification
3. ✅ Add bank account details
4. ✅ Get API Keys
5. ✅ Update code with your Key ID
6. ✅ Test in Test Mode
7. ✅ Switch to Live Mode for production

---

## Important Notes

- Subscription is valid for 30 days from payment date
- After expiry, users must pay again to continue using the app
- You can track all subscriptions in Firebase Firestore
- All transactions are secure and PCI-DSS compliant via Razorpay
- Users can pay with UPI (PhonePe, Google Pay, Paytm), Cards, Net Banking

---

## Contact

For integration issues, contact Razorpay support or check their comprehensive documentation.

**Happy Earning! 💰**

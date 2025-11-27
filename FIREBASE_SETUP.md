# Firebase Setup Instructions

## Complete Firebase Configuration Guide

### Step 1: Create Firebase Project

1. **Visit Firebase Console**

   - Go to: https://console.firebase.google.com/
   - Sign in with your Google account

2. **Create New Project**

   - Click "Add project" or "Create a project"
   - Enter project name: `FocusLab` (or your preferred name)
   - Click "Continue"

3. **Google Analytics (Optional)**

   - Toggle off "Enable Google Analytics" (not needed for this app)
   - Or keep it on if you want analytics
   - Click "Create project"

4. **Wait for Setup**
   - Firebase will set up your project (takes ~30 seconds)
   - Click "Continue" when ready

---

### Step 2: Enable Anonymous Authentication

1. **Navigate to Authentication**

   - In the left sidebar, click "Authentication"
   - Click "Get started" button

2. **Enable Anonymous Sign-in**
   - Click on the "Sign-in method" tab at the top
   - Find "Anonymous" in the list of providers
   - Click on "Anonymous" row
   - Toggle the "Enable" switch to ON
   - Click "Save"

**Why Anonymous Auth?**

- Users can start immediately without signup
- Firebase automatically creates unique user IDs
- Data remains isolated per user
- No email/password management needed

---

### Step 3: Create Firestore Database

1. **Navigate to Firestore**

   - In the left sidebar, click "Firestore Database"
   - Click "Create database" button

2. **Choose Security Mode**

   - Select "Start in test mode" (for development)
   - **Note**: Test mode allows read/write for 30 days
   - Click "Next"

   **Test Mode Rules** (automatically applied):

   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /{document=**} {
         allow read, write: if request.time < timestamp.date(2024, 12, 22);
       }
     }
   }
   ```

3. **Select Location**

   - Choose the closest location to your users:
     - `us-central1` (Iowa) - North America
     - `europe-west1` (Belgium) - Europe
     - `asia-south1` (Mumbai) - Asia
   - **Important**: Location cannot be changed later
   - Click "Enable"

4. **Wait for Database Creation**
   - Takes ~1 minute to provision
   - You'll see an empty database screen when ready

---

### Step 4: Get Firebase Configuration

1. **Open Project Settings**

   - Click the ⚙️ gear icon next to "Project Overview"
   - Select "Project settings"

2. **Add Web App**

   - Scroll down to "Your apps" section
   - Click the web icon `</>` (looks like this: `</>`
   - Register app:
     - App nickname: `FocusLab Web App`
     - **Do NOT** check "Firebase Hosting" (unless you want to use it)
   - Click "Register app"

3. **Copy Configuration**

   - You'll see a code snippet like this:

   ```javascript
   const firebaseConfig = {
     apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
     authDomain: "focuslab-xxxxx.firebaseapp.com",
     projectId: "focuslab-xxxxx",
     storageBucket: "focuslab-xxxxx.appspot.com",
     messagingSenderId: "123456789012",
     appId: "1:123456789012:web:abcdef123456",
   };
   ```

4. **Copy Each Value**
   - Copy ONLY the values (not the keys)
   - We'll use these in the `.env` file

---

### Step 5: Configure Environment Variables

1. **Create `.env` File**

   ```powershell
   copy .env.example .env
   ```

2. **Open `.env` in VS Code**

   ```powershell
   code .env
   ```

3. **Paste Your Firebase Config**

   Replace the placeholder values with YOUR actual values from Firebase:

   ```env
   # Firebase Configuration
   VITE_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
   VITE_FIREBASE_AUTH_DOMAIN=focuslab-xxxxx.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=focuslab-xxxxx
   VITE_FIREBASE_STORAGE_BUCKET=focuslab-xxxxx.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
   VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef123456
   ```

   **Important Notes:**

   - Keep the `VITE_` prefix (required by Vite)
   - No spaces around `=`
   - No quotes around values
   - Save the file

---

### Step 6: Verify Setup

1. **Start the App**

   ```powershell
   npm run dev
   ```

2. **Check Browser Console**

   - Open DevTools (F12)
   - Go to Console tab
   - You should NOT see any Firebase errors
   - Look for successful authentication

3. **Test Anonymous Login**

   - The app should load immediately
   - You'll see "Active" indicator in header (green dot)

4. **Verify in Firebase Console**

   - Go back to Firebase Console
   - Click "Authentication"
   - Go to "Users" tab
   - You should see 1 anonymous user appear

5. **Test Database Writes**
   - Add a habit in the app
   - Go to Firebase Console → Firestore Database
   - You should see:
     ```
     users/
       └── {some-user-id}/
           └── habits/
               └── {habit-id}
     ```

---

### Step 7: Set Up Production Security Rules (Optional)

**For Production Deployment**, update your Firestore rules:

1. **Go to Firestore Database**

   - Click "Rules" tab at the top

2. **Replace Rules with This:**

   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       // Users can only access their own data
       match /users/{userId}/{document=**} {
         allow read, write: if request.auth != null
                           && request.auth.uid == userId;
       }
     }
   }
   ```

3. **Click "Publish"**
   - Rules take effect immediately
   - Now users can only read/write their own data

**What These Rules Do:**

- ✅ Authenticated users only
- ✅ Users can only access `users/{their-uid}/...`
- ✅ Complete data isolation
- ❌ No public read/write access

---

### Common Issues & Solutions

#### Issue: "Firebase: Error (auth/api-key-not-valid)"

**Solution:**

- Check `VITE_FIREBASE_API_KEY` in `.env`
- Verify no extra spaces or quotes
- Restart dev server after changing `.env`

#### Issue: "Missing or insufficient permissions"

**Solution:**

- Check Firestore is in "Test mode"
- Or verify production rules allow your user
- Check user is authenticated (green dot in header)

#### Issue: "VITE_FIREBASE_API_KEY is undefined"

**Solution:**

- Ensure `.env` file exists in root directory
- Check variable names start with `VITE_`
- Restart dev server (`Ctrl+C` then `npm run dev`)

#### Issue: Data not appearing in Firestore

**Solution:**

- Check browser console for errors
- Verify Firestore Database is created
- Ensure user is authenticated
- Check test mode expiration date

---

### Environment Variables Explanation

| Variable                            | Description                 | Example                   |
| ----------------------------------- | --------------------------- | ------------------------- |
| `VITE_FIREBASE_API_KEY`             | Public API key for Firebase | `AIzaSy...`               |
| `VITE_FIREBASE_AUTH_DOMAIN`         | Authentication domain       | `project.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID`          | Unique project identifier   | `focuslab-abc123`         |
| `VITE_FIREBASE_STORAGE_BUCKET`      | Cloud storage bucket        | `project.appspot.com`     |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Cloud messaging ID          | `123456789`               |
| `VITE_FIREBASE_APP_ID`              | Web app identifier          | `1:123:web:abc`           |

**Note**: These are safe to expose in frontend code. Firebase uses security rules to protect data.

---

### Testing Checklist

- [ ] Firebase project created
- [ ] Anonymous authentication enabled
- [ ] Firestore database created in test mode
- [ ] Web app registered in Firebase
- [ ] `.env` file created with all 6 variables
- [ ] Dev server restarted after `.env` creation
- [ ] App loads without errors
- [ ] Anonymous user appears in Authentication tab
- [ ] Can add habits and tasks
- [ ] Data appears in Firestore Database
- [ ] Production security rules published (if deploying)

---

### Next Steps

Once Firebase is configured:

1. ✅ Run `npm run dev`
2. ✅ Test all features
3. ✅ Deploy to production (Vercel/Netlify)
4. ✅ Update security rules for production

---

**Need More Help?**

- Firebase Docs: https://firebase.google.com/docs/web/setup
- Firebase Console: https://console.firebase.google.com/
- Firestore Security Rules: https://firebase.google.com/docs/firestore/security/get-started

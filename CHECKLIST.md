# FocusLab - Setup & Deployment Checklist

Use this checklist to track your progress from initial setup to production deployment.

---

## 📋 Phase 1: Initial Setup

### Environment Setup

- [ ] Node.js installed (v16 or higher)
- [ ] npm installed
- [ ] Code editor ready (VS Code recommended)
- [ ] Git installed (optional, for version control)

### Project Setup

- [ ] Navigate to project directory
- [ ] Run `npm install` to install dependencies
- [ ] Verify no installation errors

### Files Check

- [ ] All 21 files present:
  - [ ] package.json
  - [ ] vite.config.js
  - [ ] tailwind.config.js
  - [ ] postcss.config.js
  - [ ] index.html
  - [ ] .env.example
  - [ ] .gitignore
  - [ ] src/main.jsx
  - [ ] src/App.jsx
  - [ ] src/firebase.js
  - [ ] src/index.css
  - [ ] src/components/Dashboard.jsx
  - [ ] src/components/HabitTracker.jsx
  - [ ] src/components/TaskManager.jsx
  - [ ] README.md
  - [ ] QUICKSTART.md
  - [ ] FIREBASE_SETUP.md
  - [ ] DEPLOYMENT.md
  - [ ] ARCHITECTURE.md
  - [ ] PROJECT_SUMMARY.md
  - [ ] setup.ps1

---

## 🔥 Phase 2: Firebase Configuration

### Create Firebase Project

- [ ] Visited https://console.firebase.google.com/
- [ ] Signed in with Google account
- [ ] Clicked "Add project" or "Create a project"
- [ ] Named project (e.g., "FocusLab")
- [ ] Disabled Google Analytics (optional)
- [ ] Clicked "Create project"
- [ ] Waited for setup to complete

### Enable Authentication

- [ ] Opened "Authentication" from sidebar
- [ ] Clicked "Get started"
- [ ] Went to "Sign-in method" tab
- [ ] Found "Anonymous" provider
- [ ] Toggled "Enable" switch to ON
- [ ] Clicked "Save"
- [ ] Verified Anonymous is now "Enabled"

### Create Firestore Database

- [ ] Opened "Firestore Database" from sidebar
- [ ] Clicked "Create database"
- [ ] Selected "Start in test mode"
- [ ] Chose nearest location
- [ ] Clicked "Enable"
- [ ] Waited for database creation
- [ ] Verified empty database screen appears

### Get Firebase Config

- [ ] Clicked gear icon ⚙️ → "Project settings"
- [ ] Scrolled to "Your apps" section
- [ ] Clicked web icon `</>`
- [ ] Named app (e.g., "FocusLab Web App")
- [ ] Did NOT check "Firebase Hosting"
- [ ] Clicked "Register app"
- [ ] Copied configuration object
- [ ] Noted down all 6 values:
  - [ ] apiKey
  - [ ] authDomain
  - [ ] projectId
  - [ ] storageBucket
  - [ ] messagingSenderId
  - [ ] appId

---

## 🔧 Phase 3: Environment Configuration

### Create .env File

- [ ] Copied `.env.example` to `.env`
  ```powershell
  copy .env.example .env
  ```
- [ ] Opened `.env` in code editor

### Add Firebase Credentials

- [ ] Replaced `VITE_FIREBASE_API_KEY` with actual value
- [ ] Replaced `VITE_FIREBASE_AUTH_DOMAIN` with actual value
- [ ] Replaced `VITE_FIREBASE_PROJECT_ID` with actual value
- [ ] Replaced `VITE_FIREBASE_STORAGE_BUCKET` with actual value
- [ ] Replaced `VITE_FIREBASE_MESSAGING_SENDER_ID` with actual value
- [ ] Replaced `VITE_FIREBASE_APP_ID` with actual value
- [ ] Saved `.env` file
- [ ] Verified no spaces around `=` signs
- [ ] Verified no quotes around values
- [ ] Verified all values start with correct prefixes

---

## 🚀 Phase 4: Local Development

### Start Development Server

- [ ] Opened terminal in project directory
- [ ] Ran `npm run dev`
- [ ] Waited for server to start
- [ ] Verified "Local: http://localhost:3000" message
- [ ] Browser opened automatically (or manually opened URL)

### Initial Load Check

- [ ] App loaded without errors
- [ ] Saw "FocusLab" header
- [ ] Saw green "Active" indicator (dot)
- [ ] No red errors in browser console (F12)
- [ ] Dark theme displayed correctly

### Firebase Connection Test

- [ ] Opened browser DevTools (F12)
- [ ] Checked Console tab
- [ ] No Firebase authentication errors
- [ ] No "Firebase is not defined" errors

### Anonymous Auth Verification

- [ ] Opened Firebase Console
- [ ] Went to Authentication → Users tab
- [ ] Saw 1 anonymous user appear
- [ ] User ID displayed (long alphanumeric string)

---

## ✅ Phase 5: Feature Testing

### Dashboard Testing (Home Tab)

- [ ] Clicked "Home" tab
- [ ] Saw "Welcome to FocusLab" banner
- [ ] Saw "Daily Habits" card with 0%
- [ ] Saw "Tasks" card with 0%
- [ ] Saw motivational quote
- [ ] Saw 4 quick stat cards
- [ ] All cards have correct dark styling
- [ ] Progress bars display correctly

### Habit Tracker Testing

- [ ] Clicked "Habits" tab
- [ ] Saw "Add habit" form
- [ ] Entered habit name (e.g., "Morning Exercise")
- [ ] Clicked "Add" button
- [ ] Habit appeared in list below
- [ ] Saw weekly grid (Mon-Sun)
- [ ] Current date has blue ring indicator
- [ ] Clicked Monday button
- [ ] Button changed to gradient color
- [ ] Clicked Monday again
- [ ] Button returned to gray
- [ ] Refreshed page (F5)
- [ ] Habit still present with correct state

### Firestore Habit Data Verification

- [ ] Opened Firebase Console
- [ ] Went to Firestore Database
- [ ] Saw `users` collection
- [ ] Clicked user ID (your anonymous user)
- [ ] Saw `habits` collection
- [ ] Clicked habit document
- [ ] Verified fields:
  - [ ] title: "Morning Exercise"
  - [ ] completedDates: array with date if clicked
  - [ ] createdAt: timestamp

### Habit Streak Testing

- [ ] Marked today complete
- [ ] Saw "1 day streak" with fire emoji
- [ ] Marked yesterday complete (if possible)
- [ ] Streak counter increased
- [ ] Verified weekly completion percentage

### Task Manager Testing

- [ ] Clicked "Tasks" tab
- [ ] Saw task input form
- [ ] Priority dropdown shows High/Medium/Low
- [ ] Selected "High" priority
- [ ] Entered task text (e.g., "Complete project")
- [ ] Clicked "Add" button
- [ ] Task appeared with red badge
- [ ] Added "Medium" priority task
- [ ] Verified yellow badge
- [ ] Added "Low" priority task
- [ ] Verified green badge

### Task Completion Testing

- [ ] Clicked checkbox on a task
- [ ] Text got strikethrough
- [ ] Row became dimmed/transparent
- [ ] Task moved to bottom (if implemented)
- [ ] Clicked checkbox again
- [ ] Strikethrough removed
- [ ] Task returned to normal appearance

### Task Filtering Testing

- [ ] Marked some tasks complete
- [ ] Clicked "All" filter
- [ ] Saw all tasks
- [ ] Clicked "Active" filter
- [ ] Saw only incomplete tasks
- [ ] Clicked "Completed" filter
- [ ] Saw only completed tasks

### Firestore Task Data Verification

- [ ] Opened Firebase Console → Firestore
- [ ] Navigated to `users/{userId}/tasks`
- [ ] Clicked task document
- [ ] Verified fields:
  - [ ] text: task description
  - [ ] priority: "High"/"Medium"/"Low"
  - [ ] completed: true/false
  - [ ] createdAt: timestamp

### Delete Functionality Testing

- [ ] Clicked delete button on habit
- [ ] Habit removed from list
- [ ] Clicked delete button on task
- [ ] Task removed from list
- [ ] Refreshed page
- [ ] Deleted items did not reappear

---

## 📊 Phase 6: Dashboard Data Integration

### Return to Dashboard

- [ ] Clicked "Home" tab
- [ ] Habits progress updated automatically
- [ ] Tasks progress updated automatically
- [ ] Percentages reflect actual completion
- [ ] Quick stats show correct numbers

### Data Accuracy Check

- [ ] Total Habits count correct
- [ ] Done Today count correct (for current day)
- [ ] Total Tasks count correct
- [ ] Completed Tasks count correct
- [ ] Progress bars match percentages

---

## 🎨 Phase 7: UI/UX Verification

### Design Aesthetic

- [ ] Background is pure black (#000000)
- [ ] Cards are zinc-900 (#18181b)
- [ ] Borders are zinc-800 (#27272a)
- [ ] Primary buttons are indigo-600 (#4f46e5)
- [ ] Text is white/zinc-400
- [ ] Cards have rounded-2xl corners
- [ ] Hover effects work smoothly
- [ ] Transitions are smooth (200ms)

### Gradient Verification

- [ ] Habits progress: orange-to-red gradient
- [ ] Tasks progress: emerald-to-teal gradient
- [ ] Header banner: indigo-to-purple gradient
- [ ] Completed habit days: indigo-to-purple gradient

### Icons Check

- [ ] Home icon in navigation
- [ ] Target icon in Habits tab
- [ ] CheckSquare icon in Tasks tab
- [ ] Flame icon for streaks
- [ ] Trash icons for delete
- [ ] Priority icons (AlertCircle, Circle, CheckCircle2)
- [ ] All icons render correctly

### Responsive Design

- [ ] Opened DevTools (F12)
- [ ] Toggled device toolbar
- [ ] Tested mobile view (375px)
- [ ] Navigation accessible
- [ ] Cards stack vertically
- [ ] Forms are usable
- [ ] Buttons are tappable
- [ ] Tested tablet view (768px)
- [ ] Tested desktop view (1440px)

---

## 🔒 Phase 8: Security Configuration

### Update Firestore Rules (For Production)

- [ ] Opened Firebase Console → Firestore Database
- [ ] Clicked "Rules" tab
- [ ] Replaced with production rules:
  ```javascript
  rules_version = '2';
  service cloud.firestore {
    match /databases/{database}/documents {
      match /users/{userId}/{document=**} {
        allow read, write: if request.auth != null
                           && request.auth.uid == userId;
      }
    }
  }
  ```
- [ ] Clicked "Publish"
- [ ] Verified rules published successfully
- [ ] Tested app still works after rule update

### Security Verification

- [ ] User can only access own data
- [ ] Anonymous users get unique IDs
- [ ] Data isolated per user
- [ ] No public read/write access

---

## 🏗️ Phase 9: Build for Production

### Test Production Build

- [ ] Ran `npm run build`
- [ ] Build completed without errors
- [ ] `dist` folder created
- [ ] Checked `dist` folder contents:
  - [ ] index.html
  - [ ] assets/ folder
  - [ ] CSS files (hashed)
  - [ ] JS files (hashed)

### Test Production Build Locally

- [ ] Ran `npm run preview`
- [ ] Opened preview URL
- [ ] Tested all features
- [ ] Verified environment variables work
- [ ] No console errors

---

## 🌐 Phase 10: Deployment (Choose One)

### Option A: Vercel (Recommended)

- [ ] Installed Vercel CLI: `npm install -g vercel`
- [ ] Ran `vercel login`
- [ ] Signed in successfully
- [ ] Ran `vercel` in project directory
- [ ] Followed prompts
- [ ] Added environment variables:
  - [ ] VITE_FIREBASE_API_KEY
  - [ ] VITE_FIREBASE_AUTH_DOMAIN
  - [ ] VITE_FIREBASE_PROJECT_ID
  - [ ] VITE_FIREBASE_STORAGE_BUCKET
  - [ ] VITE_FIREBASE_MESSAGING_SENDER_ID
  - [ ] VITE_FIREBASE_APP_ID
- [ ] Ran `vercel --prod`
- [ ] Received production URL
- [ ] Visited live site

### Option B: Netlify

- [ ] Installed Netlify CLI: `npm install -g netlify-cli`
- [ ] Ran `netlify login`
- [ ] Signed in successfully
- [ ] Ran `npm run build`
- [ ] Ran `netlify deploy --prod --dir=dist`
- [ ] Added environment variables in dashboard
- [ ] Redeployed
- [ ] Visited live site

### Option C: Firebase Hosting

- [ ] Installed Firebase Tools: `npm install -g firebase-tools`
- [ ] Ran `firebase login`
- [ ] Ran `firebase init hosting`
- [ ] Selected existing project
- [ ] Set public directory to `dist`
- [ ] Configured as single-page app
- [ ] Ran `npm run build`
- [ ] Ran `firebase deploy --only hosting`
- [ ] Visited live site

---

## ✅ Phase 11: Post-Deployment Testing

### Production Site Verification

- [ ] Visited production URL
- [ ] App loads correctly
- [ ] No console errors
- [ ] HTTPS enabled (lock icon in browser)
- [ ] All tabs work
- [ ] Can add habits
- [ ] Can add tasks
- [ ] Data persists after refresh
- [ ] Mobile responsive
- [ ] Tested on phone/tablet

### Firebase Connection in Production

- [ ] Opened Firebase Console
- [ ] New anonymous users appear
- [ ] Data writes to Firestore
- [ ] Security rules enforced

### Performance Check

- [ ] Opened DevTools → Lighthouse
- [ ] Ran Performance audit
- [ ] Score 90+ (aim for 95+)
- [ ] Ran Accessibility audit
- [ ] Score 90+
- [ ] Ran Best Practices audit
- [ ] Score 90+

---

## 🎉 Phase 12: Final Polish

### Documentation Review

- [ ] Read README.md
- [ ] Read QUICKSTART.md
- [ ] Read FIREBASE_SETUP.md
- [ ] Read DEPLOYMENT.md
- [ ] Read ARCHITECTURE.md

### Optional Enhancements

- [ ] Custom domain configured
- [ ] Google Analytics added
- [ ] Error tracking (Sentry) added
- [ ] PWA manifest added
- [ ] Service worker for offline mode

### Share Your Work

- [ ] Pushed code to GitHub
- [ ] Added project to portfolio
- [ ] Shared live URL
- [ ] Created demo video (optional)

---

## 🐛 Troubleshooting Checklist

If something doesn't work, check:

### Firebase Issues

- [ ] `.env` file exists
- [ ] All 6 variables set correctly
- [ ] No extra spaces or quotes
- [ ] Restarted dev server after `.env` change
- [ ] Anonymous Auth enabled in Firebase
- [ ] Firestore database created
- [ ] Test mode active or rules configured

### Build Issues

- [ ] Deleted `node_modules` and reinstalled
- [ ] Deleted `package-lock.json` and reinstalled
- [ ] Cleared Vite cache (`.vite` folder)
- [ ] Checked Node.js version (v16+)

### Deployment Issues

- [ ] Environment variables set in hosting platform
- [ ] Build command: `npm run build`
- [ ] Output directory: `dist`
- [ ] SPA redirect configured
- [ ] No build errors

---

## 📈 Success Metrics

You've successfully completed FocusLab when:

- ✅ All checkboxes above are checked
- ✅ App deployed to production
- ✅ You can add and track habits
- ✅ You can manage tasks with priorities
- ✅ Dashboard shows real-time stats
- ✅ Data persists across sessions
- ✅ Mobile responsive
- ✅ No console errors

---

## 🎯 Next Steps

After completing this checklist:

1. **Use the app daily** to track your own habits
2. **Gather feedback** from friends/colleagues
3. **Iterate** on features based on usage
4. **Contribute** improvements (if open source)
5. **Build more features**:
   - Weekly/Monthly reports
   - Habit categories
   - Task reminders
   - Export data
   - Social features

---

**Congratulations on completing FocusLab! 🚀**

Keep tracking, stay focused, and build great habits! 💪

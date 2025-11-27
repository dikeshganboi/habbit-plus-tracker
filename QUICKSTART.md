# FocusLab - Quick Start Guide

## 🚀 Get Started in 5 Minutes

### 1. Install Dependencies

```powershell
npm install
```

### 2. Set Up Firebase

#### Create Firebase Project

1. Visit https://console.firebase.google.com/
2. Click "Add Project"
3. Name it "FocusLab" (or any name)
4. Disable Google Analytics (optional)
5. Click "Create Project"

#### Enable Authentication

1. In Firebase Console sidebar → "Authentication"
2. Click "Get Started"
3. Go to "Sign-in method" tab
4. Enable "Email/Password" (click the pencil icon, toggle enable, save)
5. (Optional) Disable Anonymous if previously enabled
6. Click "Save"

#### Create Database

1. Sidebar → "Firestore Database"
2. Click "Create Database"
3. Select "Start in test mode"
4. Choose nearest location
5. Click "Enable"

#### Get Your Config

1. Click gear icon (⚙️) → "Project settings"
2. Scroll to "Your apps"
3. Click web icon `</>`
4. Register app (name: FocusLab)
5. Copy the config object

### 3. Configure Environment

Create `.env` file:

```powershell
copy .env.example .env
```

Open `.env` and paste your Firebase config values:

```env
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=focuslab-xxx.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=focuslab-xxx
VITE_FIREBASE_STORAGE_BUCKET=focuslab-xxx.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
```

### 4. Run the App

```powershell
npm run dev
```

Visit: http://localhost:3000

## ✅ What You Get

### Authentication

- Users can create an account with email & password
- Existing users sign in from the same form
- Session persists automatically via Firebase Auth
- Sign out button in header shows current user email

### Dashboard (Home Tab)

- Daily habit completion percentage
- Task completion stats
- Motivational quotes
- Quick overview cards

### Habit Tracker

- Add unlimited habits
- Monthly matrix overview with per-habit day cells
- Weekly calendar view (Mon-Sun)
- Click days to mark complete
- See streak counters
- Track weekly & monthly completion rates
- Analysis sidebar shows per-habit monthly progress bars
- Charts for 30-day completion trend & placeholder mental state

### Task Manager

- Add tasks with priorities (High/Medium/Low)
- Filter: All / Active / Completed
- Check off completed tasks
- Color-coded priority tags
- Delete tasks

## 🎨 Features

### Dark Mode Design

- Black & zinc color scheme
- Indigo accent colors
- Rounded cards with smooth shadows
- Gradient progress bars

### Real-time Sync

- All data saved to Firebase
- Automatic updates
- Works offline (with cache)

### Mobile Responsive

- Works on phones, tablets, desktops
- Touch-friendly buttons
- Responsive grid layouts

## 📊 Data Storage

Your data is stored in Firebase Firestore:

```
users/
  └── {your-user-id}/
      ├── habits/
      │   └── {habit-id}
      │       ├── title: "Drink Water"
      │       ├── completedDates: ["2024-11-22", ...]
      │       └── createdAt: timestamp
      └── tasks/
          └── {task-id}
              ├── text: "Complete project"
              ├── priority: "High"
              ├── completed: false
              └── createdAt: timestamp
```

## 🔒 Security

### For Testing (Current Setup)

- Test mode allows read/write for 30 days
- Good for development

### For Production (Recommended)

Update Firestore Rules:

1. Go to Firestore → Rules tab
2. Paste this:

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

3. Click "Publish"

## 🌐 Deploy to Production

### Option A: Vercel (Recommended)

```powershell
npm install -g vercel
npm run build
vercel
```

### Option B: Netlify

```powershell
npm install -g netlify-cli
npm run build
netlify deploy --prod --dir=dist
```

### Option C: Firebase Hosting

```powershell
npm install -g firebase-tools
firebase login
firebase init hosting
npm run build
firebase deploy
```

## 🛠️ Troubleshooting

### "Firebase not defined" error

✅ Check `.env` file exists
✅ Restart dev server after creating `.env`
✅ Verify all VITE\_ variables are set

### Styles not loading

✅ Run `npm install` again
✅ Clear browser cache (Ctrl+Shift+Delete)
✅ Check Tailwind config

### Data not saving

✅ Check Firebase Auth is enabled
✅ Verify Firestore is created
✅ Check browser console for errors
✅ Ensure test mode is active in Firestore

### Build fails

```powershell
# Clear cache and reinstall
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install
npm run build
```

## 📱 Usage Tips

### Habits Best Practices

- Keep habit names short and clear
- Start with 3-5 habits
- Review weekly completion rates
- Celebrate streaks!

### Task Management Tips

- Use High priority for urgent items
- Medium for important but not urgent
- Low for nice-to-haves
- Check off tasks daily for motivation

### Dashboard Insights

- Check daily to stay motivated
- Watch your completion percentages grow
- Use quotes for daily inspiration

## 🎯 Next Steps

1. ✅ Add your first 3 habits
2. ✅ Create 5 tasks with different priorities
3. ✅ Track habits for a full week
4. ✅ Complete all tasks
5. ✅ Check dashboard progress

## 📞 Need Help?

- Check README.md for detailed documentation
- Review Firebase Console for data
- Open browser DevTools for errors (F12)

---

**Happy tracking! 🚀**

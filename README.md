# 🎯 Habbit+ Task Tracker

> A professional habit tracking and task management application with AI coaching, analytics, and gamification features.

[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen)](https://habbit-task-tracker.vercel.app)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

## ✨ Features

### 📊 Habit Tracking

- **Monthly Calendar View** - Spreadsheet-style habit tracking with color-coded weeks
- **Streak Tracking** - Monitor current and best streaks
- **Progress Analytics** - Weekly progress graphs and daily completion charts
- **Smart Reminders** - Never miss a habit

### ✅ Task Management

- **Daily Task Lists** - Organize and prioritize your tasks
- **Task Categories** - Custom categorization
- **Due Date Tracking** - Stay on schedule
- **Completion Stats** - Track your productivity

### 📈 Analytics & Insights

- **Progress Dashboard** - Comprehensive analytics overview
- **Monthly Heatmap** - Visual representation of consistency
- **Performance Charts** - Line graphs and donut charts
- **Top Habits Ranking** - See what's working best

### 🎮 Gamification

- **XP System** - Earn points for completing tasks
- **Level Progression** - Track your growth
- **Achievement Badges** - Unlock rewards
- **Daily Goals** - Stay motivated

### 🤖 AI Features

- **AI Habit Coach** - Personalized recommendations powered by Google Gemini
- **Smart Suggestions** - Data-driven insights
- **Motivational Quotes** - Daily inspiration

### 💎 Premium Features

- **Subscription System** - ₹10/month premium access
- **Coupon System** - Promotional offers (Use code: `10GET0` for 1 month free)
- **Payment Integration** - Razorpay gateway
- **Subscription Management** - View details in profile

### 🎨 UI/UX

- **Dark/Light Mode** - Eye-friendly themes
- **Responsive Design** - Works on all devices
- **Professional Interface** - Modern, clean design with indigo/purple gradients
- **Smooth Animations** - Delightful interactions

## 🚀 Tech Stack

- **Frontend:** React 18 + Vite
- **Styling:** Tailwind CSS
- **Backend:** Firebase (Auth + Firestore)
- **Payments:** Razorpay
- **AI:** Google Gemini API
- **Hosting:** Vercel
- **Icons:** Lucide React

## 🛠️ Installation

### Prerequisites

- Node.js 18+ and npm
- Firebase account
- Razorpay account (for payments)
- Google Gemini API key (for AI features)

### Setup

1. **Clone the repository**

```bash
git clone https://github.com/dikeshganboi/habbit-plus-tracker.git
cd habbit-plus-tracker
```

2. **Install dependencies**

```bash
npm install
```

3. **Environment Setup**

Create a `.env` file in the root directory:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Razorpay Configuration
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id

# Google Gemini API
VITE_GEMINI_API_KEY=your_gemini_api_key
```

4. **Firebase Setup**

- Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
- Enable Authentication (Email/Password and Google)
- Create a Firestore database
- Add your domain to authorized domains

5. **Run development server**

```bash
npm run dev
```

Visit `http://localhost:5173` to see the app.

## 📦 Build for Production

```bash
npm run build
npm run preview
```

## 🌐 Deployment

### Deploy to Vercel (Recommended)

1. **Install Vercel CLI**

```bash
npm install -g vercel
```

2. **Deploy**

```bash
vercel --prod
```

Or connect your GitHub repository to Vercel for automatic deployments.

### Environment Variables on Vercel

Add all `.env` variables in Vercel Dashboard:

- Project Settings → Environment Variables
- Add each variable from your `.env` file

## 🔒 Security

- Firebase Security Rules configured for user-specific data access
- Environment variables for sensitive keys
- Razorpay webhook verification
- Firebase App Check (recommended for production)

## 🧪 Testing

```bash
# Run tests (if configured)
npm test
```

## 📱 Progressive Web App

The app is PWA-ready with offline capabilities and can be installed on mobile devices.

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Dikesh Ganboi**

- GitHub: [@dikeshganboi](https://github.com/dikeshganboi)

## 🙏 Acknowledgments

- Firebase for backend infrastructure
- Vercel for hosting
- Tailwind CSS for styling
- Lucide React for beautiful icons
- Google Gemini for AI capabilities

## 📧 Support

For support, open an issue in this repository.

---

⭐ Star this repository if you find it helpful!

# Deployment Guide - FocusLab

Complete deployment instructions for various hosting platforms.

---

## Pre-Deployment Checklist

Before deploying, ensure:

- [ ] All features tested locally
- [ ] Firebase project configured
- [ ] `.env` file working locally
- [ ] `npm run build` completes successfully
- [ ] No console errors in production build
- [ ] Firestore security rules updated for production
- [ ] Firebase Anonymous Auth enabled

---

## Option 1: Vercel (Recommended) ⭐

### Why Vercel?

- ✅ Free tier available
- ✅ Automatic HTTPS
- ✅ GitHub integration
- ✅ Fast global CDN
- ✅ Easy environment variables
- ✅ Zero configuration for Vite

### Step-by-Step Deployment

#### Method A: Using Vercel CLI

1. **Install Vercel CLI**

   ```powershell
   npm install -g vercel
   ```

2. **Login to Vercel**

   ```powershell
   vercel login
   ```

   - Opens browser for authentication
   - Sign in with GitHub/GitLab/Bitbucket/Email

3. **Deploy from Project Root**

   ```powershell
   cd "d:\GITHUB PROJECT\Habbit+ Task Tracker"
   vercel
   ```

   - Follow prompts:
     - Set up and deploy? **Y**
     - Which scope? **Select your account**
     - Link to existing project? **N**
     - Project name? **focuslab** (or your choice)
     - In which directory is your code? **./**
     - Want to override settings? **N**

4. **Add Environment Variables**

   ```powershell
   vercel env add VITE_FIREBASE_API_KEY production
   ```

   Paste your Firebase API key when prompted.

   Repeat for all variables:

   ```powershell
   vercel env add VITE_FIREBASE_AUTH_DOMAIN production
   vercel env add VITE_FIREBASE_PROJECT_ID production
   vercel env add VITE_FIREBASE_STORAGE_BUCKET production
   vercel env add VITE_FIREBASE_MESSAGING_SENDER_ID production
   vercel env add VITE_FIREBASE_APP_ID production
   ```

5. **Deploy to Production**

   ```powershell
   vercel --prod
   ```

6. **Done!**
   - Your app is live at: `https://focuslab.vercel.app`
   - Or custom domain: `https://your-project.vercel.app`

#### Method B: Using Vercel Dashboard (GitHub Integration)

1. **Push to GitHub**

   ```powershell
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/focuslab.git
   git push -u origin main
   ```

2. **Import to Vercel**

   - Go to https://vercel.com/new
   - Click "Import Git Repository"
   - Select your GitHub repository
   - Click "Import"

3. **Configure Project**

   - Framework Preset: **Vite**
   - Root Directory: **.**
   - Build Command: `npm run build`
   - Output Directory: `dist`

4. **Add Environment Variables**

   - Click "Environment Variables"
   - Add each variable:
     ```
     VITE_FIREBASE_API_KEY
     VITE_FIREBASE_AUTH_DOMAIN
     VITE_FIREBASE_PROJECT_ID
     VITE_FIREBASE_STORAGE_BUCKET
     VITE_FIREBASE_MESSAGING_SENDER_ID
     VITE_FIREBASE_APP_ID
     ```

5. **Deploy**
   - Click "Deploy"
   - Wait 2-3 minutes
   - Visit your live URL!

---

## Option 2: Netlify

### Why Netlify?

- ✅ Free tier available
- ✅ Drag-and-drop deployment
- ✅ Automatic HTTPS
- ✅ Form handling
- ✅ Serverless functions

### Step-by-Step Deployment

#### Method A: Netlify CLI

1. **Install Netlify CLI**

   ```powershell
   npm install -g netlify-cli
   ```

2. **Login**

   ```powershell
   netlify login
   ```

3. **Build Project**

   ```powershell
   npm run build
   ```

4. **Deploy**

   ```powershell
   netlify deploy --prod --dir=dist
   ```

   - Follow prompts:
     - Create & configure new site? **Y**
     - Team? **Select your team**
     - Site name? **focuslab** (or your choice)

5. **Add Environment Variables**

   - Go to Netlify dashboard
   - Site settings → Environment variables
   - Add all `VITE_*` variables

6. **Redeploy**
   ```powershell
   netlify deploy --prod --dir=dist
   ```

#### Method B: Netlify Dashboard (Drag & Drop)

1. **Build Project**

   ```powershell
   npm run build
   ```

2. **Create `netlify.toml`**

   ```toml
   [build]
     command = "npm run build"
     publish = "dist"

   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200
   ```

3. **Deploy**

   - Go to https://app.netlify.com/drop
   - Drag `dist` folder to upload area
   - Wait for deployment

4. **Add Environment Variables**
   - Site settings → Environment variables
   - Add all Firebase variables
   - Trigger redeploy

---

## Option 3: Firebase Hosting

### Why Firebase Hosting?

- ✅ Same platform as backend
- ✅ Free SSL certificate
- ✅ Fast global CDN
- ✅ Custom domains
- ✅ Easy rollback

### Step-by-Step Deployment

1. **Install Firebase Tools**

   ```powershell
   npm install -g firebase-tools
   ```

2. **Login**

   ```powershell
   firebase login
   ```

3. **Initialize Firebase**

   ```powershell
   firebase init hosting
   ```

   - Select existing Firebase project
   - Public directory: **dist**
   - Configure as single-page app: **Yes**
   - Set up automatic builds with GitHub: **No** (optional)

4. **Create `.firebaserc`**

   ```json
   {
     "projects": {
       "default": "your-firebase-project-id"
     }
   }
   ```

5. **Create `firebase.json`**

   ```json
   {
     "hosting": {
       "public": "dist",
       "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
       "rewrites": [
         {
           "source": "**",
           "destination": "/index.html"
         }
       ]
     }
   }
   ```

6. **Build & Deploy**

   ```powershell
   npm run build
   firebase deploy --only hosting
   ```

7. **Live URL**
   - Your app is at: `https://your-project.web.app`
   - Or: `https://your-project.firebaseapp.com`

---

## Option 4: GitHub Pages

### Limitations

- ⚠️ Environment variables must be hardcoded
- ⚠️ Not recommended for apps with secrets
- ✅ Good for demo/portfolio

### Step-by-Step Deployment

1. **Install gh-pages**

   ```powershell
   npm install --save-dev gh-pages
   ```

2. **Update `package.json`**

   ```json
   {
     "homepage": "https://yourusername.github.io/focuslab",
     "scripts": {
       "predeploy": "npm run build",
       "deploy": "gh-pages -d dist"
     }
   }
   ```

3. **Update `vite.config.js`**

   ```javascript
   export default defineConfig({
     plugins: [react()],
     base: "/focuslab/", // Your repo name
   });
   ```

4. **Deploy**

   ```powershell
   npm run deploy
   ```

5. **Enable GitHub Pages**
   - Go to repository → Settings → Pages
   - Source: **gh-pages branch**
   - Save

---

## Option 5: Docker + Any Cloud Provider

### Why Docker?

- ✅ Works on any platform
- ✅ Consistent environment
- ✅ Easy scaling

### Create `Dockerfile`

```dockerfile
# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Build args for environment variables
ARG VITE_FIREBASE_API_KEY
ARG VITE_FIREBASE_AUTH_DOMAIN
ARG VITE_FIREBASE_PROJECT_ID
ARG VITE_FIREBASE_STORAGE_BUCKET
ARG VITE_FIREBASE_MESSAGING_SENDER_ID
ARG VITE_FIREBASE_APP_ID

ENV VITE_FIREBASE_API_KEY=$VITE_FIREBASE_API_KEY
ENV VITE_FIREBASE_AUTH_DOMAIN=$VITE_FIREBASE_AUTH_DOMAIN
ENV VITE_FIREBASE_PROJECT_ID=$VITE_FIREBASE_PROJECT_ID
ENV VITE_FIREBASE_STORAGE_BUCKET=$VITE_FIREBASE_STORAGE_BUCKET
ENV VITE_FIREBASE_MESSAGING_SENDER_ID=$VITE_FIREBASE_MESSAGING_SENDER_ID
ENV VITE_FIREBASE_APP_ID=$VITE_FIREBASE_APP_ID

RUN npm run build

# Production stage
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### Create `nginx.conf`

```nginx
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### Build & Run

```powershell
# Build image
docker build -t focuslab `
  --build-arg VITE_FIREBASE_API_KEY=$env:VITE_FIREBASE_API_KEY `
  --build-arg VITE_FIREBASE_AUTH_DOMAIN=$env:VITE_FIREBASE_AUTH_DOMAIN `
  --build-arg VITE_FIREBASE_PROJECT_ID=$env:VITE_FIREBASE_PROJECT_ID `
  --build-arg VITE_FIREBASE_STORAGE_BUCKET=$env:VITE_FIREBASE_STORAGE_BUCKET `
  --build-arg VITE_FIREBASE_MESSAGING_SENDER_ID=$env:VITE_FIREBASE_MESSAGING_SENDER_ID `
  --build-arg VITE_FIREBASE_APP_ID=$env:VITE_FIREBASE_APP_ID `
  .

# Run container
docker run -p 3000:80 focuslab
```

### Deploy to Cloud

**AWS ECS:**

```powershell
docker tag focuslab:latest 123456789.dkr.ecr.us-east-1.amazonaws.com/focuslab:latest
docker push 123456789.dkr.ecr.us-east-1.amazonaws.com/focuslab:latest
```

**Google Cloud Run:**

```powershell
gcloud run deploy focuslab --image focuslab:latest --platform managed
```

**Azure Container Apps:**

```powershell
az containerapp create --name focuslab --image focuslab:latest
```

---

## Environment Variables Configuration

### For All Platforms

You need to set these 6 environment variables:

```
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID
```

### Getting Values

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Click gear icon → Project settings
4. Scroll to "Your apps" → Web app
5. Copy each value

### Platform-Specific Instructions

**Vercel:**

- Dashboard → Settings → Environment Variables
- Or use `vercel env add` CLI command

**Netlify:**

- Site settings → Environment variables
- Add one by one

**Firebase Hosting:**

- Not needed (same project)

**GitHub Pages:**

- Create `env.production` file (not secure!)

**Docker:**

- Pass as `--build-arg` during build

---

## Custom Domain Setup

### Vercel

1. **Add Domain**

   - Project Settings → Domains
   - Add your domain
   - Copy DNS records

2. **Update DNS**
   - Add CNAME record:
     ```
     Name: www
     Value: cname.vercel-dns.com
     ```

### Netlify

1. **Add Domain**

   - Site settings → Domain management
   - Add custom domain

2. **Update DNS**
   - Add CNAME record:
     ```
     Name: www
     Value: your-site.netlify.app
     ```

### Firebase

1. **Add Domain**

   ```powershell
   firebase hosting:sites:create your-domain
   ```

2. **Connect Domain**
   - Firebase Console → Hosting
   - Add custom domain
   - Follow DNS instructions

---

## SSL/HTTPS

All recommended platforms provide **automatic HTTPS** for free:

- ✅ Vercel: Automatic
- ✅ Netlify: Automatic
- ✅ Firebase: Automatic
- ✅ GitHub Pages: Automatic (for .github.io)

No configuration needed!

---

## Rollback Strategy

### Vercel

```powershell
vercel rollback
```

Or use dashboard → Deployments → Redeploy older version

### Netlify

```powershell
netlify rollback
```

Or use dashboard → Deploys → Publish old deploy

### Firebase

```powershell
firebase hosting:rollback
```

---

## Monitoring After Deployment

### Check These:

1. **App Loads**

   - Visit your URL
   - Check all tabs work

2. **Firebase Connection**

   - Open browser DevTools (F12)
   - Check Console for errors
   - Verify no Firebase errors

3. **Authentication**

   - Check green "Active" dot appears
   - Firebase Console → Authentication → Users
   - Should see anonymous user

4. **Data Operations**

   - Add a habit
   - Firebase Console → Firestore
   - Verify data appears

5. **Performance**
   - Test on mobile
   - Check load time
   - Verify responsiveness

---

## Troubleshooting

### "Firebase is not defined"

**Solution:**

- Check environment variables are set
- Rebuild and redeploy
- Clear browser cache

### "Permission denied" in Firestore

**Solution:**

- Update Firestore security rules
- Ensure Anonymous Auth is enabled
- Check user is authenticated

### Build fails

**Solution:**

```powershell
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install
npm run build
```

### Blank page after deployment

**Solution:**

- Check base path in `vite.config.js`
- Verify environment variables
- Check browser console for errors

---

## Cost Estimates

### Free Tier Limits

**Vercel:**

- 100 GB bandwidth/month
- Unlimited personal projects
- ✅ Perfect for FocusLab

**Netlify:**

- 100 GB bandwidth/month
- 300 build minutes/month
- ✅ Perfect for FocusLab

**Firebase:**

- 10 GB storage
- 360 MB/day downloads
- 50K reads/day (Firestore)
- ✅ Perfect for FocusLab

**All platforms:** Free tier is sufficient for personal/small team use

---

## Recommended Deployment

**For this project, we recommend Vercel:**

1. ✅ Fastest deployment
2. ✅ Best Vite integration
3. ✅ Automatic HTTPS
4. ✅ Free SSL
5. ✅ GitHub integration
6. ✅ Easy environment variables

**Quick deploy:**

```powershell
npm install -g vercel
vercel
# Follow prompts
vercel --prod
```

Done in 2 minutes! 🚀

---

## Post-Deployment Checklist

- [ ] App accessible at URL
- [ ] All tabs navigate correctly
- [ ] Can add habits
- [ ] Can add tasks
- [ ] Data persists after refresh
- [ ] Mobile responsive
- [ ] HTTPS enabled
- [ ] Custom domain configured (optional)
- [ ] Analytics setup (optional)
- [ ] Error tracking enabled (optional)

---

**Your FocusLab app is now live! 🎉**

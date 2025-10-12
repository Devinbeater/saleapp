# ⚡ Quick Deploy to Render (5 Minutes)

Follow these steps to deploy your Daily Register app to Render quickly.

---

## 🚀 Super Quick Steps

### 1. Push to GitHub (2 minutes)
```bash
# If not already initialized
git init
git add .
git commit -m "Ready for deployment"

# Create a new repo on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/daily-register.git
git branch -M main
git push -u origin main
```

### 2. Deploy to Render (3 minutes)

#### Option A: Blueprint Deploy (Easiest!)
1. Go to https://render.com and sign in
2. Click **"New +"** → **"Blueprint"**
3. Select your GitHub repository
4. Click **"Apply"**
5. Wait 3-5 minutes ☕

#### Option B: Manual Deploy
1. **Create Database**:
   - Click **"New +"** → **"PostgreSQL"**
   - Name: `daily-register-db`
   - Plan: Free
   - Click **"Create Database"**
   - Copy the **External Database URL**

2. **Create Web Service**:
   - Click **"New +"** → **"Web Service"**
   - Connect your GitHub repo
   - Name: `daily-register-app`
   - Build: `npm install && cd server && npm install`
   - Start: `cd server && npm start`
   - Add environment variable:
     - Key: `DATABASE_URL`
     - Value: (paste database URL)
   - Click **"Create Web Service"**

### 3. Initialize Database (1 minute)
```bash
# Connect to your Render database
psql YOUR_DATABASE_URL_HERE

# Copy and paste the contents of database-schema.sql
# Or run:
\i database-schema.sql

# Exit
\q
```

### 4. Test Your App
Visit: `https://your-app-name.onrender.com`

---

## ✅ Done!

Your app is now live! 🎉

**Note**: Free tier spins down after 15 min of inactivity. First request after sleep takes ~30 seconds.

---

## 🆘 Need Help?

See the full guide: `DEPLOY_TO_RENDER.md`

## 📋 Checklist

- [ ] Code pushed to GitHub
- [ ] Render account created
- [ ] Database created on Render
- [ ] Web service deployed
- [ ] Database schema initialized
- [ ] App loads in browser
- [ ] Can enter data and it saves

---

**Total Time**: ~5-10 minutes  
**Cost**: $0 (Free tier)

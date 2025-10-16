# 🚀 Deploy to Render - Quick Guide (UPDATED)

## ✅ **SSL FIX APPLIED + ENHANCED REPORTS READY**

This guide will walk you through deploying your Daily Register application to Render (free tier available).

## 📋 Prerequisites

Before you start, make sure you have:
- [x] A GitHub account
- [x] Your code pushed to a GitHub repository
- [x] A Render account (sign up at https://render.com - it's free!)

---

## 🎯 Deployment Steps

### Step 1: Prepare Your Repository

#### 1.1 Create a GitHub Repository
```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit with dynamic row expansion"

# Create a new repository on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/daily-register.git
git branch -M main
git push -u origin main
```

#### 1.2 Verify Required Files
Make sure these files exist in your repository:
- ✅ `render.yaml` (created for you)
- ✅ `server/package.json`
- ✅ `server/index.js`
- ✅ `.env.example`

---

### Step 2: Create Database on Render

#### 2.1 Sign in to Render
1. Go to https://render.com
2. Sign up or log in with GitHub

#### 2.2 Create PostgreSQL Database
1. Click **"New +"** button
2. Select **"PostgreSQL"**
3. Fill in the details:
   - **Name**: `daily-register-db`
   - **Database**: `daily_register`
   - **User**: `daily_register_user` (auto-generated)
   - **Region**: Choose closest to you (e.g., Oregon)
   - **Plan**: **Free** (or paid if you prefer)
4. Click **"Create Database"**
5. Wait 2-3 minutes for provisioning

#### 2.3 Get Database Connection String
1. Once created, click on your database
2. Scroll to **"Connections"** section
3. Copy the **"External Database URL"** (starts with `postgres://`)
4. Save this for later (you'll need it)

#### 2.4 Initialize Database Schema
1. In Render dashboard, click on your database
2. Go to **"Connect"** tab
3. Click **"PSQL Command"** to get connection command
4. Open your local terminal and run:

```bash
# Connect to your Render database
psql postgres://your_connection_string_here

# Create the tables (paste this SQL)
CREATE TABLE IF NOT EXISTS sheets (
    sheet_id SERIAL PRIMARY KEY,
    date DATE NOT NULL UNIQUE,
    note TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS entries (
    entry_id SERIAL PRIMARY KEY,
    sheet_id INTEGER REFERENCES sheets(sheet_id) ON DELETE CASCADE,
    section VARCHAR(50) NOT NULL,
    row_idx INTEGER NOT NULL,
    cell_key VARCHAR(100) NOT NULL,
    raw_value TEXT,
    calculated_value NUMERIC(15, 2),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(sheet_id, cell_key)
);

CREATE TABLE IF NOT EXISTS denominations (
    denomination_id SERIAL PRIMARY KEY,
    sheet_id INTEGER REFERENCES sheets(sheet_id) ON DELETE CASCADE,
    denomination_value INTEGER NOT NULL,
    denomination_label VARCHAR(50),
    pieces INTEGER DEFAULT 0,
    calculated_amount NUMERIC(15, 2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(sheet_id, denomination_value)
);

CREATE INDEX idx_entries_sheet_id ON entries(sheet_id);
CREATE INDEX idx_entries_section ON entries(section);
CREATE INDEX idx_denominations_sheet_id ON denominations(sheet_id);

-- Exit psql
\q
```

---

### Step 3: Deploy Web Service

#### 3.1 Create Web Service
1. In Render dashboard, click **"New +"**
2. Select **"Web Service"**
3. Connect your GitHub repository
4. Fill in the details:
   - **Name**: `daily-register-app`
   - **Region**: Same as your database
   - **Branch**: `main`
   - **Root Directory**: Leave empty
   - **Runtime**: **Node**
   - **Build Command**: `npm install && cd server && npm install`
   - **Start Command**: `cd server && npm start`
   - **Plan**: **Free**

#### 3.2 Add Environment Variables
In the **"Environment"** section, add:

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `DATABASE_URL` | Paste your database connection string from Step 2.3 |

#### 3.3 Deploy
1. Click **"Create Web Service"**
2. Render will automatically:
   - Clone your repository
   - Install dependencies
   - Start your server
3. Wait 3-5 minutes for deployment

---

### Step 4: Verify Deployment

#### 4.1 Check Health
1. Once deployed, Render will show you a URL like: `https://daily-register-app.onrender.com`
2. Visit: `https://your-app.onrender.com/api/health`
3. You should see: `{"status":"OK","timestamp":"..."}`

#### 4.2 Test the Application
1. Visit: `https://your-app.onrender.com`
2. You should see your Daily Register application
3. Try entering some data
4. Test the dynamic row expansion feature

---

## 🎨 Alternative: Deploy with Blueprint (Easier!)

Render supports deploying with a `render.yaml` file (already created for you).

### Blueprint Deployment Steps:

1. **Push render.yaml to GitHub**
   ```bash
   git add render.yaml
   git commit -m "Add Render blueprint"
   git push
   ```

2. **Deploy via Blueprint**
   - Go to Render Dashboard
   - Click **"New +"** → **"Blueprint"**
   - Select your repository
   - Render will automatically detect `render.yaml`
   - Click **"Apply"**
   - Both database and web service will be created automatically!

3. **Initialize Database**
   - Follow Step 2.4 above to create tables

---

## ⚙️ Configuration Options

### Custom Domain (Optional)
1. In your web service settings, go to **"Settings"**
2. Scroll to **"Custom Domain"**
3. Add your domain (e.g., `dailyregister.yourdomain.com`)
4. Follow DNS configuration instructions

### Environment Variables
You can add more environment variables in Render dashboard:
- `PORT` - Auto-set by Render (usually 10000)
- `NODE_ENV` - Set to `production`
- `DATABASE_URL` - Auto-linked to your database

### Auto-Deploy on Push
Render automatically deploys when you push to your main branch:
```bash
git add .
git commit -m "Update feature"
git push
# Render will auto-deploy in ~2 minutes
```

---

## 🐛 Troubleshooting

### Issue: Build Failed
**Solution:**
1. Check build logs in Render dashboard
2. Verify `package.json` has all dependencies
3. Make sure `server/package.json` exists

### Issue: Database Connection Error
**Solution:**
1. Verify `DATABASE_URL` is set correctly
2. Check database is running (green status in Render)
3. Verify database tables are created (Step 2.4)

### Issue: Application Not Loading
**Solution:**
1. Check web service logs in Render dashboard
2. Verify health check endpoint: `/api/health`
3. Check if PORT is correctly configured

### Issue: Free Tier Sleeping
**Note:** Render's free tier spins down after 15 minutes of inactivity.
- First request after sleep takes ~30 seconds
- Upgrade to paid tier for always-on service
- Or use a service like UptimeRobot to ping your app every 10 minutes

---

## 💰 Pricing

### Free Tier Includes:
- ✅ 750 hours/month web service
- ✅ PostgreSQL database (90 days, then expires)
- ✅ Auto-deploy on git push
- ✅ Free SSL certificate
- ⚠️ Spins down after 15 min inactivity

### Paid Tier ($7/month):
- ✅ Always-on service
- ✅ Persistent database
- ✅ More resources
- ✅ Priority support

---

## 📊 Post-Deployment Checklist

- [ ] Database created and tables initialized
- [ ] Web service deployed successfully
- [ ] Health check endpoint working
- [ ] Application loads in browser
- [ ] Can create new daily sheets
- [ ] Can enter data in cells
- [ ] Dynamic row expansion works
- [ ] Data saves to database
- [ ] Can load previous dates
- [ ] Export functions work

---

## 🔄 Updating Your Deployment

### Method 1: Git Push (Automatic)
```bash
# Make changes to your code
git add .
git commit -m "Add new feature"
git push

# Render auto-deploys in ~2 minutes
```

### Method 2: Manual Deploy
1. Go to Render dashboard
2. Click on your web service
3. Click **"Manual Deploy"** → **"Deploy latest commit"**

---

## 🎯 Quick Reference

### Your URLs
- **Application**: `https://daily-register-app.onrender.com`
- **Health Check**: `https://daily-register-app.onrender.com/api/health`
- **API Base**: `https://daily-register-app.onrender.com/api`

### Render Dashboard
- **Web Service**: https://dashboard.render.com/web/YOUR_SERVICE_ID
- **Database**: https://dashboard.render.com/d/YOUR_DB_ID

### Important Commands
```bash
# View logs
# (In Render dashboard → Logs tab)

# Connect to database
psql $DATABASE_URL

# Restart service
# (In Render dashboard → Manual Deploy → Clear build cache & deploy)
```

---

## 🚀 Next Steps

1. **Set up monitoring**: Use Render's built-in metrics
2. **Configure backups**: Enable database backups in Render
3. **Add custom domain**: Point your domain to Render
4. **Set up CI/CD**: Already automatic with git push!
5. **Monitor performance**: Check Render metrics dashboard

---

## 📚 Additional Resources

- **Render Docs**: https://render.com/docs
- **PostgreSQL on Render**: https://render.com/docs/databases
- **Node.js on Render**: https://render.com/docs/deploy-node-express-app
- **Render Community**: https://community.render.com

---

## ✅ Success!

Your Daily Register application is now live on Render! 🎉

**Share your app**: `https://daily-register-app.onrender.com`

Need help? Check the troubleshooting section or Render's documentation.

---

**Deployment Date**: October 12, 2025  
**Platform**: Render  
**Status**: Ready to Deploy  
**Estimated Time**: 15-20 minutes

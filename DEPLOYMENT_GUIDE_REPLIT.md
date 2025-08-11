# 🚀 Replit Deployment Guide for Wizard Chess Master

## Pre-Deployment Checklist

### 1. ✅ Verify Build Works
```bash
npm run build
```
This should complete without errors. You should see:
- "✓ built in X.XXs" message
- dist folder created with index.js

### 2. ✅ Test Production Mode Locally
```bash
npm run start
```
Then visit your Replit webview - the game should load.

---

## 📋 Step-by-Step Deployment Instructions

### Step 1: Open Deployment Panel
1. Click the **"Deployments"** tab in the left sidebar (rocket icon 🚀)
2. If you don't see it, click the three dots menu and select "Deployments"

### Step 2: Create New Deployment
1. Click **"Create deployment"** button
2. You'll see deployment options

### Step 3: Choose Deployment Type
Select **"Autoscale"** for your game:
- ✅ Autoscale - Best for production apps
- ❌ Reserved VM - More expensive, not needed
- ❌ Static - Won't work for your backend

### Step 4: Configure Deployment Settings

**Build Command:**
```bash
npm run build
```

**Run Command:**
```bash
npm run start
```

**Primary Domain:**
- If you have wizardchessmaster.com, you can set it up here
- Otherwise, use the default .replit.app domain first

### Step 5: Environment Variables
The deployment will automatically copy your current environment variables.
Make sure these are set:
- ✅ DATABASE_URL (auto-configured)
- ⚠️ OPENAI_API_KEY (optional - for AI chat)
- ⚠️ STRIPE_SECRET_KEY (optional - for payments)

### Step 6: Review & Deploy
1. Review all settings
2. Click **"Deploy"** button
3. Wait for deployment (usually 2-5 minutes)

---

## 🌐 Custom Domain Setup (wizardchessmaster.com)

### If Using Replit's Domain Management:
1. In deployment settings, click "Add custom domain"
2. Enter: wizardchessmaster.com
3. Follow Replit's DNS instructions

### DNS Records You'll Need to Add:
**For root domain (wizardchessmaster.com):**
```
Type: A
Name: @
Value: [Replit will provide IP]
```

**For www subdomain (www.wizardchessmaster.com):**
```
Type: CNAME
Name: www
Value: [your-app].replit.app
```

### SSL Certificate:
- Replit automatically provisions SSL certificates
- Takes 10-30 minutes after DNS propagation

---

## 🔍 Post-Deployment Verification

### 1. Check Basic Access
Visit your deployed URL and verify:
- [ ] Landing page loads
- [ ] No console errors
- [ ] Images and styles load

### 2. Test Core Features
- [ ] Click "Play Now" - game should start
- [ ] Try multiplayer quick match
- [ ] Test user registration/login
- [ ] Move chess pieces
- [ ] AI opponent responds

### 3. Check Database Connection
- [ ] Register a new user
- [ ] Login/logout works
- [ ] Game saves progress

### 4. Monitor Logs
In Replit deployment panel:
1. Click on your deployment
2. View "Logs" tab
3. Check for any errors

---

## 🛠️ Troubleshooting Common Issues

### "Build failed" Error
```bash
# Clear cache and rebuild
rm -rf dist node_modules
npm install
npm run build
```

### "Port already in use"
Make sure no other processes are running:
```bash
pkill node
npm run start
```

### Database Connection Issues
1. Check DATABASE_URL is set in deployment environment
2. Verify PostgreSQL is provisioned
3. Run: `npm run db:push`

### Custom Domain Not Working
1. DNS propagation can take 24-48 hours
2. Check DNS records with: `nslookup wizardchessmaster.com`
3. Verify SSL certificate status in deployment panel

---

## 📊 Deployment Configuration Summary

```json
{
  "deployment_type": "Autoscale",
  "build_command": "npm run build",
  "run_command": "npm run start",
  "port": 5000,
  "health_check_path": "/api/auth/check",
  "min_instances": 0,
  "max_instances": 10
}
```

---

## ✅ Final Steps

1. **Deploy**: Click the Deploy button
2. **Wait**: Deployment takes 2-5 minutes
3. **Test**: Visit your URL and test all features
4. **Monitor**: Check logs for first 30 minutes
5. **Celebrate**: Your game is live! 🎉

---

## Need Help?

- **Replit Support**: Use the help button in Replit
- **Check Logs**: Deployment panel → Your deployment → Logs
- **Test Locally First**: Always run `npm run start` before deploying

Your game is configured correctly and ready to deploy. Follow these steps and your Wizard Chess Master will be live!
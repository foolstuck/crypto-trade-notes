# Deploying to Render with PostgreSQL

## Complete Deployment Guide

Your application has been upgraded to use PostgreSQL for persistent data storage. All user accounts and trades will be stored permanently in the database.

---

## Prerequisites

1. A [GitHub](https://github.com) account
2. A [Render](https://render.com) account (sign up for free)
3. Git installed on your computer

---

## Step 1: Install Dependencies Locally

```bash
cd crypto-trade-notes
npm install
```

This will install the new `pg` (PostgreSQL) dependency.

---

## Step 2: Test Locally (Optional)

If you want to test locally with PostgreSQL:

1. Install PostgreSQL on your machine
2. Create a local database:
   ```bash
   createdb crypto_trade_notes
   ```
3. Set the DATABASE_URL environment variable:
   ```bash
   # Windows (PowerShell)
   $env:DATABASE_URL="postgresql://localhost/crypto_trade_notes"

   # Mac/Linux
   export DATABASE_URL="postgresql://localhost/crypto_trade_notes"
   ```
4. Start the server:
   ```bash
   npm start
   ```

**Note:** You can skip local testing and deploy directly to Render.

---

## Step 3: Push to GitHub

1. Initialize git repository (if not already done):
   ```bash
   git init
   ```

2. Add all files:
   ```bash
   git add .
   ```

3. Commit your changes:
   ```bash
   git commit -m "Upgrade to PostgreSQL database"
   ```

4. Create a new repository on GitHub:
   - Go to https://github.com/new
   - Name: `crypto-trade-notes`
   - Keep it Public (free) or Private
   - **Do NOT** initialize with README
   - Click "Create repository"

5. Push to GitHub (replace YOUR-USERNAME):
   ```bash
   git remote add origin https://github.com/YOUR-USERNAME/crypto-trade-notes.git
   git branch -M main
   git push -u origin main
   ```

---

## Step 4: Create PostgreSQL Database on Render

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **"New +"** → Select **"PostgreSQL"**
3. Configure the database:
   - **Name**: `crypto-trade-notes-db`
   - **Database**: `crypto_trade_notes`
   - **User**: Leave default
   - **Region**: Choose closest to you
   - **PostgreSQL Version**: 16 (latest)
   - **Instance Type**: **Free** (500MB storage, no credit card needed)
4. Click **"Create Database"**
5. Wait 1-2 minutes for database creation
6. **IMPORTANT**: Copy the **Internal Database URL** (starts with `postgresql://`)
   - You'll find it under "Connections" section
   - Click the copy icon next to "Internal Database URL"

---

## Step 5: Create Web Service on Render

1. From Render dashboard, click **"New +"** → **"Web Service"**
2. Click **"Connect a repository"** (authorize GitHub if needed)
3. Find and select **`crypto-trade-notes`**
4. Click **"Connect"**

### Configure the Web Service:

- **Name**: `crypto-trade-notes`
- **Region**: Same as your database region
- **Branch**: `main`
- **Root Directory**: Leave blank
- **Runtime**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Instance Type**: **Free**

### Add Environment Variables:

Scroll down to **Environment Variables** section and add these THREE variables:

1. **DATABASE_URL**
   - Key: `DATABASE_URL`
   - Value: Paste the Internal Database URL you copied in Step 4
   - Example: `postgresql://crypto_trade_notes_user:xxx@dpg-xxx/crypto_trade_notes`

2. **SESSION_SECRET**
   - Key: `SESSION_SECRET`
   - Value: Generate a random string (see below)

3. **NODE_ENV**
   - Key: `NODE_ENV`
   - Value: `production`

To generate SESSION_SECRET, run this command:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## Step 6: Deploy

1. Click **"Create Web Service"** at the bottom
2. Render will automatically:
   - Clone your repository
   - Run `npm install`
   - Initialize the database tables
   - Start your application
3. Wait 3-5 minutes for deployment
4. Watch the build logs for any errors

---

## Step 7: Access Your Application

Once deployment succeeds:
- You'll see a green **"Live"** indicator
- Your app URL: `https://crypto-trade-notes.onrender.com` (or your chosen name)
- Click the URL to open your application
- Register a new account and start tracking trades!

---

## Key Benefits of PostgreSQL

✅ **Persistent Data**: User accounts and trades are stored permanently
✅ **No Data Loss**: Data survives server restarts and redeployments
✅ **Automatic Backups**: Render backs up your database daily (on free tier)
✅ **Scalable**: Can handle thousands of users and millions of trades
✅ **Relational**: Proper foreign key relationships between users and trades

---

## Free Tier Limitations

**Web Service:**
- Sleeps after 15 minutes of inactivity
- First request after sleep takes 30-60 seconds to wake up
- 750 hours/month of runtime

**PostgreSQL Database:**
- 500MB storage (plenty for personal use)
- Expires after 90 days of inactivity
- Can handle ~10,000+ trades easily

---

## Making Updates

When you want to update your app:

```bash
# Make your changes, then:
git add .
git commit -m "Description of changes"
git push origin main
```

Render will automatically detect the push and redeploy your application. Your database data will remain intact!

---

## Monitoring Your App

### View Logs:
- Go to Render dashboard → Your web service → Logs tab
- See real-time application logs and errors

### Database Metrics:
- Go to Render dashboard → Your database → Metrics tab
- Monitor storage usage and connections

---

## Troubleshooting

### Build fails:
- Check the build logs in Render dashboard
- Ensure `package.json` has all dependencies
- Verify Build Command is `npm install`

### App doesn't start:
- Check service logs for errors
- Verify DATABASE_URL is set correctly
- Ensure Start Command is `npm start`

### Database connection fails:
- Verify you used the **Internal Database URL** (not External)
- Check that web service and database are in the same region
- Ensure DATABASE_URL environment variable is set

### Session issues:
- Verify SESSION_SECRET is set
- Check that NODE_ENV is set to `production`

---

## Security Notes

🔒 **Session Secret**: Never commit SESSION_SECRET to GitHub. It's only stored in Render's environment variables.

🔒 **Database URL**: Never commit DATABASE_URL to GitHub. Render provides it securely.

🔒 **Passwords**: All passwords are hashed with bcrypt before storage.

🔒 **HTTPS**: Render automatically provides HTTPS for your app.

---

## Next Steps

1. Share your app URL with others!
2. Consider setting up a custom domain (available on Render)
3. Monitor your usage to stay within free tier limits
4. Upgrade to paid tier if you need more resources

---

## Support

If you encounter issues:
- Check Render's [documentation](https://render.com/docs)
- Review the build/service logs in Render dashboard
- Ensure all environment variables are set correctly

---

## Summary

You now have a production-ready cryptocurrency trading journal with:
- ✅ User authentication
- ✅ Persistent PostgreSQL database
- ✅ Automatic deployments via GitHub
- ✅ Free hosting on Render
- ✅ HTTPS encryption
- ✅ Light/Dark mode
- ✅ English/Chinese language support

**Your app is ready to use! 🚀**

# DEPLOYMENT.md

## Deploying Terms Reminder App to Vercel

This guide will walk you through deploying both the frontend and backend to Vercel.

## Prerequisites

- Vercel account (free tier works)
- MongoDB Atlas account (free tier works)
- Git repository (GitHub, GitLab, or Bitbucket)

## Step 1: Set Up MongoDB Atlas

1. **Create a MongoDB Atlas Account**
   - Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Sign up for a free account
   - Create a new cluster (M0 Sandbox - FREE)

2. **Configure Database Access**
   - Go to "Database Access" in the left sidebar
   - Click "Add New Database User"
   - Choose "Password" authentication
   - Create a username and strong password (save these!)
   - Grant "Read and write to any database" privilege
   - Click "Add User"

3. **Configure Network Access**
   - Go to "Network Access" in the left sidebar
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (0.0.0.0/0)
   - This is necessary for Vercel's serverless functions
   - Click "Confirm"

4. **Get Your Connection String**
   - Go to "Database" in the left sidebar
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password
   - Replace `myFirstDatabase` with your desired database name
   - Example: `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/termsreminder?retryWrites=true&w=majority`

## Step 2: Push Your Code to Git

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin <your-repo-url>
git push -u origin main
```

## Step 3: Deploy to Vercel

### Option A: Using Vercel Dashboard (Recommended for beginners)

1. **Import Your Project**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "Add New..." → "Project"
   - Import your Git repository
   - Select the repository and click "Import"

2. **Configure the Project**
   - Framework Preset: Next.js (should auto-detect)
   - Root Directory: `./` (leave as default)
   - Build Command: `next build` (default)
   - Output Directory: `.next` (default)
   - Install Command: `npm install` (default)

3. **Add Environment Variables**
   - Click "Environment Variables"
   - Add the following variables:

   **For Production:**
   ```
   MONGODB_URI = mongodb+srv://username:password@cluster.mongodb.net/termsreminder
   NEXT_PUBLIC_API_URL = https://your-project-name.vercel.app
   FRONTEND_URL = https://your-project-name.vercel.app
   NODE_ENV = production
   ```

   **Note**: Replace `your-project-name` with your actual Vercel project URL

4. **Deploy**
   - Click "Deploy"
   - Wait for the build to complete (2-5 minutes)
   - Your app will be live at `https://your-project-name.vercel.app`

5. **Update API URL**
   - After first deployment, note your Vercel URL
   - Go back to project settings → Environment Variables
   - Update `NEXT_PUBLIC_API_URL` with your actual Vercel URL
   - Redeploy the project

### Option B: Using Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel
   ```

4. **Add Environment Variables**
   ```bash
   vercel env add MONGODB_URI
   # Paste your MongoDB connection string when prompted
   
   vercel env add NEXT_PUBLIC_API_URL
   # Enter your Vercel URL (get this after first deployment)
   
   vercel env add FRONTEND_URL
   # Enter your Vercel URL
   ```

5. **Deploy to Production**
   ```bash
   vercel --prod
   ```

## Step 4: Verify Deployment

1. **Check the Health Endpoint**
   - Visit: `https://your-project-name.vercel.app/api/health`
   - You should see:
   ```json
   {
     "status": "ok",
     "timestamp": "2025-11-08T...",
     "mongodb": "connected"
   }
   ```

2. **Test the Frontend**
   - Visit: `https://your-project-name.vercel.app`
   - The app should load without errors

3. **Check Logs**
   - Go to Vercel Dashboard → Your Project → Functions
   - Check for any errors in the function logs

## Step 5: Set Up Custom Domain (Optional)

1. **Go to Project Settings**
   - Vercel Dashboard → Your Project → Settings → Domains

2. **Add Your Domain**
   - Enter your domain name
   - Follow Vercel's instructions to configure DNS

3. **Update Environment Variables**
   - Update `NEXT_PUBLIC_API_URL` and `FRONTEND_URL` to use your custom domain
   - Redeploy

## Troubleshooting

### MongoDB Connection Issues

**Error**: "MongoServerError: bad auth"
- **Solution**: Check your username and password in the connection string
- Ensure special characters in password are URL-encoded

**Error**: "MongooseServerSelectionError"
- **Solution**: Verify IP whitelist in MongoDB Atlas includes `0.0.0.0/0`
- Check if your connection string is correct

### API Not Working

**Error**: API calls return 404
- **Solution**: Check that `vercel.json` is in the root directory
- Verify API routes are under `/api/` directory structure

**Error**: CORS errors in browser console
- **Solution**: Update `FRONTEND_URL` environment variable to match your Vercel URL
- Ensure CORS is configured in `api/index.js`

### Build Failures

**Error**: "Module not found"
- **Solution**: Ensure all dependencies are in `package.json`
- Run `npm install` locally to verify
- Check import paths use `@/` for src aliases

**Error**: "Environment variable not found"
- **Solution**: Add all required environment variables in Vercel dashboard
- Remember to add them to Production, Preview, and Development environments

### File Upload Issues

**Warning**: Uploaded files won't persist on Vercel's serverless functions

**Solution for Production**:
1. Use cloud storage services:
   - **AWS S3**: Best for production
   - **Cloudinary**: Good for images
   - **Vercel Blob**: Vercel's own storage solution

2. Update the file upload logic:
   ```javascript
   // Example with Vercel Blob
   import { put } from '@vercel/blob';
   
   const blob = await put(filename, file, {
     access: 'public',
   });
   ```

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://...` |
| `NEXT_PUBLIC_API_URL` | Backend API URL (must start with NEXT_PUBLIC_) | `https://your-app.vercel.app` |
| `FRONTEND_URL` | Frontend URL for CORS | `https://your-app.vercel.app` |
| `NODE_ENV` | Environment mode | `production` |

## Continuous Deployment

Once set up, Vercel automatically deploys:
- **Production**: When you push to `main` branch
- **Preview**: When you create a pull request

To disable auto-deployment:
1. Go to Project Settings → Git
2. Adjust deployment settings as needed

## Monitoring

1. **Check Function Logs**
   - Vercel Dashboard → Your Project → Functions
   - View real-time logs for debugging

2. **Monitor Performance**
   - Vercel Dashboard → Your Project → Analytics
   - View page load times and function execution times

3. **Set Up Alerts** (Pro plan)
   - Configure alerts for errors or performance issues

## Costs

- **Vercel Free Tier**: Includes 100GB bandwidth, serverless functions
- **MongoDB Atlas Free Tier**: 512MB storage, shared cluster
- Both are sufficient for development and small production apps

## Next Steps

1. Set up a custom domain
2. Configure authentication (e.g., NextAuth.js)
3. Implement cloud storage for file uploads
4. Set up email notifications
5. Add monitoring and analytics
6. Configure backup strategies

## Support

- Vercel Documentation: https://vercel.com/docs
- MongoDB Atlas Documentation: https://docs.atlas.mongodb.com/
- Project Issues: Check GitHub repository

## Security Checklist

- [ ] MongoDB user has appropriate permissions (not admin)
- [ ] Environment variables are set correctly
- [ ] CORS is configured for your domain only (not `*`)
- [ ] API endpoints have proper validation
- [ ] Sensitive data is not logged
- [ ] Rate limiting is implemented (consider for production)
- [ ] MongoDB connection uses SSL (default with Atlas)

# Quick Start Guide

## Initial Setup (First Time Only)

### 1. Install Backend Dependencies
```powershell
cd api
npm install
```

### 2. Install Frontend Dependencies
```powershell
cd ..
npm install
```

### 3. Set Up Environment Variables

**Backend** (`api/.env`):
```powershell
cd api
Copy-Item .env.example .env
# Edit api/.env and add your MongoDB connection string
```

**Frontend** (`.env.local`):
```powershell
cd ..
Copy-Item .env.local.example .env.local
# Default values should work for local development
```

## Running the Application

### Option 1: Run Both Servers (Recommended)

**Terminal 1 - Backend:**
```powershell
cd api
npm run dev
```

**Terminal 2 - Frontend:**
```powershell
npm run dev
```

Then visit: http://localhost:3000

### Option 2: Production Build

**Build and start:**
```powershell
# Backend
cd api
npm start

# Frontend (new terminal)
npm run build
npm start
```

## What's Been Created

### Backend (`api/`)
- ✅ Express server with MongoDB
- ✅ REST API endpoints for documents, reminders, events
- ✅ File upload support with Multer
- ✅ Input validation with express-validator
- ✅ Error handling middleware
- ✅ CORS and security (Helmet)
- ✅ Vercel-ready serverless configuration

### Frontend (`src/`)
- ✅ Next.js 15 with TypeScript
- ✅ Redux Toolkit for state management
- ✅ API integration with environment variables
- ✅ Production-ready configuration

### Deployment Files
- ✅ `vercel.json` - Vercel configuration
- ✅ `DEPLOYMENT.md` - Detailed deployment guide
- ✅ `.gitignore` - Updated for backend files

## API Endpoints

All endpoints are prefixed with `/api/`

### Documents
- `GET /api/documents` - List documents
- `POST /api/documents` - Upload document
- `PUT /api/documents/:id` - Update document
- `DELETE /api/documents/:id` - Delete document

### Reminders
- `GET /api/reminders` - List reminders
- `GET /api/reminders/today` - Today's reminders
- `POST /api/reminders` - Create reminder
- `PUT /api/reminders/:id` - Update reminder
- `PUT /api/reminders/:id/dismiss` - Dismiss
- `PUT /api/reminders/:id/snooze` - Snooze
- `DELETE /api/reminders/:id` - Delete reminder

### Events
- `GET /api/events` - List events
- `POST /api/events` - Create event
- `PUT /api/events/:id` - Update event
- `DELETE /api/events/:id` - Delete event

### Health Check
- `GET /api/health` - Check API status

## Testing the API

Using PowerShell:

```powershell
# Health check
Invoke-RestMethod -Uri "http://localhost:5000/api/health"

# Get reminders
Invoke-RestMethod -Uri "http://localhost:5000/api/reminders"

# Create a reminder
$body = @{
    title = "Test Reminder"
    dueDate = "2025-12-01"
    reminderDate = "2025-11-25"
    priority = "high"
    category = "court"
    type = "manual"
    description = "Test reminder from API"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/reminders" -Method Post -Body $body -ContentType "application/json"
```

## Troubleshooting

### Backend won't start
- Check if MongoDB URI is set in `api/.env`
- Verify port 5000 is not in use
- Run: `npm install` in the `api/` directory

### Frontend can't connect to backend
- Ensure backend is running on port 5000
- Check `NEXT_PUBLIC_API_URL` in `.env.local`
- Clear Next.js cache: `Remove-Item .next -Recurse -Force`

### MongoDB connection error
- Verify connection string format
- Check if IP is whitelisted in MongoDB Atlas
- Ensure database user has correct permissions

## Next Steps

1. **Set up MongoDB Atlas** (for development/production)
   - Create a free cluster at mongodb.com/cloud/atlas
   - Get your connection string
   - Update `api/.env`

2. **Deploy to Vercel**
   - Follow instructions in `DEPLOYMENT.md`
   - Set environment variables in Vercel dashboard

3. **Customize the app**
   - Add authentication
   - Implement file upload functionality
   - Connect the AI assistant
   - Add more features as needed

## File Structure

```
terms-reminder-app/
├── api/                      # Backend
│   ├── config/              # DB connection
│   ├── models/              # MongoDB schemas
│   ├── routes/              # API endpoints
│   ├── middleware/          # Error handling
│   ├── index.js             # Server entry
│   └── package.json         # Backend dependencies
├── src/                     # Frontend
│   ├── app/                 # Next.js pages
│   ├── redux/               # State management
│   └── config/              # API configuration
├── public/                  # Static files
├── vercel.json              # Deployment config
├── DEPLOYMENT.md            # Deployment guide
└── package.json             # Frontend dependencies
```

## Support

- Check `README.md` for full documentation
- See `DEPLOYMENT.md` for deployment help
- Review `api/README.md` for API details

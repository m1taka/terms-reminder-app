# Terms Reminder App

A comprehensive legal document management and reminder system with calendar features, built with Next.js and Node.js.

## Project Structure

This is a monorepo containing:
- **Frontend**: Next.js 15 with TypeScript, Redux Toolkit, and Tailwind CSS
- **Backend**: Node.js Express API with MongoDB

## Features

- 📄 **Document Management**: Upload, categorize, and track legal documents
- ⏰ **Smart Reminders**: Priority-based reminder system with snooze and dismiss
- 📅 **Calendar Integration**: Event scheduling and tracking
- 🤖 **AI Assistant**: Chat interface for legal assistance
- 🔔 **Real-time Notifications**: Stay updated with important deadlines

## Tech Stack

### Frontend
- Next.js 15 with App Router
- TypeScript
- Redux Toolkit for state management
- Tailwind CSS for styling
- React 19

### Backend
- Node.js & Express
- MongoDB with Mongoose ODM
- Multer for file uploads
- Express Validator
- Helmet & CORS for security

## Quick Start

### Automated Setup

Run the setup script to create environment files:

```powershell
.\setup.ps1
```

### Manual Setup

1. **Install Dependencies**
   ```bash
   # Backend
   cd api
   npm install
   
   # Frontend
   cd ..
   npm install
   ```

2. **Configure Environment Variables**
   ```bash
   # Backend
   cd api
   cp .env.example .env
   # Edit api/.env and add your MongoDB URI
   
   # Frontend
   cd ..
   cp .env.local.example .env.local
   ```

3. **Run the Application**
   
   **Terminal 1 - Backend:**
   ```bash
   cd api
   npm run dev
   ```
   
   **Terminal 2 - Frontend:**
   ```bash
   npm run dev
   ```

4. **Access the App**
   - Frontend: [http://localhost:3000](http://localhost:3000)
   - Backend API: [http://localhost:5000](http://localhost:5000)
   - Health Check: [http://localhost:5000/api/health](http://localhost:5000/api/health)

## Documentation

- [QUICKSTART.md](QUICKSTART.md) - Quick start guide with examples
- [DEPLOYMENT.md](DEPLOYMENT.md) - Detailed deployment instructions for Vercel
- [api/README.md](api/README.md) - Complete API documentation

## API Endpoints

### Documents
- `GET /api/documents` - List all documents
- `POST /api/documents` - Upload document
- `PUT /api/documents/:id` - Update document
- `DELETE /api/documents/:id` - Delete document

### Reminders
- `GET /api/reminders` - List reminders
- `GET /api/reminders/today` - Today's reminders
- `POST /api/reminders` - Create reminder
- `PUT /api/reminders/:id` - Update reminder
- `PUT /api/reminders/:id/dismiss` - Dismiss reminder
- `PUT /api/reminders/:id/snooze` - Snooze reminder
- `DELETE /api/reminders/:id` - Delete reminder

### Events
- `GET /api/events` - List events
- `POST /api/events` - Create event
- `PUT /api/events/:id` - Update event
- `DELETE /api/events/:id` - Delete event

## Project Structure

```
terms-reminder-app/
├── api/                      # Backend
│   ├── config/              # Database connection
│   ├── models/              # MongoDB schemas
│   ├── routes/              # API endpoints
│   ├── middleware/          # Express middleware
│   └── index.js             # Server entry point
├── src/                     # Frontend
│   ├── app/                 # Next.js pages
│   │   └── components/      # React components
│   ├── redux/               # State management
│   │   └── slices/          # Redux slices
│   └── config/              # Configuration
├── public/                  # Static assets
└── vercel.json              # Vercel deployment config
```

## Environment Variables

### Backend (`api/.env`)
```env
MONGODB_URI=your_mongodb_connection_string
PORT=5000
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

### Frontend (`.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

## Deployment to Vercel

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed instructions.

Quick steps:
1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

## Database Setup

### MongoDB Atlas (Recommended)
1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Create database user
4. Whitelist IP addresses (0.0.0.0/0 for Vercel)
5. Copy connection string to `api/.env`

## Features Detail

### Document Management
- Multi-format support (PDF, DOC, DOCX, TXT, JPG, PNG)
- Category-based organization
- Tagging system
- Date extraction from documents
- Full-text search

### Reminder System
- Priority levels (low, medium, high, urgent)
- Multiple categories
- Status tracking (active, dismissed, completed, snoozed)
- Document linking
- Today's reminders view

### Calendar Events
- Multiple event types
- Location tracking
- Attendee management
- Status management
- Date-based filtering

## Security

- Helmet.js for HTTP headers
- CORS configuration
- Input validation
- File type/size validation
- Environment variable protection

## Development

```bash
# Run backend in development mode with auto-reload
cd api
npm run dev

# Run frontend in development mode
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Testing the API

Using PowerShell:
```powershell
# Health check
Invoke-RestMethod -Uri "http://localhost:5000/api/health"

# Get all reminders
Invoke-RestMethod -Uri "http://localhost:5000/api/reminders"
```

## Troubleshooting

### MongoDB Connection Issues
- Verify connection string format
- Check IP whitelist in MongoDB Atlas
- Ensure database user has correct permissions

### API Not Responding
- Check if backend is running on port 5000
- Verify `NEXT_PUBLIC_API_URL` in `.env.local`
- Check CORS configuration matches your domain

### Build Errors
- Clear Next.js cache: `rm -rf .next`
- Reinstall dependencies: `rm -rf node_modules && npm install`
- Check all imports use correct paths

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## License

MIT License - see LICENSE file for details

## Support

- Documentation: See QUICKSTART.md and DEPLOYMENT.md
- Issues: Open an issue on GitHub
- API Docs: See api/README.md

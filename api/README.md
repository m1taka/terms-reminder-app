# Terms Reminder App - Backend

A Node.js Express backend with MongoDB for managing legal documents, reminders, and events.

## Features

- **Documents Management**: Upload, categorize, and manage legal documents
- **Reminders System**: Create and track reminders with priority levels
- **Events Calendar**: Schedule and manage events
- **RESTful API**: Well-structured REST endpoints
- **MongoDB Integration**: Persistent data storage with Mongoose
- **File Upload Support**: Handle document uploads with validation
- **Production Ready**: Configured for Vercel deployment

## Tech Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **Multer** - File upload handling
- **Express Validator** - Request validation
- **Helmet** - Security middleware
- **CORS** - Cross-origin resource sharing

## Project Structure

```
api/
├── config/
│   └── db.js                 # Database connection
├── models/
│   ├── Document.js           # Document schema
│   ├── Reminder.js           # Reminder schema
│   └── Event.js              # Event schema
├── routes/
│   ├── documents.js          # Document endpoints
│   ├── reminders.js          # Reminder endpoints
│   └── events.js             # Event endpoints
├── middleware/
│   └── errorHandler.js       # Error handling middleware
├── uploads/                  # File upload directory
├── index.js                  # Main application file
├── package.json
└── .env.example
```

## API Endpoints

### Documents
- `GET /api/documents` - Get all documents (with filters)
- `GET /api/documents/:id` - Get single document
- `POST /api/documents` - Upload new document
- `PUT /api/documents/:id` - Update document
- `DELETE /api/documents/:id` - Delete document

### Reminders
- `GET /api/reminders` - Get all reminders (with filters)
- `GET /api/reminders/today` - Get today's reminders
- `GET /api/reminders/:id` - Get single reminder
- `POST /api/reminders` - Create new reminder
- `PUT /api/reminders/:id` - Update reminder
- `PUT /api/reminders/:id/dismiss` - Dismiss reminder
- `PUT /api/reminders/:id/snooze` - Snooze reminder
- `DELETE /api/reminders/:id` - Delete reminder

### Events
- `GET /api/events` - Get all events (with filters)
- `GET /api/events/:id` - Get single event
- `POST /api/events` - Create new event
- `PUT /api/events/:id` - Update event
- `DELETE /api/events/:id` - Delete event

### Health Check
- `GET /api/health` - Check API and database status

## Local Development Setup

1. **Install dependencies**
   ```bash
   cd api
   npm install
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and add your MongoDB connection string:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname
   PORT=5000
   FRONTEND_URL=http://localhost:3000
   NODE_ENV=development
   ```

3. **Create uploads directory**
   ```bash
   mkdir uploads
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

   The API will be available at `http://localhost:5000`

## Production Deployment on Vercel

### Prerequisites
- Vercel account
- MongoDB Atlas account (or any MongoDB instance accessible from the internet)

### Deployment Steps

1. **Install Vercel CLI** (if not already installed)
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Set up environment variables in Vercel**
   
   Go to your Vercel project settings and add the following environment variables:
   - `MONGODB_URI` - Your MongoDB connection string
   - `FRONTEND_URL` - Your frontend URL (e.g., https://your-app.vercel.app)

   Or use the Vercel CLI:
   ```bash
   vercel env add MONGODB_URI
   vercel env add FRONTEND_URL
   ```

4. **Deploy to Vercel**
   ```bash
   vercel
   ```

   For production deployment:
   ```bash
   vercel --prod
   ```

### MongoDB Atlas Setup

1. Create a free cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a database user
3. Whitelist Vercel's IP addresses (or use `0.0.0.0/0` for all IPs)
4. Get your connection string and add it to Vercel environment variables

### Important Notes for Vercel Deployment

- Vercel uses serverless functions, so each request creates a new connection to MongoDB
- The `/uploads` directory won't persist on Vercel (consider using cloud storage like AWS S3 or Cloudinary for production file uploads)
- Cold starts might cause the first request to be slower
- Maximum execution time is 10 seconds on the free tier

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/db` |
| `PORT` | Server port (local dev only) | `5000` |
| `FRONTEND_URL` | Frontend application URL | `http://localhost:3000` |
| `NODE_ENV` | Environment mode | `development` or `production` |

## Database Schema

### Document
- `filename`: Stored filename
- `originalName`: Original filename
- `description`: Document description
- `category`: contract, legal, administrative, court, other
- `tags`: Array of tags
- `size`: File size in bytes
- `mimetype`: File MIME type
- `uploadDate`: Upload timestamp
- `extractedDates`: Array of extracted dates with context

### Reminder
- `title`: Reminder title
- `description`: Detailed description
- `dueDate`: Due date
- `reminderDate`: When to remind
- `priority`: low, medium, high, urgent
- `category`: legal, administrative, client, court, deadline, meeting
- `type`: manual, deadline, court, filing, meeting
- `status`: active, dismissed, completed, snoozed
- `documentId`: Reference to Document

### Event
- `title`: Event title
- `description`: Event description
- `date`: Event date
- `time`: Event time
- `type`: meeting, deadline, court, consultation, reminder
- `location`: Event location
- `attendees`: Array of attendees
- `status`: scheduled, completed, cancelled
- `documentId`: Reference to Document

## Security

- **Helmet**: Secure HTTP headers
- **CORS**: Controlled cross-origin access
- **Input Validation**: Express validator for all inputs
- **File Upload Limits**: 10MB max file size
- **File Type Validation**: Only specific file types allowed

## Error Handling

The API includes comprehensive error handling for:
- Validation errors
- Database errors
- File upload errors
- Invalid IDs
- 404 Not Found
- 500 Internal Server Error

## Testing the API

You can test the API using tools like:
- **Postman** or **Insomnia**
- **cURL**
- **VS Code REST Client extension**

Example cURL request:
```bash
# Get all reminders
curl http://localhost:5000/api/reminders

# Create a reminder
curl -X POST http://localhost:5000/api/reminders \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Court Filing",
    "dueDate": "2025-12-01",
    "reminderDate": "2025-11-25",
    "priority": "high",
    "category": "court",
    "type": "filing"
  }'
```

## Troubleshooting

### MongoDB Connection Issues
- Verify your connection string is correct
- Check if your IP is whitelisted in MongoDB Atlas
- Ensure database user has proper permissions

### File Upload Issues
- Verify the `uploads` directory exists
- Check file size limits
- Ensure file types are allowed

### Vercel Deployment Issues
- Check environment variables are set correctly
- Review Vercel function logs
- Verify `vercel.json` configuration

## License

MIT

## Support

For issues and questions, please open an issue in the repository.

# Google Calendar Integration Setup Guide

This guide will help you set up Google Calendar integration for automatic reminder syncing.

## Prerequisites

- Google Account
- Google Cloud Console access

## Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Name your project (e.g., "Terms Reminder App")
4. Click "Create"

## Step 2: Enable Google Calendar API

1. In your project, go to "APIs & Services" → "Library"
2. Search for "Google Calendar API"
3. Click on it and press "Enable"

## Step 3: Create Service Account

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "Service Account"
3. Fill in the details:
   - Service account name: `terms-reminder-calendar`
   - Service account ID: (auto-generated)
   - Description: "Service account for Terms Reminder App calendar integration"
4. Click "Create and Continue"
5. Skip the optional steps and click "Done"

## Step 4: Generate Service Account Key

1. In "Credentials", find your service account
2. Click on the service account email
3. Go to "Keys" tab
4. Click "Add Key" → "Create new key"
5. Choose "JSON" format
6. Click "Create"
7. A JSON file will download - **keep this safe!**

## Step 5: Share Your Google Calendar

1. Open [Google Calendar](https://calendar.google.com/)
2. Find your calendar in the left sidebar (or create a new one)
3. Click the three dots next to the calendar name → "Settings and sharing"
4. Scroll to "Share with specific people"
5. Click "Add people"
6. Add your service account email (found in the JSON file, ends with `.iam.gserviceaccount.com`)
7. Set permission to "Make changes to events"
8. Click "Send"

## Step 6: Configure Environment Variables

1. Open the downloaded JSON key file
2. Find these values:
   - `client_email` - This is your `GOOGLE_CLIENT_EMAIL`
   - `private_key` - This is your `GOOGLE_PRIVATE_KEY`

3. Add to your `api/.env` file:

```env
# Google Calendar Integration
GOOGLE_CLIENT_EMAIL=your-service-account@project-id.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour_Private_Key_Here\n-----END PRIVATE KEY-----\n"
GOOGLE_CALENDAR_ID=primary
TIMEZONE=America/New_York
```

**Important Notes:**
- Keep the private key on one line with `\n` for line breaks
- Use double quotes around the private key
- If using a specific calendar (not primary), use the Calendar ID from calendar settings

## Step 7: Get Calendar ID (if not using primary)

1. Go to Google Calendar settings
2. Click on your calendar name
3. Scroll down to "Integrate calendar"
4. Copy the "Calendar ID" (looks like an email)
5. Use this as `GOOGLE_CALENDAR_ID`

## Step 8: Test the Integration

1. Restart your backend server:
   ```bash
   cd api
   npm run dev
   ```

2. Look for this message in the console:
   ```
   ✓ Google Calendar API initialized
   ```

3. Create a test reminder:
   ```bash
   # Using PowerShell
   $body = @{
       title = "Test Calendar Sync"
       dueDate = "2025-12-01T10:00:00Z"
       reminderDate = "2025-11-29T10:00:00Z"
       priority = "high"
       category = "court"
       type = "manual"
   } | ConvertTo-Json
   
   Invoke-RestMethod -Uri "http://localhost:5000/api/reminders" -Method Post -Body $body -ContentType "application/json"
   ```

4. Check your Google Calendar - the event should appear!

## Environment Variables Explained

| Variable | Description | Example |
|----------|-------------|---------|
| `GOOGLE_CLIENT_EMAIL` | Service account email | `terms-reminder@project.iam.gserviceaccount.com` |
| `GOOGLE_PRIVATE_KEY` | Private key from JSON (keep `\n` for newlines) | `"-----BEGIN PRIVATE KEY-----\n..."` |
| `GOOGLE_CALENDAR_ID` | Target calendar ID | `primary` or `your.email@gmail.com` |
| `TIMEZONE` | Timezone for events | `America/New_York`, `Europe/London`, `UTC` |

## Timezone List

Common timezone values:
- `America/New_York` - Eastern Time
- `America/Chicago` - Central Time
- `America/Denver` - Mountain Time
- `America/Los_Angeles` - Pacific Time
- `Europe/London` - UK Time
- `Europe/Paris` - Central European Time
- `Asia/Tokyo` - Japan Time
- `UTC` - Universal Time

Full list: [IANA Time Zone Database](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones)

## Troubleshooting

### "Google Calendar not configured" message
- Check if environment variables are set correctly
- Ensure private key format is correct (with `\n` for line breaks)
- Restart the server after adding variables

### "Failed to create calendar event"
- Verify the service account has access to the calendar
- Check if Calendar API is enabled in Google Cloud Console
- Ensure calendar ID is correct

### Events not appearing in calendar
- Check if you shared the calendar with the service account
- Verify the service account email in calendar sharing settings
- Check backend logs for error messages

### Invalid credentials error
- Double-check `GOOGLE_CLIENT_EMAIL` matches the service account email
- Verify `GOOGLE_PRIVATE_KEY` is complete and properly formatted
- Ensure the JSON key file hasn't been revoked

## Security Best Practices

1. **Never commit credentials to Git**
   - Keep `.env` in `.gitignore`
   - Use environment variables in production

2. **Restrict service account permissions**
   - Only grant Calendar access
   - Don't use admin accounts

3. **Rotate keys periodically**
   - Create new keys every 90 days
   - Delete old keys

4. **Monitor API usage**
   - Check Google Cloud Console for unusual activity
   - Set up billing alerts

## Optional: Calendar Event Customization

You can customize how events appear by modifying `api/services/googleCalendar.js`:

- **Event colors**: Change priority colors in `getPriorityColor()`
- **Event duration**: Modify the end time calculation
- **Reminder times**: Adjust the reminder minutes in `createEvent()`
- **Description format**: Update `formatDescription()` method

## Disabling Google Calendar Integration

If you don't want to use Google Calendar:

1. Simply don't set the environment variables
2. The app will work normally without calendar sync
3. You'll see: "Google Calendar not configured, skipping event creation"

## Production Deployment (Vercel)

Add environment variables in Vercel dashboard:

1. Go to your Vercel project settings
2. Navigate to "Environment Variables"
3. Add each variable:
   - `GOOGLE_CLIENT_EMAIL`
   - `GOOGLE_PRIVATE_KEY` (paste the entire key with newlines)
   - `GOOGLE_CALENDAR_ID`
   - `TIMEZONE`
4. Deploy

**Note**: Vercel automatically escapes the private key, so the `\n` should work correctly.

## Support

For issues:
- Check the backend console logs
- Review Google Cloud Console audit logs
- Ensure API quotas aren't exceeded (Calendar API free tier: 1,000,000 requests/day)

## Features

When properly configured, the integration:
- ✅ Automatically creates calendar events when reminders are created
- ✅ Updates calendar events when reminders are modified
- ✅ Deletes calendar events when reminders are deleted
- ✅ Sets event colors based on priority
- ✅ Adds reminder notifications before due dates
- ✅ Includes all reminder details in event description
- ✅ Works asynchronously (doesn't slow down API responses)

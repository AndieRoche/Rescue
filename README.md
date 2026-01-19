# Foster Dog Field Trip App 🐕

A simple, beautiful app for Texas Great Pyrenees Rescue volunteers to upload photos and videos from dog field trips directly to Google Drive.

## Features

### Volunteer Features
- 🔐 Secure one-time link access via phone number
- 📸 Easy photo/video upload from mobile devices
- 📁 Automatic album creation with dog info, location, and date
- ✨ Beautiful thank you animation on completion
- ⏱️ 24-hour active album window

### Admin Features
- 👥 Manage volunteer list (add, edit, remove)
- 🔄 Toggle volunteer access on/off
- 📊 View all photo albums
- 📁 Google Drive integration for organized storage

## Tech Stack

- **Frontend**: React, Material-UI, Framer Motion
- **Backend**: Node.js, Express
- **Database**: SQLite
- **Storage**: Google Drive API
- **Email**: Nodemailer

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Google Cloud Console account
- Gmail account (for sending emails)

### 1. Clone and Install

```bash
# Install root dependencies
npm install

# Install client dependencies
cd client
npm install
cd ..
```

### 2. Google Drive API Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select existing)
3. Enable the Google Drive API
4. Create OAuth 2.0 credentials:
   - Go to "Credentials" → "Create Credentials" → "OAuth client ID"
   - Application type: "Web application"
   - Add authorized redirect URI: `http://localhost:5000/auth/google/callback`
   - Save the Client ID and Client Secret

5. Get your refresh token:
   - Use the [OAuth 2.0 Playground](https://developers.google.com/oauthplayground/)
   - In settings (gear icon), check "Use your own OAuth credentials"
   - Enter your Client ID and Client Secret
   - In "Step 1", select "Drive API v3" → `https://www.googleapis.com/auth/drive`
   - Click "Authorize APIs" and sign in
   - In "Step 2", click "Exchange authorization code for tokens"
   - Copy the refresh token

6. Create a folder in Google Drive for storing albums and copy its ID:
   - Open the folder in Google Drive
   - The folder ID is in the URL: `drive.google.com/drive/folders/[FOLDER_ID]`

### 3. Email Setup (Gmail)

1. Enable 2-Factor Authentication on your Gmail account
2. Generate an App Password:
   - Go to your Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a new app password
   - Copy the 16-character password

### 4. Environment Configuration

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` with your credentials:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Google Drive API Configuration
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
GOOGLE_REDIRECT_URI=http://localhost:5000/auth/google/callback
GOOGLE_REFRESH_TOKEN=your_refresh_token_here
GOOGLE_DRIVE_FOLDER_ID=your_folder_id_here

# Email Configuration
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password_here

# App Configuration
APP_URL=http://localhost:3000
SESSION_SECRET=change_this_to_random_string
```

### 5. Run the Application

Development mode (runs both frontend and backend):

```bash
npm run dev
```

Or run separately:

```bash
# Terminal 1 - Backend
npm run server

# Terminal 2 - Frontend
npm run client
```

The app will be available at:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000
- Admin Panel: http://localhost:3000/admin

### 6. Add Volunteers

1. Go to http://localhost:3000/admin
2. Click "Add Volunteer"
3. Enter volunteer details:
   - Name
   - Phone number (10 digits)
   - Area (optional)
4. The volunteer will be active by default

## Usage

### For Volunteers

1. Visit the app URL
2. Enter your registered phone number
3. Check your email for the one-time access link
4. Click the link to access the app
5. Enter dog's name, location, and description
6. Upload photos/videos from your device
7. Click "Finish & Close Album" when done
8. Enjoy the thank you animation!

### For Admins

1. Visit `/admin` route (http://localhost:3000/admin)
2. **Volunteers Tab**:
   - Add new volunteers
   - Edit volunteer information
   - Toggle volunteer status (active/inactive)
   - Delete volunteers
3. **Photo Albums Tab**:
   - View all uploaded albums
   - See photo counts
   - Check album status

### Google Drive Organization

Albums are stored in your Google Drive folder with this naming format:
```
[Dog Name]-[Date]-[Location]-[Volunteer Name]
```

Example: `Max-2024-01-15-Downtown-John Smith`

## Production Deployment

### Build for Production

```bash
# Build the React frontend
cd client
npm run build
cd ..

# Set environment variables
export NODE_ENV=production
export PORT=5000

# Run the server
npm run server
```

### Environment Variables for Production

Update your `.env` file:

```env
NODE_ENV=production
APP_URL=https://your-domain.com
```

### Deployment Platforms

The app can be deployed to:
- **Heroku**: Add buildpacks for Node.js
- **DigitalOcean**: Use App Platform
- **AWS**: EC2 or Elastic Beanstalk
- **Railway**: One-click deployment

Important notes for production:
- Use a proper email service (SendGrid, Mailgun, etc.)
- Set up SSL/TLS certificates
- Use environment variables (never commit `.env`)
- Consider using PostgreSQL instead of SQLite
- Implement proper authentication for admin panel

## Project Structure

```
foster-dog-app/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── theme.js       # Material-UI theme
│   │   ├── App.js         # Main app component
│   │   └── index.js       # Entry point
│   └── package.json
├── server/                 # Node.js backend
│   ├── database.js        # SQLite database setup
│   ├── email.js           # Email service
│   ├── googleDrive.js     # Google Drive service
│   └── index.js           # Express server
├── .env.example           # Environment template
├── .gitignore
├── package.json
└── README.md
```

## Color Scheme

- Primary: `#00b7b6` (Teal)
- Secondary: `#daf7f6` (Light Teal)
- Background: `#ffffff` (White)

## Security Notes

- One-time access links expire after 24 hours
- Tokens are invalidated after first use
- Volunteer status can be toggled to revoke access
- Admin panel should be restricted to local network in production
- Never commit `.env` file to version control

## Troubleshooting

### "Volunteer not found" error
- Ensure the volunteer is added in the admin panel
- Check that their status is "on" (active)
- Verify the phone number matches exactly

### Google Drive upload fails
- Verify your Google API credentials
- Check that the refresh token is valid
- Ensure the Drive API is enabled
- Verify the folder ID is correct

### Email not sending
- Check your app password is correct
- Ensure 2FA is enabled on Gmail
- Try a different email service if issues persist

### Database errors
- Delete `foster_dog.db` and restart to recreate
- Check file permissions on the database file

## Contributing

This is a project for Texas Great Pyrenees Rescue. For questions or issues:
1. Check the troubleshooting section
2. Review your environment configuration
3. Contact the development team

## License

MIT License - Created for Texas Great Pyrenees Rescue

---

Made with ❤️ for rescue dogs and the amazing volunteers who help them! 🐾

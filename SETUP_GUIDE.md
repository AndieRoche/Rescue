# Quick Setup Guide 🚀

This guide will help you get the Foster Dog Field Trip App running in under 10 minutes!

## Step-by-Step Setup

### 1. Install Dependencies (2 minutes)

```bash
# Install root dependencies
npm install

# Install client dependencies
cd client && npm install && cd ..
```

### 2. Set Up Google Drive (5 minutes)

#### A. Create Google Cloud Project
1. Go to https://console.cloud.google.com/
2. Click "Select a project" → "New Project"
3. Name it "Foster Dog App" → Create

#### B. Enable Google Drive API
1. In your project, go to "APIs & Services" → "Library"
2. Search for "Google Drive API"
3. Click it and press "Enable"

#### C. Create Credentials
1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth client ID"
3. If prompted, configure consent screen:
   - User Type: External
   - App name: "Foster Dog App"
   - User support email: your email
   - Developer contact: your email
   - Save and continue through all steps
4. Now create OAuth client ID:
   - Application type: "Web application"
   - Name: "Foster Dog Web Client"
   - Authorized redirect URIs: `http://localhost:5000/auth/google/callback`
   - Click "Create"
5. **Save the Client ID and Client Secret!**

#### D. Get Refresh Token
1. Go to https://developers.google.com/oauthplayground/
2. Click the gear icon (⚙️) in the top right
3. Check "Use your own OAuth credentials"
4. Paste your Client ID and Client Secret
5. Close settings
6. On the left, find "Drive API v3"
7. Select `https://www.googleapis.com/auth/drive`
8. Click "Authorize APIs"
9. Sign in with your Google account
10. Click "Allow"
11. Click "Exchange authorization code for tokens"
12. **Copy the refresh_token** (starts with "1//...")

#### E. Create Google Drive Folder
1. Go to https://drive.google.com
2. Create a new folder called "Foster Dog Albums"
3. Open the folder
4. Copy the folder ID from the URL:
   - URL looks like: `drive.google.com/drive/folders/ABC123XYZ`
   - The folder ID is: `ABC123XYZ`

### 3. Set Up Email (2 minutes)

#### Gmail App Password
1. Go to https://myaccount.google.com/
2. Security → 2-Step Verification (enable if not already)
3. Security → App passwords
4. Select "Mail" and "Other (Custom name)"
5. Name it "Foster Dog App"
6. Click "Generate"
7. **Copy the 16-character password**

### 4. Configure Environment Variables (1 minute)

```bash
# Copy the example file
cp .env.example .env
```

Edit `.env` and fill in:

```env
# Leave these as-is
PORT=5000
NODE_ENV=development

# Paste your Google credentials
GOOGLE_CLIENT_ID=paste_here
GOOGLE_CLIENT_SECRET=paste_here
GOOGLE_REDIRECT_URI=http://localhost:5000/auth/google/callback
GOOGLE_REFRESH_TOKEN=paste_refresh_token_here
GOOGLE_DRIVE_FOLDER_ID=paste_folder_id_here

# Paste your email credentials
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=paste_app_password_here

# Leave these as-is
APP_URL=http://localhost:3000
SESSION_SECRET=my_secret_key_123
```

### 5. Start the App! (30 seconds)

```bash
npm run dev
```

This will start both the backend (port 5000) and frontend (port 3000).

Open your browser to:
- **Volunteer Access**: http://localhost:3000
- **Admin Panel**: http://localhost:3000/admin

### 6. Add Your First Volunteer

1. Go to http://localhost:3000/admin
2. Click "Add Volunteer"
3. Fill in:
   - Name: "Test User"
   - Phone: "5551234567" (just numbers, no formatting)
   - Area: "Austin"
4. Click "Add Volunteer"

### 7. Test the Volunteer Flow

1. Go to http://localhost:3000
2. Enter phone: "(555) 123-4567"
3. Click "Get Access Link"
4. Check your email for the access link
5. Click the link
6. Create an album and upload photos!

## Troubleshooting

### "Invalid credentials" error
- Double-check your Google Client ID and Secret
- Make sure you copied them correctly (no extra spaces)

### "Failed to create folder" error
- Verify your refresh token is correct
- Check that Google Drive API is enabled
- Make sure the folder ID is correct

### Email not sending
- Verify you created an App Password (not your regular Gmail password)
- Make sure 2FA is enabled on your Google account
- Check that EMAIL_USER matches the account you generated the app password from

### "Volunteer not found" error
- Make sure you added the volunteer in the admin panel
- Check that their status is "on" (Active)
- Phone number must match exactly (just the 10 digits)

### Port already in use
```bash
# Kill the process using port 3000 or 5000
lsof -ti:3000 | xargs kill -9
lsof -ti:5000 | xargs kill -9
```

## What's Next?

✅ You're all set! The app is ready to use.

**For Production:**
- See the main README.md for deployment instructions
- Set up a proper domain name
- Use environment variables on your hosting platform
- Consider upgrading to PostgreSQL for the database

## Quick Commands

```bash
# Start development (both frontend + backend)
npm run dev

# Start only backend
npm run server

# Start only frontend
npm run client

# Build for production
cd client && npm run build

# View the database
sqlite3 server/foster_dog.db
```

## Need Help?

Check the main README.md for:
- Detailed documentation
- Architecture overview
- Production deployment guide
- Security considerations

---

Happy coding! 🐾 If you run into issues, go through this checklist:
- [ ] All dependencies installed
- [ ] Google Drive API enabled
- [ ] OAuth credentials created
- [ ] Refresh token obtained
- [ ] Google Drive folder created
- [ ] Gmail App Password created
- [ ] .env file configured correctly
- [ ] Both servers running (npm run dev)

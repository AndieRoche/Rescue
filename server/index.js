require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const db = require('./database');
const driveService = require('./googleDrive');
const emailService = require('./email');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 100 * 1024 * 1024 } // 100MB limit
});

// ============= VOLUNTEER ROUTES =============

// Request access link by phone number
app.post('/api/volunteer/request-access', (req, res) => {
  const { phone } = req.body;

  if (!phone) {
    return res.status(400).json({ error: 'Phone number is required' });
  }

  // Find volunteer by phone
  db.get(
    'SELECT * FROM volunteers WHERE phone = ? AND status = "on"',
    [phone],
    async (err, volunteer) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (!volunteer) {
        return res.status(404).json({ error: 'Volunteer not found or not authorized' });
      }

      // Generate one-time token
      const token = uuidv4();
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      // Store token
      db.run(
        'INSERT INTO access_tokens (token, volunteer_id, expires_at) VALUES (?, ?, ?)',
        [token, volunteer.id, expiresAt.toISOString()],
        async (err) => {
          if (err) {
            return res.status(500).json({ error: 'Failed to generate access token' });
          }

          // Send email (you'll need to get volunteer's email - for now we'll mock it)
          // In production, you'd add email to the volunteers table
          const emailSent = await emailService.sendOneTimeLink(
            `${phone}@temp.com`, // Replace with actual email from volunteer record
            token,
            volunteer.name
          );

          if (emailSent) {
            res.json({
              success: true,
              message: 'Access link sent to your email'
            });
          } else {
            res.json({
              success: true,
              token: token, // For testing - remove in production
              message: 'Access granted'
            });
          }
        }
      );
    }
  );
});

// Verify access token
app.get('/api/volunteer/verify/:token', (req, res) => {
  const { token } = req.params;

  db.get(
    `SELECT at.*, v.name, v.phone, v.area
     FROM access_tokens at
     JOIN volunteers v ON at.volunteer_id = v.id
     WHERE at.token = ? AND at.used = 0 AND datetime(at.expires_at) > datetime('now')`,
    [token],
    (err, result) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (!result) {
        return res.status(401).json({ error: 'Invalid or expired token' });
      }

      // Mark token as used
      db.run('UPDATE access_tokens SET used = 1 WHERE token = ?', [token]);

      res.json({
        valid: true,
        volunteer: {
          id: result.volunteer_id,
          name: result.name,
          phone: result.phone,
          area: result.area
        }
      });
    }
  );
});

// Create new album
app.post('/api/volunteer/album/create', async (req, res) => {
  const { volunteerId, dogName, location, blurb } = req.body;

  if (!volunteerId || !dogName || !location) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // Get volunteer info
    db.get('SELECT * FROM volunteers WHERE id = ?', [volunteerId], async (err, volunteer) => {
      if (err || !volunteer) {
        return res.status(404).json({ error: 'Volunteer not found' });
      }

      // Create folder name: "dog name-date-location-volunteer name"
      const date = new Date().toISOString().split('T')[0];
      const folderName = `${dogName}-${date}-${location}-${volunteer.name}`;

      // Create folder in Google Drive
      const folderId = await driveService.createFolder(folderName);

      // Create album record
      db.run(
        `INSERT INTO albums (volunteer_id, dog_name, location, blurb, folder_id, status)
         VALUES (?, ?, ?, ?, ?, 'open')`,
        [volunteerId, dogName, location, blurb, folderId],
        function (err) {
          if (err) {
            return res.status(500).json({ error: 'Failed to create album' });
          }

          res.json({
            success: true,
            albumId: this.lastID,
            folderName: folderName
          });
        }
      );
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create album in Google Drive' });
  }
});

// Get active album for volunteer
app.get('/api/volunteer/album/active/:volunteerId', (req, res) => {
  const { volunteerId } = req.params;

  db.get(
    `SELECT * FROM albums
     WHERE volunteer_id = ?
     AND status = 'open'
     AND datetime(created_at, '+24 hours') > datetime('now')
     ORDER BY created_at DESC LIMIT 1`,
    [volunteerId],
    (err, album) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      res.json({ album: album || null });
    }
  );
});

// Upload file to album
app.post('/api/volunteer/album/upload', upload.single('file'), async (req, res) => {
  const { albumId } = req.body;
  const file = req.file;

  if (!albumId || !file) {
    return res.status(400).json({ error: 'Missing album ID or file' });
  }

  try {
    // Get album info
    db.get('SELECT * FROM albums WHERE id = ? AND status = "open"', [albumId], async (err, album) => {
      if (err || !album) {
        // Clean up uploaded file
        fs.unlinkSync(file.path);
        return res.status(404).json({ error: 'Album not found or closed' });
      }

      // Upload to Google Drive
      const driveFileId = await driveService.uploadFile(
        file.path,
        file.originalname,
        album.folder_id,
        file.mimetype
      );

      // Record upload
      db.run(
        'INSERT INTO uploads (album_id, file_name, drive_file_id) VALUES (?, ?, ?)',
        [albumId, file.originalname, driveFileId],
        (err) => {
          // Clean up local file
          fs.unlinkSync(file.path);

          if (err) {
            return res.status(500).json({ error: 'Failed to record upload' });
          }

          res.json({
            success: true,
            fileName: file.originalname
          });
        }
      );
    });
  } catch (error) {
    // Clean up file on error
    if (file && file.path) {
      fs.unlinkSync(file.path);
    }
    res.status(500).json({ error: 'Failed to upload file' });
  }
});

// Close album
app.post('/api/volunteer/album/close', (req, res) => {
  const { albumId } = req.body;

  if (!albumId) {
    return res.status(400).json({ error: 'Album ID is required' });
  }

  db.run(
    `UPDATE albums SET status = 'closed', closed_at = datetime('now') WHERE id = ?`,
    [albumId],
    (err) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to close album' });
      }

      res.json({ success: true });
    }
  );
});

// ============= ADMIN ROUTES =============

// Get all volunteers
app.get('/api/admin/volunteers', (req, res) => {
  db.all('SELECT * FROM volunteers ORDER BY name', [], (err, volunteers) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json({ volunteers });
  });
});

// Add volunteer
app.post('/api/admin/volunteers', (req, res) => {
  const { name, phone, area, status } = req.body;

  if (!name || !phone) {
    return res.status(400).json({ error: 'Name and phone are required' });
  }

  db.run(
    'INSERT INTO volunteers (name, phone, area, status) VALUES (?, ?, ?, ?)',
    [name, phone, area || '', status || 'on'],
    function (err) {
      if (err) {
        if (err.message.includes('UNIQUE constraint failed')) {
          return res.status(400).json({ error: 'Phone number already exists' });
        }
        return res.status(500).json({ error: 'Failed to add volunteer' });
      }

      res.json({
        success: true,
        volunteer: {
          id: this.lastID,
          name,
          phone,
          area,
          status: status || 'on'
        }
      });
    }
  );
});

// Update volunteer
app.put('/api/admin/volunteers/:id', (req, res) => {
  const { id } = req.params;
  const { name, phone, area, status } = req.body;

  db.run(
    'UPDATE volunteers SET name = ?, phone = ?, area = ?, status = ? WHERE id = ?',
    [name, phone, area, status, id],
    (err) => {
      if (err) {
        if (err.message.includes('UNIQUE constraint failed')) {
          return res.status(400).json({ error: 'Phone number already exists' });
        }
        return res.status(500).json({ error: 'Failed to update volunteer' });
      }

      res.json({ success: true });
    }
  );
});

// Toggle volunteer status
app.patch('/api/admin/volunteers/:id/toggle', (req, res) => {
  const { id } = req.params;

  db.get('SELECT status FROM volunteers WHERE id = ?', [id], (err, volunteer) => {
    if (err || !volunteer) {
      return res.status(404).json({ error: 'Volunteer not found' });
    }

    const newStatus = volunteer.status === 'on' ? 'off' : 'on';

    db.run('UPDATE volunteers SET status = ? WHERE id = ?', [newStatus, id], (err) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to toggle status' });
      }

      res.json({ success: true, status: newStatus });
    });
  });
});

// Delete volunteer
app.delete('/api/admin/volunteers/:id', (req, res) => {
  const { id } = req.params;

  db.run('DELETE FROM volunteers WHERE id = ?', [id], (err) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to delete volunteer' });
    }

    res.json({ success: true });
  });
});

// Get all albums
app.get('/api/admin/albums', (req, res) => {
  db.all(
    `SELECT a.*, v.name as volunteer_name,
     (SELECT COUNT(*) FROM uploads WHERE album_id = a.id) as photo_count
     FROM albums a
     JOIN volunteers v ON a.volunteer_id = v.id
     ORDER BY a.created_at DESC`,
    [],
    (err, albums) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json({ albums });
    }
  );
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));

  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

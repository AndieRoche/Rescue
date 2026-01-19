import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Card,
  CardContent,
  Button,
  Typography,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Chip,
  Alert
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PhotoIcon from '@mui/icons-material/Photo';
import VideocamIcon from '@mui/icons-material/Videocam';
import CloseIcon from '@mui/icons-material/Close';
import { useNavigate } from 'react-router-dom';

function PhotoUpload() {
  const navigate = useNavigate();
  const [album, setAlbum] = useState(null);
  const [volunteer, setVolunteer] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [pendingFiles, setPendingFiles] = useState([]);

  useEffect(() => {
    const albumData = localStorage.getItem('activeAlbum');
    const volunteerData = localStorage.getItem('volunteer');

    if (!albumData || !volunteerData) {
      navigate('/');
      return;
    }

    setAlbum(JSON.parse(albumData));
    setVolunteer(JSON.parse(volunteerData));
  }, [navigate]);

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setPendingFiles(prev => [...prev, ...files]);
  };

  const removePendingFile = (index) => {
    setPendingFiles(prev => prev.filter((_, i) => i !== index));
  };

  const uploadFiles = async () => {
    if (pendingFiles.length === 0) return;

    setUploading(true);
    const totalFiles = pendingFiles.length;
    let uploadedCount = 0;

    for (const file of pendingFiles) {
      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('albumId', album.id);

        const response = await fetch('/api/volunteer/album/upload', {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          uploadedCount++;
          setUploadProgress((uploadedCount / totalFiles) * 100);
          setUploadedFiles(prev => [...prev, file.name]);
        } else {
          console.error('Upload failed for:', file.name);
        }
      } catch (error) {
        console.error('Error uploading file:', error);
      }
    }

    setPendingFiles([]);
    setUploading(false);
    setUploadProgress(0);
  };

  const handleFinish = async () => {
    try {
      await fetch('/api/volunteer/album/close', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ albumId: album.id }),
      });

      localStorage.removeItem('activeAlbum');
      navigate('/thank-you');
    } catch (error) {
      console.error('Error closing album:', error);
    }
  };

  if (!album || !volunteer) {
    return null;
  }

  const isVideo = (filename) => {
    return /\.(mp4|mov|avi|wmv|flv|webm)$/i.test(filename);
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ minHeight: '100vh', py: 4 }}>
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h5" gutterBottom sx={{ color: 'primary.main' }}>
              {album.dog_name}'s Field Trip
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Location: {album.location}
            </Typography>
            {album.blurb && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {album.blurb}
              </Typography>
            )}
            <Box sx={{ mt: 2 }}>
              <Chip
                label={`${uploadedFiles.length} photos/videos uploaded`}
                color="primary"
                size="small"
              />
            </Box>
          </CardContent>
        </Card>

        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ mb: 3 }}>
              <input
                accept="image/*,video/*"
                style={{ display: 'none' }}
                id="file-upload"
                multiple
                type="file"
                onChange={handleFileSelect}
              />
              <label htmlFor="file-upload">
                <Button
                  variant="outlined"
                  component="span"
                  fullWidth
                  size="large"
                  startIcon={<CloudUploadIcon />}
                  sx={{ mb: 2 }}
                >
                  Select Photos/Videos
                </Button>
              </label>

              {pendingFiles.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Selected files ({pendingFiles.length}):
                  </Typography>
                  <List dense>
                    {pendingFiles.map((file, index) => (
                      <ListItem
                        key={index}
                        sx={{
                          bgcolor: 'primary.light',
                          mb: 1,
                          borderRadius: 1
                        }}
                        secondaryAction={
                          <IconButton
                            edge="end"
                            onClick={() => removePendingFile(index)}
                            disabled={uploading}
                          >
                            <CloseIcon />
                          </IconButton>
                        }
                      >
                        <ListItemIcon>
                          {isVideo(file.name) ? <VideocamIcon /> : <PhotoIcon />}
                        </ListItemIcon>
                        <ListItemText
                          primary={file.name}
                          secondary={`${(file.size / 1024 / 1024).toFixed(2)} MB`}
                        />
                      </ListItem>
                    ))}
                  </List>

                  <Button
                    variant="contained"
                    fullWidth
                    size="large"
                    onClick={uploadFiles}
                    disabled={uploading}
                  >
                    {uploading ? 'Uploading...' : `Upload ${pendingFiles.length} File(s)`}
                  </Button>

                  {uploading && (
                    <Box sx={{ mt: 2 }}>
                      <LinearProgress variant="determinate" value={uploadProgress} />
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1, textAlign: 'center' }}>
                        {Math.round(uploadProgress)}% complete
                      </Typography>
                    </Box>
                  )}
                </Box>
              )}
            </Box>

            {uploadedFiles.length > 0 && (
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Uploaded successfully:
                </Typography>
                <List dense>
                  {uploadedFiles.slice(-5).map((fileName, index) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        <CheckCircleIcon color="success" />
                      </ListItemIcon>
                      <ListItemText primary={fileName} />
                    </ListItem>
                  ))}
                </List>
                {uploadedFiles.length > 5 && (
                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                    ... and {uploadedFiles.length - 5} more
                  </Typography>
                )}
              </Box>
            )}
          </CardContent>
        </Card>

        {uploadedFiles.length > 0 && (
          <Card>
            <CardContent>
              <Alert severity="info" sx={{ mb: 2 }}>
                You can keep uploading more photos/videos, or finish when you're done.
              </Alert>
              <Button
                variant="contained"
                fullWidth
                size="large"
                onClick={handleFinish}
                disabled={uploading}
              >
                Finish & Close Album
              </Button>
            </CardContent>
          </Card>
        )}
      </Box>
    </Container>
  );
}

export default PhotoUpload;

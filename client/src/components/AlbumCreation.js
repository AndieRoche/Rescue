import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  CircularProgress,
  Alert
} from '@mui/material';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import { useNavigate } from 'react-router-dom';

function AlbumCreation() {
  const navigate = useNavigate();
  const [volunteer, setVolunteer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [checkingActive, setCheckingActive] = useState(true);
  const [formData, setFormData] = useState({
    dogName: '',
    location: '',
    blurb: ''
  });
  const [error, setError] = useState('');

  useEffect(() => {
    // Check if volunteer is authenticated
    const volunteerData = localStorage.getItem('volunteer');
    if (!volunteerData) {
      navigate('/');
      return;
    }

    const vol = JSON.parse(volunteerData);
    setVolunteer(vol);

    // Check if there's an active album
    checkActiveAlbum(vol.id);
  }, [navigate]);

  const checkActiveAlbum = async (volunteerId) => {
    try {
      const response = await fetch(`/api/volunteer/album/active/${volunteerId}`);
      const data = await response.json();

      if (data.album) {
        // Active album exists, go to upload page
        localStorage.setItem('activeAlbum', JSON.stringify(data.album));
        navigate('/album/upload');
      } else {
        setCheckingActive(false);
      }
    } catch (error) {
      console.error('Error checking active album:', error);
      setCheckingActive(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!formData.dogName || !formData.location) {
      setError('Dog name and location are required');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/volunteer/album/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          volunteerId: volunteer.id,
          dogName: formData.dogName,
          location: formData.location,
          blurb: formData.blurb
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Store album info and navigate to upload page
        localStorage.setItem('activeAlbum', JSON.stringify({
          id: data.albumId,
          dog_name: formData.dogName,
          location: formData.location,
          blurb: formData.blurb
        }));
        navigate('/album/upload');
      } else {
        setError(data.error || 'Failed to create album');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (checkingActive) {
    return (
      <Box sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh'
      }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          py: 4,
        }}
      >
        <Card sx={{ width: '100%', maxWidth: 500 }}>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <CameraAltIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
              <Typography variant="h5" gutterBottom sx={{ color: 'primary.main' }}>
                Create Photo Album
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Welcome, {volunteer?.name}!
              </Typography>
            </Box>

            <form onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Dog's Name"
                name="dogName"
                variant="outlined"
                value={formData.dogName}
                onChange={handleChange}
                sx={{ mb: 2 }}
                required
              />

              <TextField
                fullWidth
                label="Location"
                name="location"
                variant="outlined"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g., Park, Beach, Downtown"
                sx={{ mb: 2 }}
                required
              />

              <TextField
                fullWidth
                label="Short Description"
                name="blurb"
                variant="outlined"
                multiline
                rows={3}
                value={formData.blurb}
                onChange={handleChange}
                placeholder="Tell us about this field trip..."
                sx={{ mb: 3 }}
              />

              {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {error}
                </Alert>
              )}

              <Button
                type="submit"
                variant="contained"
                fullWidth
                size="large"
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : 'Create Album & Start Uploading'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
}

export default AlbumCreation;

import React, { useState } from 'react';
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
import PetsIcon from '@mui/icons-material/Pets';

function VolunteerAccess() {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const formatPhoneNumber = (value) => {
    // Remove all non-digits
    const cleaned = value.replace(/\D/g, '');

    // Format as (XXX) XXX-XXXX
    if (cleaned.length <= 3) {
      return cleaned;
    } else if (cleaned.length <= 6) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
    } else {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
    }
  };

  const handlePhoneChange = (e) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhone(formatted);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    // Extract just the digits
    const cleanPhone = phone.replace(/\D/g, '');

    if (cleanPhone.length !== 10) {
      setMessage({ type: 'error', text: 'Please enter a valid 10-digit phone number' });
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/volunteer/request-access', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone: cleanPhone }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({
          type: 'success',
          text: 'Access link sent! Check your email (or use the link for testing).'
        });

        // For testing - auto-redirect with token
        if (data.token) {
          setTimeout(() => {
            window.location.href = `/access/${data.token}`;
          }, 1500);
        }
      } else {
        setMessage({
          type: 'error',
          text: data.error || 'Volunteer not found or not authorized'
        });
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Network error. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

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
        <Card sx={{ width: '100%', maxWidth: 450 }}>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <PetsIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
              <Typography variant="h4" gutterBottom sx={{ color: 'primary.main' }}>
                Foster Dog Field Trip
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Texas Great Pyrenees Rescue
              </Typography>
            </Box>

            <form onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Phone Number"
                variant="outlined"
                value={phone}
                onChange={handlePhoneChange}
                placeholder="(555) 123-4567"
                sx={{ mb: 3 }}
                inputProps={{ maxLength: 14 }}
              />

              {message.text && (
                <Alert severity={message.type} sx={{ mb: 3 }}>
                  {message.text}
                </Alert>
              )}

              <Button
                type="submit"
                variant="contained"
                fullWidth
                size="large"
                disabled={loading || phone.length < 10}
                sx={{ mb: 2 }}
              >
                {loading ? <CircularProgress size={24} /> : 'Get Access Link'}
              </Button>

              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                Enter your registered phone number to receive an access link via email
              </Typography>
            </form>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
}

export default VolunteerAccess;

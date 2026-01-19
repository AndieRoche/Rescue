import React, { useEffect, useState } from 'react';
import {
  Container,
  Box,
  Card,
  CardContent,
  Typography,
  Button
} from '@mui/material';
import { motion } from 'framer-motion';
import FavoriteIcon from '@mui/icons-material/Favorite';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

function ThankYou() {
  const [showAnimation, setShowAnimation] = useState(false);

  useEffect(() => {
    // Trigger animation on mount
    setShowAnimation(true);

    // Clear volunteer and album data
    localStorage.removeItem('volunteer');
    localStorage.removeItem('activeAlbum');
  }, []);

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
          <CardContent sx={{ p: 4, textAlign: 'center' }}>
            {showAnimation && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 260,
                  damping: 20,
                  duration: 0.6
                }}
              >
                <Box sx={{ position: 'relative', display: 'inline-block', mb: 3 }}>
                  <CheckCircleOutlineIcon
                    sx={{
                      fontSize: 120,
                      color: 'primary.main',
                    }}
                  />
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: [0, 1.2, 1] }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)'
                    }}
                  >
                    <FavoriteIcon
                      sx={{
                        fontSize: 40,
                        color: '#ff6b9d',
                      }}
                    />
                  </motion.div>
                </Box>
              </motion.div>
            )}

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              <Typography variant="h4" gutterBottom sx={{ color: 'primary.main', fontWeight: 600 }}>
                Thank You!
              </Typography>

              <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
                Your photos have been saved!
              </Typography>

              <Box
                sx={{
                  bgcolor: 'primary.light',
                  borderRadius: 2,
                  p: 3,
                  mb: 3
                }}
              >
                <Typography variant="body1" sx={{ mb: 2 }}>
                  Your field trip photos and videos are now safely stored and ready for the admin team to review.
                </Typography>

                <Typography variant="body2" color="text.secondary">
                  Thank you for taking the time to document this special outing. Your efforts help us share these wonderful moments and find forever homes for our Great Pyrenees!
                </Typography>
              </Box>

              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.4 }}
              >
                <Typography variant="h5" sx={{ mb: 2 }}>
                  🐾 🐕 🐾
                </Typography>
              </motion.div>

              <Button
                variant="outlined"
                onClick={() => window.location.href = '/'}
                sx={{ mt: 2 }}
              >
                Return to Home
              </Button>
            </motion.div>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
}

export default ThankYou;

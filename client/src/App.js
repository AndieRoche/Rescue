import React, { useState, useEffect } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { BrowserRouter as Router, Routes, Route, useParams } from 'react-router-dom';
import theme from './theme';
import VolunteerAccess from './components/VolunteerAccess';
import AlbumCreation from './components/AlbumCreation';
import PhotoUpload from './components/PhotoUpload';
import AdminPanel from './components/AdminPanel';
import ThankYou from './components/ThankYou';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/" element={<VolunteerAccess />} />
          <Route path="/access/:token" element={<TokenHandler />} />
          <Route path="/album/create" element={<AlbumCreation />} />
          <Route path="/album/upload" element={<PhotoUpload />} />
          <Route path="/thank-you" element={<ThankYou />} />
          <Route path="/admin" element={<AdminPanel />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

// Component to handle token verification
function TokenHandler() {
  const { token } = useParams();
  const [verified, setVerified] = useState(false);
  const [volunteer, setVolunteer] = useState(null);

  useEffect(() => {
    const verifyToken = async () => {
      try {
        const response = await fetch(`/api/volunteer/verify/${token}`);
        const data = await response.json();

        if (data.valid) {
          setVolunteer(data.volunteer);
          localStorage.setItem('volunteer', JSON.stringify(data.volunteer));
          setVerified(true);
          window.location.href = '/album/create';
        } else {
          alert('Invalid or expired access link');
          window.location.href = '/';
        }
      } catch (error) {
        alert('Error verifying access link');
        window.location.href = '/';
      }
    };

    verifyToken();
  }, [token]);

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      color: '#00b7b6'
    }}>
      <h2>Verifying access...</h2>
    </div>
  );
}

export default App;

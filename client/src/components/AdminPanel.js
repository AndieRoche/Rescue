import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Switch,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  Tabs,
  Tab,
  Alert
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import FolderIcon from '@mui/icons-material/Folder';

function AdminPanel() {
  const [tabValue, setTabValue] = useState(0);
  const [volunteers, setVolunteers] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingVolunteer, setEditingVolunteer] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    area: '',
    status: 'on'
  });
  const [error, setError] = useState('');

  useEffect(() => {
    loadVolunteers();
    loadAlbums();
  }, []);

  const loadVolunteers = async () => {
    try {
      const response = await fetch('/api/admin/volunteers');
      const data = await response.json();
      setVolunteers(data.volunteers || []);
    } catch (error) {
      console.error('Error loading volunteers:', error);
    }
  };

  const loadAlbums = async () => {
    try {
      const response = await fetch('/api/admin/albums');
      const data = await response.json();
      setAlbums(data.albums || []);
    } catch (error) {
      console.error('Error loading albums:', error);
    }
  };

  const handleOpenDialog = (volunteer = null) => {
    if (volunteer) {
      setEditingVolunteer(volunteer);
      setFormData({
        name: volunteer.name,
        phone: volunteer.phone,
        area: volunteer.area,
        status: volunteer.status
      });
    } else {
      setEditingVolunteer(null);
      setFormData({
        name: '',
        phone: '',
        area: '',
        status: 'on'
      });
    }
    setOpenDialog(true);
    setError('');
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingVolunteer(null);
    setFormData({
      name: '',
      phone: '',
      area: '',
      status: 'on'
    });
    setError('');
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const formatPhoneNumber = (phone) => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    return phone;
  };

  const handleSubmit = async () => {
    const cleanPhone = formData.phone.replace(/\D/g, '');

    if (!formData.name || cleanPhone.length !== 10) {
      setError('Name and valid 10-digit phone number are required');
      return;
    }

    try {
      const url = editingVolunteer
        ? `/api/admin/volunteers/${editingVolunteer.id}`
        : '/api/admin/volunteers';

      const method = editingVolunteer ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          phone: cleanPhone
        }),
      });

      const data = await response.json();

      if (response.ok) {
        loadVolunteers();
        handleCloseDialog();
      } else {
        setError(data.error || 'Failed to save volunteer');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    }
  };

  const handleToggleStatus = async (volunteer) => {
    try {
      await fetch(`/api/admin/volunteers/${volunteer.id}/toggle`, {
        method: 'PATCH',
      });
      loadVolunteers();
    } catch (error) {
      console.error('Error toggling status:', error);
    }
  };

  const handleDelete = async (volunteerId) => {
    if (!window.confirm('Are you sure you want to delete this volunteer?')) {
      return;
    }

    try {
      await fetch(`/api/admin/volunteers/${volunteerId}`, {
        method: 'DELETE',
      });
      loadVolunteers();
    } catch (error) {
      console.error('Error deleting volunteer:', error);
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <AdminPanelSettingsIcon sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
              <Typography variant="h4" sx={{ color: 'primary.main' }}>
                Admin Panel
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              Texas Great Pyrenees Rescue - Field Trip App Management
            </Typography>
          </CardContent>
        </Card>

        <Paper sx={{ mb: 3 }}>
          <Tabs
            value={tabValue}
            onChange={(e, newValue) => setTabValue(newValue)}
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab label="Volunteers" />
            <Tab label="Photo Albums" />
          </Tabs>
        </Paper>

        {tabValue === 0 && (
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6">
                  Manage Volunteers
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => handleOpenDialog()}
                >
                  Add Volunteer
                </Button>
              </Box>

              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Phone</TableCell>
                      <TableCell>Area</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {volunteers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} align="center">
                          <Typography color="text.secondary">
                            No volunteers yet. Add your first volunteer to get started!
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      volunteers.map((volunteer) => (
                        <TableRow key={volunteer.id}>
                          <TableCell>{volunteer.name}</TableCell>
                          <TableCell>{formatPhoneNumber(volunteer.phone)}</TableCell>
                          <TableCell>{volunteer.area || '-'}</TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Switch
                                checked={volunteer.status === 'on'}
                                onChange={() => handleToggleStatus(volunteer)}
                                color="primary"
                              />
                              <Chip
                                label={volunteer.status === 'on' ? 'Active' : 'Inactive'}
                                color={volunteer.status === 'on' ? 'success' : 'default'}
                                size="small"
                                sx={{ ml: 1 }}
                              />
                            </Box>
                          </TableCell>
                          <TableCell align="right">
                            <IconButton
                              onClick={() => handleOpenDialog(volunteer)}
                              color="primary"
                            >
                              <EditIcon />
                            </IconButton>
                            <IconButton
                              onClick={() => handleDelete(volunteer.id)}
                              color="error"
                            >
                              <DeleteIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        )}

        {tabValue === 1 && (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Photo Albums
              </Typography>

              {albums.length === 0 ? (
                <Alert severity="info">
                  No photo albums yet. Albums will appear here once volunteers start uploading photos.
                </Alert>
              ) : (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Dog Name</TableCell>
                        <TableCell>Volunteer</TableCell>
                        <TableCell>Location</TableCell>
                        <TableCell>Date</TableCell>
                        <TableCell>Photos</TableCell>
                        <TableCell>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {albums.map((album) => (
                        <TableRow key={album.id}>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <FolderIcon sx={{ mr: 1, color: 'primary.main' }} />
                              {album.dog_name}
                            </Box>
                          </TableCell>
                          <TableCell>{album.volunteer_name}</TableCell>
                          <TableCell>{album.location}</TableCell>
                          <TableCell>
                            {new Date(album.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>{album.photo_count || 0}</TableCell>
                          <TableCell>
                            <Chip
                              label={album.status}
                              color={album.status === 'open' ? 'primary' : 'default'}
                              size="small"
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}

              <Alert severity="info" sx={{ mt: 3 }}>
                Albums are stored in Google Drive with the naming format: "Dog Name-Date-Location-Volunteer Name"
              </Alert>
            </CardContent>
          </Card>
        )}

        {/* Add/Edit Volunteer Dialog */}
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle>
            {editingVolunteer ? 'Edit Volunteer' : 'Add New Volunteer'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2 }}>
              <TextField
                fullWidth
                label="Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                sx={{ mb: 2 }}
                required
              />

              <TextField
                fullWidth
                label="Phone Number"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="5551234567"
                sx={{ mb: 2 }}
                required
                helperText="Enter 10-digit phone number"
              />

              <TextField
                fullWidth
                label="Area"
                name="area"
                value={formData.area}
                onChange={handleChange}
                sx={{ mb: 2 }}
                placeholder="e.g., Austin, Dallas, Houston"
              />

              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button onClick={handleSubmit} variant="contained">
              {editingVolunteer ? 'Save Changes' : 'Add Volunteer'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
}

export default AdminPanel;

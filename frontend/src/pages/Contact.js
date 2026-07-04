import React, { useState } from 'react';
import { Container, Typography, TextField, Button, Box, Alert, Stack, Paper } from '@mui/material';

function Contact() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState({ type: '', message: '' });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setStatus({ type: 'success', message: 'Thanks! Your message has been received locally.' });
    setFormData({ name: '', email: '', message: '' });
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={0} sx={{ p: { xs: 3, md: 4 }, bgcolor: 'rgba(10, 22, 38, 0.82)' }}>
        <Typography variant="h4" gutterBottom>
          Contact Us
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Send us a note and we will follow up as soon as possible.
        </Typography>

        {status.message && (
          <Alert severity={status.type === 'success' ? 'success' : 'error'} sx={{ mb: 3 }}>
            {status.message}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <Stack spacing={2}>
            <TextField
              label="Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              fullWidth
            />
            <TextField
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              fullWidth
            />
            <TextField
              label="Message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              required
              multiline
              minRows={5}
              fullWidth
            />
            <Button type="submit" variant="contained" size="large">
              Send Message
            </Button>
          </Stack>
        </Box>
      </Paper>
    </Container>
  );
}

export default Contact;

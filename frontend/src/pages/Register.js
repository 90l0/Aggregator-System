import React, { useState } from 'react';
import { TextField, Button, Typography, Box, Alert, Link, Stack } from '@mui/material';
import { Link as RouterLink, useNavigate, Navigate } from 'react-router-dom';
import api from '../services/api';
import AuthLayout from '../components/AuthLayout';

const inputSx = {
  '& .MuiInputLabel-root': {
    color: 'rgba(239, 248, 255, 0.72)',
  },
  '& .MuiInputLabel-root.Mui-focused': {
    color: 'primary.light',
  },
  '& .MuiOutlinedInput-root': {
    borderRadius: 3,
    bgcolor: 'rgba(255, 255, 255, 0.04)',
    transition: 'transform 200ms ease, background-color 200ms ease',
    '&:hover': {
      transform: 'translateY(-2px)',
      bgcolor: 'rgba(255, 255, 255, 0.07)',
    },
    '&.Mui-focused': {
      bgcolor: 'rgba(255, 255, 255, 0.09)',
    },
  },
  '& .MuiOutlinedInput-input': {
    color: 'text.primary',
  },
};

function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const token = localStorage.getItem('token');
  if (token) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleRegister = async () => {
    try {
      await api.post('/auth/register', { email, password });
      setSuccess('Account created successfully. Please login.');
      setError('');
      setEmail('');
      setPassword('');
      setTimeout(() => navigate('/login'), 1200);
    } catch (err) {
      const message = err?.response?.data?.detail || err?.message || 'Registration failed. Please try again.';
      setError(message);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    await handleRegister();
  };

  return (
    <AuthLayout
      title="Build your operator workspace in minutes"
      subtitle="Create an account to activate dashboards, alerts, and secure access for your AIMS control center."
    >
      <Typography component="h1" variant="h4">
        Create account
      </Typography>
      <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
        New accounts are created as agent credentials by default.
      </Typography>
      <Stack component="form" spacing={2} sx={{ mt: 3 }} onSubmit={handleSubmit}>
        {error && (
          <Alert
            severity="error"
            sx={{
              borderRadius: 2.5,
              border: '1px solid rgba(255, 255, 255, 0.14)',
              bgcolor: 'rgba(194, 47, 66, 0.22)',
            }}
          >
            {error}
          </Alert>
        )}
        {success && (
          <Alert
            severity="success"
            sx={{
              borderRadius: 2.5,
              border: '1px solid rgba(255, 255, 255, 0.14)',
              bgcolor: 'rgba(31, 148, 108, 0.22)',
            }}
          >
            {success}
          </Alert>
        )}
        <TextField
          required
          fullWidth
          label="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          sx={inputSx}
        />
        <TextField
          required
          fullWidth
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          sx={inputSx}
        />
        <Button
          type="submit"
          fullWidth
          variant="contained"
          sx={{
            mt: 0.5,
            py: 1.3,
            fontSize: '1rem',
            background: 'linear-gradient(120deg, #24a8ff 0%, #59f2c6 100%)',
            color: '#04101f',
            boxShadow: '0 14px 30px rgba(12, 94, 151, 0.35)',
            '&:hover': {
              background: 'linear-gradient(120deg, #59f2c6 0%, #24a8ff 100%)',
            },
          }}
        >
          Create Account
        </Button>
      </Stack>
      <Box sx={{ mt: 2.3, textAlign: 'center' }}>
        <Link component={RouterLink} to="/login" variant="body2" sx={{ color: 'secondary.main' }}>
          Already have an account? Login
        </Link>
      </Box>
    </AuthLayout>
  );
}

export default Register;

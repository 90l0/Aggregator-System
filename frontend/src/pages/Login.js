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

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const token = localStorage.getItem('token');
  if (token) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleLogin = async () => {
    try {
      const response = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', response.data.access_token);
      navigate('/dashboard');
    } catch (err) {
      setError('Login failed. Check your credentials.');
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    await handleLogin();
  };

  return (
    <AuthLayout
      title="Interactive oversight for your entire field operation"
      subtitle="Sign in to monitor live sales, manage agents, and catch fraud activity in one immersive workflow."
    >
      <Typography component="h1" variant="h4">
        Welcome back
      </Typography>
      <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
        Use your operator credentials to continue.
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
          Sign In
        </Button>
      </Stack>
      <Box sx={{ mt: 2.3, textAlign: 'center' }}>
        <Link component={RouterLink} to="/register" variant="body2" sx={{ color: 'secondary.main' }}>
          Create a new account
        </Link>
      </Box>
    </AuthLayout>
  );
}

export default Login;

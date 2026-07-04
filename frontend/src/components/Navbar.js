import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box, Avatar, Stack } from '@mui/material';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';

const navLinks = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/agents', label: 'Agents' },
  { to: '/sales', label: 'Sales' },
  { to: '/fraud', label: 'Fraud Alerts' },
  { to: '/contact', label: 'Contact' },
];

function Navbar() {
  const token = localStorage.getItem('token');
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        bgcolor: 'rgba(4, 13, 25, 0.76)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.14)',
        backdropFilter: 'blur(10px)',
      }}
    >
      <Toolbar sx={{ minHeight: 72, gap: 2, py: 1 }}>
        <Box
          component={Link}
          to={token ? '/dashboard' : '/login'}
          sx={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: 'inherit' }}
        >
          <Avatar
            src={logo}
            alt="AIMS Logo"
            sx={{
              width: 40,
              height: 40,
              mr: 1.5,
              border: '1px solid rgba(255, 255, 255, 0.26)',
              bgcolor: 'rgba(255, 255, 255, 0.14)',
            }}
          />
          <Box>
            <Typography variant="subtitle2" sx={{ letterSpacing: '0.04em', fontWeight: 700, color: 'secondary.main' }}>
              Aggregator Intelligence & Monitoring System
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Lyca Mobile operations dashboard
            </Typography>
          </Box>
        </Box>
        <Stack direction="row" spacing={1} sx={{ ml: 'auto', flexWrap: 'wrap', rowGap: 1 }}>
          {token &&
            navLinks.map((item) => (
              <Button
                key={item.to}
                component={Link}
                to={item.to}
                color="inherit"
                size="small"
                sx={{
                  px: 1.8,
                  py: 0.8,
                  borderRadius: 999,
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  bgcolor:
                    location.pathname === item.to || location.pathname.startsWith(`${item.to}/`)
                      ? 'rgba(36, 168, 255, 0.25)'
                      : 'transparent',
                  '&:hover': {
                    bgcolor: 'rgba(36, 168, 255, 0.3)',
                  },
                }}
              >
                {item.label}
              </Button>
            ))}
          {!token && (
            <Button color="inherit" component={Link} to="/login" size="small">
              Login
            </Button>
          )}
          {!token && (
            <Button
              component={Link}
              to="/register"
              size="small"
              sx={{
                color: '#04101f',
                px: 1.7,
                background: 'linear-gradient(120deg, #24a8ff 0%, #59f2c6 100%)',
                '&:hover': {
                  background: 'linear-gradient(120deg, #59f2c6 0%, #24a8ff 100%)',
                },
              }}
            >
              Register
            </Button>
          )}
          {token && (
            <Button color="inherit" onClick={handleLogout} size="small">
              Logout
            </Button>
          )}
        </Stack>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;

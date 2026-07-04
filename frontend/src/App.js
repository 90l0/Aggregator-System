import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Agents from './pages/Agents';
import Sales from './pages/Sales';
import FraudAlerts from './pages/FraudAlerts';
import Register from './pages/Register';
import Contact from './pages/Contact';
import ProtectedRoute from './components/ProtectedRoute';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#24a8ff',
      dark: '#08609f',
      light: '#87d6ff',
    },
    secondary: {
      main: '#59f2c6',
      dark: '#1ba37e',
    },
    background: {
      default: '#060f1c',
      paper: 'rgba(10, 22, 38, 0.82)',
    },
    text: {
      primary: '#eff8ff',
      secondary: 'rgba(224, 239, 251, 0.74)',
    },
  },
  shape: {
    borderRadius: 16,
  },
  typography: {
    fontFamily: '"Manrope", "Segoe UI", Tahoma, sans-serif',
    h1: { fontFamily: '"Space Grotesk", "Manrope", sans-serif', fontWeight: 700 },
    h2: { fontFamily: '"Space Grotesk", "Manrope", sans-serif', fontWeight: 700 },
    h3: { fontFamily: '"Space Grotesk", "Manrope", sans-serif', fontWeight: 700 },
    h4: { fontFamily: '"Space Grotesk", "Manrope", sans-serif', fontWeight: 700 },
    h5: { fontFamily: '"Space Grotesk", "Manrope", sans-serif', fontWeight: 700 },
    h6: { fontFamily: '"Space Grotesk", "Manrope", sans-serif', fontWeight: 700 },
    button: {
      textTransform: 'none',
      fontWeight: 700,
      letterSpacing: '0.01em',
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        '*': {
          boxSizing: 'border-box',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 999,
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Navbar />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/agents" element={<ProtectedRoute><Agents /></ProtectedRoute>} />
          <Route path="/sales" element={<ProtectedRoute><Sales /></ProtectedRoute>} />
          <Route path="/fraud" element={<ProtectedRoute><FraudAlerts /></ProtectedRoute>} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;

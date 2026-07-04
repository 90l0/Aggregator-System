import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
  Stack,
  Chip,
  List,
  ListItem,
  ListItemText,
  Alert,
} from '@mui/material';
import { TrendingUp, Group, GppMaybe } from '@mui/icons-material';
import api from '../services/api';
import io from 'socket.io-client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import AgentMap from '../components/AgentMap';

const socket = io('http://localhost:8000');

function Dashboard() {
  const [data, setData] = useState({});
  const [analytics, setAnalytics] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadError('');
        const response = await api.get('/api/dashboard');
        setData(response.data);
        const analyticsResponse = await api.get('/api/sales/analytics');
        const chartData = Object.entries(analyticsResponse.data).map(([key, value]) => ({ product: key, amount: value }));
        setAnalytics(chartData);
        const agentsResponse = await api.get('/agents/');
        setAgents(agentsResponse.data);
      } catch (error) {
        console.error('Dashboard load failed', error);
        setLoadError('Unable to load dashboard data. Please confirm the backend API is running.');
      }
    };
    fetchData();

    // Listen for real-time updates
    socket.on('new_sale', (sale) => {
      setData((prev) => ({ ...prev, total_sales: (prev.total_sales || 0) + sale.amount }));
    });
    socket.on('new_activation', () => {
      setData((prev) => ({ ...prev, total_activations: (prev.total_activations || 0) + 1 }));
    });
    socket.on('fraud_alert', () => {
      setData((prev) => ({ ...prev, active_fraud_alerts: (prev.active_fraud_alerts || 0) + 1 }));
    });

    return () => {
      socket.off('new_sale');
      socket.off('new_activation');
      socket.off('fraud_alert');
    };
  }, []);

  const statCards = [
    {
      label: 'Total Sales',
      value: `UGX ${data.total_sales || 0}`,
      icon: <TrendingUp sx={{ color: 'secondary.main' }} />,
    },
    {
      label: 'Total Activations',
      value: data.total_activations || 0,
      icon: <Group sx={{ color: 'secondary.main' }} />,
    },
    {
      label: 'Active Fraud Alerts',
      value: data.active_fraud_alerts || 0,
      icon: <GppMaybe sx={{ color: 'secondary.main' }} />,
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 5 }}>
      <Box
        sx={{
          p: { xs: 2.5, md: 3.5 },
          borderRadius: 4,
          border: '1px solid rgba(255, 255, 255, 0.14)',
          background:
            'linear-gradient(120deg, rgba(15, 44, 73, 0.65) 0%, rgba(10, 26, 46, 0.78) 60%, rgba(9, 20, 35, 0.9) 100%)',
          boxShadow: '0 20px 50px rgba(3, 10, 22, 0.45)',
          mb: 3,
        }}
      >
        <Typography variant="overline" sx={{ color: 'secondary.main', letterSpacing: '0.18em' }}>
          LIVE DISPLAY
        </Typography>
        <Typography variant="h4" sx={{ mt: 0.7 }}>
          AIMS Dashboard
        </Typography>
        <Typography variant="body1" sx={{ mt: 1.2, color: 'text.secondary', maxWidth: 760 }}>
          Track live sales movement, active field performance, and fraud signals from one operational cockpit.
        </Typography>
        <Stack direction="row" spacing={1} sx={{ mt: 2.2, flexWrap: 'wrap', rowGap: 1 }}>
          <Chip label={`Sales: UGX ${data.total_sales || 0}`} sx={{ bgcolor: 'rgba(255, 255, 255, 0.1)' }} />
          <Chip label={`Activations: ${data.total_activations || 0}`} sx={{ bgcolor: 'rgba(255, 255, 255, 0.1)' }} />
          <Chip label={`Fraud Alerts: ${data.active_fraud_alerts || 0}`} sx={{ bgcolor: 'rgba(255, 255, 255, 0.1)' }} />
        </Stack>
      </Box>
      <Grid container spacing={3}>
        {loadError && (
          <Grid item xs={12}>
            <Alert severity="warning" sx={{ borderRadius: 2 }}>
              {loadError}
            </Alert>
          </Grid>
        )}
        {statCards.map((card) => (
          <Grid item xs={12} md={4} key={card.label}>
            <Card
              sx={{
                border: '1px solid rgba(255, 255, 255, 0.14)',
                transition: 'transform 220ms ease, border-color 220ms ease',
                '&:hover': {
                  transform: 'translateY(-6px)',
                  borderColor: 'rgba(89, 242, 198, 0.55)',
                },
              }}
            >
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography color="text.secondary">{card.label}</Typography>
                  {card.icon}
                </Stack>
                <Typography variant="h4" sx={{ mt: 1.2 }}>
                  {card.value}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
        <Grid item xs={12} md={7}>
          <Card sx={{ border: '1px solid rgba(255, 255, 255, 0.14)' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Agent Locations
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1.5 }}>
                Interactive map of agents with known coordinates.
              </Typography>
              <Box sx={{ height: 360, borderRadius: 2, overflow: 'hidden' }}>
                <AgentMap agents={agents} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={5}>
          <Card sx={{ border: '1px solid rgba(255, 255, 255, 0.14)' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Agent Directory Snapshot
              </Typography>
              <List dense disablePadding>
                {agents.length === 0 && (
                  <ListItem sx={{ px: 0 }}>
                    <ListItemText
                      primary="No agents available yet."
                      secondary="Create agents to populate this panel."
                    />
                  </ListItem>
                )}
                {agents.slice(0, 8).map((agent) => (
                  <ListItem key={agent.id} sx={{ px: 0, borderBottom: '1px dashed rgba(255,255,255,0.12)' }}>
                    <ListItemText
                      primary={agent.name}
                      secondary={`${agent.contact_info || 'No contact'} - ${agent.status || 'unknown'}`}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12}>
          <Card sx={{ border: '1px solid rgba(255, 255, 255, 0.14)' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Sales Analytics by Product Type
              </Typography>
              <Box sx={{ height: 320 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics}>
                    <defs>
                      <linearGradient id="amountGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#59f2c6" />
                        <stop offset="100%" stopColor="#24a8ff" />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="product" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar
                      dataKey="amount"
                      fill="url(#amountGradient)"
                      radius={[12, 12, 0, 0]}
                      animationDuration={850}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}

export default Dashboard;

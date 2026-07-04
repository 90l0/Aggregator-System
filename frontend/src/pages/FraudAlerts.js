import React from 'react';
import { Container, Typography, List, ListItem, ListItemText, Button, Box } from '@mui/material';
import { ArrowUpward, ArrowDownward } from '@mui/icons-material';
import api from '../services/api';

function FraudAlerts() {
  const [alerts, setAlerts] = React.useState([]);
  const [sortBy, setSortBy] = React.useState('alert_type');
  const [sortOrder, setSortOrder] = React.useState('asc');

  React.useEffect(() => {
    const fetchAlerts = async () => {
      const response = await api.get('/api/fraud_alerts');
      setAlerts(response.data);
    };
    fetchAlerts();
  }, []);

  const resolveAlert = async (id) => {
    await api.put(`/api/fraud_alerts/${id}/resolve`, {});
    setAlerts(alerts.map(alert => alert.id === id ? { ...alert, resolved: true } : alert));
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const sortedAlerts = [...alerts].sort((a, b) => {
    if (sortBy === 'alert_type') {
      return sortOrder === 'asc' ? a.alert_type.localeCompare(b.alert_type) : b.alert_type.localeCompare(a.alert_type);
    }
    return 0;
  });

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Fraud Alerts
      </Typography>
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <Button variant="outlined" onClick={() => handleSort('alert_type')} endIcon={sortBy === 'alert_type' ? (sortOrder === 'asc' ? <ArrowUpward /> : <ArrowDownward />) : null}>
          Sort by Type
        </Button>
      </Box>
      <List>
        {sortedAlerts.map((alert) => (
          <ListItem key={alert.id}>
            <ListItemText primary={alert.alert_type} secondary={alert.description} />
            {!alert.resolved && (
              <Button onClick={() => resolveAlert(alert.id)}>Resolve</Button>
            )}
          </ListItem>
        ))}
      </List>
    </Container>
  );
}

export default FraudAlerts;
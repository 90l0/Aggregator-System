import React, { useEffect, useState } from 'react';
import { Container, Typography, List, ListItem, ListItemText, Button, Box, TextField, Alert } from '@mui/material';
import { ArrowUpward, ArrowDownward } from '@mui/icons-material';
import api from '../services/api';

function Agents() {
  const [agents, setAgents] = useState([]);
  const [agentName, setAgentName] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [geoLat, setGeoLat] = useState('');
  const [geoLong, setGeoLong] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const response = await api.get('/agents/');
        setAgents(response.data);
      } catch (err) {
        setError('Unable to load agents. Please check backend connectivity.');
      }
    };
    fetchAgents();
  }, []);

  const parseCoordinate = (value) => {
    if (value.trim() === '') {
      return null;
    }

    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : NaN;
  };

  const handleCreateAgent = async () => {
    const parsedLat = parseCoordinate(geoLat);
    const parsedLong = parseCoordinate(geoLong);

    if ((parsedLat === null) !== (parsedLong === null)) {
      setError('Please provide both latitude and longitude, or leave both blank.');
      setSuccess('');
      return;
    }

    if (Number.isNaN(parsedLat) || Number.isNaN(parsedLong)) {
      setError('Latitude and longitude must be valid numbers.');
      setSuccess('');
      return;
    }

    if (parsedLat !== null && (parsedLat < -90 || parsedLat > 90)) {
      setError('Latitude must be between -90 and 90.');
      setSuccess('');
      return;
    }

    if (parsedLong !== null && (parsedLong < -180 || parsedLong > 180)) {
      setError('Longitude must be between -180 and 180.');
      setSuccess('');
      return;
    }

    try {
      setError('');
      const payload = {
        name: agentName,
        contact_info: contactInfo,
      };

      if (parsedLat !== null && parsedLong !== null) {
        payload.geo_lat = parsedLat;
        payload.geo_long = parsedLong;
      }

      const response = await api.post('/agents/', payload);
      setAgents([...agents, response.data]);
      setAgentName('');
      setContactInfo('');
      setGeoLat('');
      setGeoLong('');
      setSuccess('Agent created successfully.');
    } catch (error) {
      setSuccess('');
      setError(error.response?.data?.detail || 'Unable to create agent.');
    }
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const sortedAgents = [...agents].sort((a, b) => {
    if (sortBy === 'name') {
      const left = a.name || '';
      const right = b.name || '';
      return sortOrder === 'asc' ? left.localeCompare(right) : right.localeCompare(left);
    } else if (sortBy === 'status') {
      const left = a.status || '';
      const right = b.status || '';
      return sortOrder === 'asc' ? left.localeCompare(right) : right.localeCompare(left);
    }
    return 0;
  });

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Agents
      </Typography>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <TextField
          label="Name"
          required
          value={agentName}
          onChange={(e) => setAgentName(e.target.value)}
        />
        <TextField
          label="Contact Info"
          required
          value={contactInfo}
          onChange={(e) => setContactInfo(e.target.value)}
        />
        <TextField
          label="Latitude"
          type="number"
          inputProps={{ step: 'any', min: -90, max: 90 }}
          value={geoLat}
          onChange={(e) => setGeoLat(e.target.value)}
        />
        <TextField
          label="Longitude"
          type="number"
          inputProps={{ step: 'any', min: -180, max: 180 }}
          value={geoLong}
          onChange={(e) => setGeoLong(e.target.value)}
        />
        <Button variant="contained" onClick={handleCreateAgent}>
          Create Agent
        </Button>
      </Box>
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <Button variant="outlined" onClick={() => handleSort('name')} endIcon={sortBy === 'name' ? (sortOrder === 'asc' ? <ArrowUpward /> : <ArrowDownward />) : null}>
          Sort by Name
        </Button>
        <Button variant="outlined" onClick={() => handleSort('status')} endIcon={sortBy === 'status' ? (sortOrder === 'asc' ? <ArrowUpward /> : <ArrowDownward />) : null}>
          Sort by Status
        </Button>
      </Box>
      <List>
        {sortedAgents.map((agent) => (
          <ListItem key={agent.id}>
            <ListItemText
              primary={agent.name}
              secondary={`${agent.contact_info || 'No contact'}${agent.geo_lat != null && agent.geo_long != null ? ` | ${agent.geo_lat}, ${agent.geo_long}` : ''}`}
            />
            <Button variant="text">{agent.status}</Button>
          </ListItem>
        ))}
      </List>
    </Container>
  );
}

export default Agents;

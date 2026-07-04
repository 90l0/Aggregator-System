import React, { useEffect, useState } from 'react';
import { Container, Typography, Button, TextField, Grid, Card, CardContent, Alert, Box } from '@mui/material';
import { ArrowUpward, ArrowDownward } from '@mui/icons-material';
import api from '../services/api';
import io from 'socket.io-client';

const socket = io('http://localhost:8000');

function Sales() {
  const [sales, setSales] = useState([]);
  const [agentId, setAgentId] = useState('');
  const [productType, setProductType] = useState('');
  const [amount, setAmount] = useState('');
  const [alert, setAlert] = useState('');
  const [sortBy, setSortBy] = useState('amount');
  const [sortOrder, setSortOrder] = useState('desc');

  useEffect(() => {
    const fetchSales = async () => {
      const response = await api.get('/api/sales');
      setSales(response.data);
    };
    fetchSales();

    socket.on('new_sale', (sale) => {
      setSales(prev => [...prev, sale]);
    });

    return () => socket.off('new_sale');
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/sales', {
        agent_id: agentId,
        product_type: productType,
        amount: parseFloat(amount)
      });
      setAlert('Sale added successfully');
      setAgentId('');
      setProductType('');
      setAmount('');
    } catch (error) {
      setAlert('Error adding sale');
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

  const sortedSales = [...sales].sort((a, b) => {
    if (sortBy === 'amount') {
      return sortOrder === 'asc' ? a.amount - b.amount : b.amount - a.amount;
    } else if (sortBy === 'product_type') {
      return sortOrder === 'asc' ? a.product_type.localeCompare(b.product_type) : b.product_type.localeCompare(a.product_type);
    }
    return 0;
  });

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Sales Management
      </Typography>
      {alert && <Alert severity="info">{alert}</Alert>}
      <form onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Agent ID"
              value={agentId}
              onChange={(e) => setAgentId(e.target.value)}
              required
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Product Type"
              value={productType}
              onChange={(e) => setProductType(e.target.value)}
              required
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </Grid>
        </Grid>
        <Button type="submit" variant="contained" sx={{ mt: 2 }}>
          Add Sale
        </Button>
      </form>
      <Box sx={{ display: 'flex', gap: 2, mt: 4, mb: 2 }}>
        <Button variant="outlined" onClick={() => handleSort('amount')} endIcon={sortBy === 'amount' ? (sortOrder === 'asc' ? <ArrowUpward /> : <ArrowDownward />) : null}>
          Sort by Amount
        </Button>
        <Button variant="outlined" onClick={() => handleSort('product_type')} endIcon={sortBy === 'product_type' ? (sortOrder === 'asc' ? <ArrowUpward /> : <ArrowDownward />) : null}>
          Sort by Product Type
        </Button>
      </Box>
      <Typography variant="h6">
        Recent Sales
      </Typography>
      {sortedSales.map((sale, index) => (
        <Card key={index} sx={{ mt: 1 }}>
          <CardContent>
            <Typography>{sale.product_type} - ${sale.amount}</Typography>
          </CardContent>
        </Card>
      ))}
    </Container>
  );
}

export default Sales;
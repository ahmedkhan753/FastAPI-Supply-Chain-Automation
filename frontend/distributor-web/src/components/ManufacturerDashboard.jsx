import React, { useState, useEffect } from 'react';
import { Container, Typography, Table, TableBody, TableCell, TableHead, TableRow, Button, Paper, Snackbar, Alert } from '@mui/material';
import api from '../services/api';

const ManufacturerDashboard = () => {
    const [requests, setRequests] = useState([]);
    const [message, setMessage] = useState('');
    const [openSnackbar, setOpenSnackbar] = useState(false);

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            const response = await api.get('/manufacturer/stock-requests');
            setRequests(response.data);
        } catch (error) {
            console.error("Failed to fetch stock requests:", error);
        }
    };

    const handleShipStock = async (orderId) => {
        try {
            await api.post(`/manufacturer/ship-stock/${orderId}`);
            setMessage('Stock shipped successfully!');
            setOpenSnackbar(true);
            fetchRequests();
        } catch (error) {
            console.error("Failed to ship stock:", error);
            setMessage('Failed to ship stock.');
            setOpenSnackbar(true);
        }
    };

    return (
        <Container sx={{ mt: 4 }}>
            <Typography variant="h4" gutterBottom>Manufacturer Dashboard</Typography>
            <Paper sx={{ p: 3 }}>
                <Typography variant="h6">Stock Requests</Typography>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Order ID</TableCell>
                            <TableCell>Product</TableCell>
                            <TableCell>Quantity</TableCell>
                            <TableCell>Action</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {requests.map((req) => (
                            <TableRow key={req.id}>
                                <TableCell>{req.id}</TableCell>
                                <TableCell>{req.product_name}</TableCell>
                                <TableCell>{req.quantity}</TableCell>
                                <TableCell>
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        onClick={() => handleShipStock(req.id)}
                                    >
                                        Ship Stock
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Paper>
            <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={() => setOpenSnackbar(false)}>
                <Alert severity="success" onClose={() => setOpenSnackbar(false)}>{message}</Alert>
            </Snackbar>
        </Container>
    );
};

export default ManufacturerDashboard;

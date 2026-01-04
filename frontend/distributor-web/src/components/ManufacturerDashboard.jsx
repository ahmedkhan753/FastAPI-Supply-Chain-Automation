import React, { useState, useEffect } from 'react';
import { Container, Typography, Table, TableBody, TableCell, TableHead, TableRow, Button, Paper, Snackbar, Alert, Chip, Stack } from '@mui/material';
import api from '../services/api';

const ManufacturerDashboard = () => {
    const [requests, setRequests] = useState([]);
    const [message, setMessage] = useState({ type: 'success', text: '' });
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

    const handleRequestPayment = async (orderId) => {
        try {
            await api.post(`/manufacturer/request-payment/${orderId}`);
            setMessage({ type: 'success', text: 'Payment request sent to warehouse manager!' });
            setOpenSnackbar(true);
            fetchRequests();
        } catch (error) {
            console.error("Failed to request payment:", error);
            setMessage({ type: 'error', text: 'Failed to request payment.' });
            setOpenSnackbar(true);
        }
    };

    const handleShipStock = async (orderId) => {
        try {
            await api.post(`/manufacturer/ship-stock/${orderId}`);
            setMessage({ type: 'success', text: 'Stock shipped to warehouse successfully!' });
            setOpenSnackbar(true);
            fetchRequests();
        } catch (error) {
            console.error("Failed to ship stock:", error);
            setMessage({ type: 'error', text: 'Failed to ship stock. Make sure it is paid first.' });
            setOpenSnackbar(true);
        }
    };

    const handleDownloadInvoice = async (orderId) => {
        try {
            // Note: We use the warehouse endpoint as it's the one we registered for this purpose
            const response = await api.get(`/warehouse/${orderId}/invoice`, {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `invoice_stock_${orderId}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error("Failed to download invoice:", error);
            setMessage({ type: 'error', text: 'Failed to download invoice.' });
            setOpenSnackbar(true);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'paid_to_manufacturer': return 'success';
            case 'payment_requested': return 'warning';
            case 'stock_requested': return 'info';
            default: return 'default';
        }
    };

    return (
        <Container sx={{ mt: 4 }}>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                Manufacturer Dashboard
            </Typography>
            <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
                <Typography variant="h6" gutterBottom>Manual Stock Requests from Warehouse</Typography>
                <Table>
                    <TableHead>
                        <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                            <TableCell><b>Order ID</b></TableCell>
                            <TableCell><b>Product</b></TableCell>
                            <TableCell align="right"><b>Quantity</b></TableCell>
                            <TableCell align="right"><b>Retail Val.</b></TableCell>
                            <TableCell align="right"><b>Wholesale (Due)</b></TableCell>
                            <TableCell align="center"><b>Status</b></TableCell>
                            <TableCell align="center"><b>Actions</b></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {requests.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} align="center">No active stock requests.</TableCell>
                            </TableRow>
                        ) : (
                            requests.map((req) => (
                                <TableRow key={req.id} hover>
                                    <TableCell>{req.id}</TableCell>
                                    <TableCell>{req.product_name}</TableCell>
                                    <TableCell align="right">{req.quantity}</TableCell>
                                    <TableCell align="right">Rs {req.total_amount}</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                                        Rs {req.manufacturer_price}
                                    </TableCell>
                                    <TableCell align="center">
                                        <Chip
                                            label={req.status.replace(/_/g, ' ').toUpperCase()}
                                            color={getStatusColor(req.status)}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell align="center">
                                        <Stack direction="row" spacing={1} justifyContent="center">
                                            {req.status === 'stock_requested' && (
                                                <Button
                                                    variant="contained"
                                                    color="warning"
                                                    size="small"
                                                    onClick={() => handleRequestPayment(req.id)}
                                                >
                                                    Request Payment
                                                </Button>
                                            )}
                                            {req.status === 'paid_to_manufacturer' && (
                                                <Stack spacing={1} direction="row">
                                                    <Button
                                                        variant="contained"
                                                        color="success"
                                                        size="small"
                                                        onClick={() => handleShipStock(req.id)}
                                                    >
                                                        Ship Stock
                                                    </Button>
                                                    <Button
                                                        variant="outlined"
                                                        size="small"
                                                        onClick={() => handleDownloadInvoice(req.id)}
                                                    >
                                                        Invoice
                                                    </Button>
                                                </Stack>
                                            )}
                                            {req.status === 'payment_requested' && (
                                                <Stack spacing={1} direction="column" alignItems="center">
                                                    <Typography variant="body2" color="textSecondary">
                                                        Waiting for Payment...
                                                    </Typography>
                                                    <Button
                                                        variant="text"
                                                        size="small"
                                                        onClick={() => handleDownloadInvoice(req.id)}
                                                    >
                                                        Download Invoice
                                                    </Button>
                                                </Stack>
                                            )}
                                        </Stack>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </Paper>
            <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={() => setOpenSnackbar(false)}>
                <Alert severity={message.type} onClose={() => setOpenSnackbar(false)}>
                    {message.text}
                </Alert>
            </Snackbar>
        </Container>
    );
};

export default ManufacturerDashboard;

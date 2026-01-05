import React, { useState, useEffect } from 'react';
import { Container, Typography, Table, TableBody, TableCell, TableHead, TableRow, Button, Paper, TextField, Dialog, DialogActions, DialogContent, DialogTitle, Snackbar, Alert, Chip, Box, Stack, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import api from '../services/api';
import { PRODUCT_IMAGES, getProductImage, handleImageError } from '../constants/images';
import { Avatar } from '@mui/material';

const SalesmanDashboard = () => {
    const [orders, setOrders] = useState([]);
    const [deliverOrder, setDeliverOrder] = useState(null);
    const [collectedAmount, setCollectedAmount] = useState(0);
    const [message, setMessage] = useState({ type: 'success', text: '' });
    const [openSnackbar, setOpenSnackbar] = useState(false);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const response = await api.get('/salesman/pending-orders');
            setOrders(response.data);
        } catch (error) {
            console.error("Failed to fetch pending orders:", error);
        }
    };

    const handleConfirmOrder = async (orderId) => {
        try {
            await api.post('/salesman/confirm-order', { order_id: orderId });
            setMessage({ type: 'success', text: 'Order confirmed! It is now with the warehouse manager.' });
            setOpenSnackbar(true);
            fetchOrders();
        } catch (error) {
            console.error("Failed to confirm order:", error);
            setMessage({ type: 'error', text: 'Failed to confirm order.' });
            setOpenSnackbar(true);
        }
    };

    const handleRemoveOrder = (orderId) => {
        setOrders(orders.filter(order => order.id !== orderId));
        setMessage({ type: 'info', text: 'Order dismissed from view.' });
        setOpenSnackbar(true);
    };

    const openDeliverDialog = (order) => {
        setDeliverOrder(order);
        setCollectedAmount(order.remaining_payment);
    };

    const handleDeliverOrder = async () => {
        if (!deliverOrder) return;
        try {
            await api.post('/salesman/deliver-order', {
                order_id: deliverOrder.id,
                collected_amount: parseFloat(collectedAmount)
            });
            setMessage({ type: 'success', text: 'Order delivered and payment collected!' });
            setOpenSnackbar(true);
            setDeliverOrder(null);
            fetchOrders();
        } catch (error) {
            console.error("Failed to deliver order:", error);
            setMessage({ type: 'error', text: error.response?.data?.detail || 'Failed to deliver order.' });
            setOpenSnackbar(true);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'dispatched': return 'info';
            case 'placed': return 'warning';
            default: return 'default';
        }
    };

    return (
        <Container sx={{ mt: 4 }}>
            <Box display="flex" alignItems="center" gap={2} sx={{ mb: 4 }}>
                <Avatar sx={{ bgcolor: '#1976d2', width: 56, height: 56 }}>S</Avatar>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                    Salesman Dashboard
                </Typography>
            </Box>
            <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
                <Typography variant="h6" gutterBottom>Order Management</Typography>
                <Table>
                    <TableHead>
                        <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                            <TableCell><b>ID</b></TableCell>
                            <TableCell><b>Shopkeeper</b></TableCell>
                            <TableCell><b>Product</b></TableCell>
                            <TableCell align="right"><b>Qty</b></TableCell>
                            <TableCell align="right"><b>Total</b></TableCell>
                            <TableCell align="right"><b>Remaining</b></TableCell>
                            <TableCell align="center"><b>Status</b></TableCell>
                            <TableCell align="center"><b>Actions</b></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {orders.length === 0 ? (
                            <TableRow><TableCell colSpan={8} align="center">No pending tasks.</TableCell></TableRow>
                        ) : (
                            orders.map((order) => (
                                <TableRow key={order.id} hover>
                                    <TableCell>{order.id}</TableCell>
                                    <TableCell>
                                        <Box display="flex" alignItems="center" gap={1}>
                                            <Avatar
                                                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${order.username}`}
                                                sx={{ width: 32, height: 32 }}
                                            />
                                            {order.username}
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Box display="flex" alignItems="center" gap={1}>
                                            <Avatar
                                                src={getProductImage(order.product_name)}
                                                variant="rounded"
                                                sx={{ width: 32, height: 32, bgcolor: '#f5f5f5' }}
                                            >
                                                {order.product_name[0]?.toUpperCase()}
                                            </Avatar>
                                            {order.product_name}
                                        </Box>
                                    </TableCell>
                                    <TableCell align="right">{order.quantity}</TableCell>
                                    <TableCell align="right">Rs {order.total_amount}</TableCell>
                                    <TableCell align="right" sx={{ color: 'error.main', fontWeight: 'bold' }}>
                                        Rs {order.remaining_payment}
                                    </TableCell>
                                    <TableCell align="center">
                                        <Chip
                                            label={order.status.toUpperCase()}
                                            color={getStatusColor(order.status)}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell align="center">
                                        <Stack direction="row" spacing={1} justifyContent="center">
                                            {order.status === 'placed' && (
                                                <Button
                                                    variant="contained"
                                                    color="primary"
                                                    size="small"
                                                    onClick={() => handleConfirmOrder(order.id)}
                                                >
                                                    Confirm Order
                                                </Button>
                                            )}
                                            {order.status === 'dispatched' && (
                                                <Button
                                                    variant="contained"
                                                    color="success"
                                                    size="small"
                                                    onClick={() => openDeliverDialog(order)}
                                                >
                                                    Deliver & Pay
                                                </Button>
                                            )}
                                            <IconButton onClick={() => handleRemoveOrder(order.id)} color="error" size="small">
                                                <DeleteIcon />
                                            </IconButton>
                                        </Stack>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </Paper>

            <Dialog open={!!deliverOrder} onClose={() => setDeliverOrder(null)}>
                <DialogTitle>Complete Delivery: Order #{deliverOrder?.id}</DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 1 }}>
                        <Typography variant="body1" gutterBottom>
                            Collect remaining payment from <b>{deliverOrder?.username}</b>
                        </Typography>
                        <Typography variant="h6" color="primary" gutterBottom>
                            Due: Rs {deliverOrder?.remaining_payment}
                        </Typography>
                        <TextField
                            label="Collected Amount"
                            type="number"
                            fullWidth
                            margin="normal"
                            value={collectedAmount}
                            onChange={(e) => setCollectedAmount(e.target.value)}
                            InputProps={{ inputProps: { step: 0.01 } }}
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeliverOrder(null)}>Cancel</Button>
                    <Button onClick={handleDeliverOrder} variant="contained" color="success">Verify & Deliver</Button>
                </DialogActions>
            </Dialog>

            <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={() => setOpenSnackbar(false)}>
                <Alert severity={message.type} onClose={() => setOpenSnackbar(false)}>
                    {message.text}
                </Alert>
            </Snackbar>
        </Container>
    );
};

export default SalesmanDashboard;

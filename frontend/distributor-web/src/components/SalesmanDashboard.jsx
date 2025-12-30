import React, { useState, useEffect } from 'react';
import { Container, Typography, Table, TableBody, TableCell, TableHead, TableRow, Button, Paper, TextField, Dialog, DialogActions, DialogContent, DialogTitle, Snackbar, Alert } from '@mui/material';
import api from '../services/api';

const SalesmanDashboard = () => {
    const [orders, setOrders] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [remainingPayment, setRemainingPayment] = useState(0);
    const [message, setMessage] = useState('');
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

    const handleConfirmClick = (order) => {
        setSelectedOrder(order);
        setRemainingPayment(order.remaining_payment); // Pre-fill with actual remaining amount
    };

    const handleConfirmOrder = async () => {
        if (!selectedOrder) return;
        try {
            await api.post('/salesman/confirm-order', {
                order_id: selectedOrder.id,
                remaining_payment_collected: parseFloat(remainingPayment)
            });
            setMessage('Order confirmed!');
            setOpenSnackbar(true);
            setSelectedOrder(null);
            fetchOrders();
        } catch (error) {
            console.error("Failed to confirm order:", error);
            setMessage('Failed to confirm order.');
            setOpenSnackbar(true);
        }
    };

    return (
        <Container sx={{ mt: 4 }}>
            <Typography variant="h4" gutterBottom>Salesman Dashboard</Typography>
            <Paper sx={{ p: 3 }}>
                <Typography variant="h6">Pending Orders</Typography>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>ID</TableCell>
                            <TableCell>Date</TableCell>
                            <TableCell>Shopkeeper</TableCell>
                            <TableCell>Product</TableCell>
                            <TableCell>Quantity</TableCell>
                            <TableCell>Total</TableCell>
                            <TableCell>Advance</TableCell>
                            <TableCell>Remaining</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Action</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {orders.map((order) => (
                            <TableRow key={order.id}>
                                <TableCell>{order.id}</TableCell>
                                <TableCell>{new Date(order.created_at).toLocaleDateString()}</TableCell>
                                <TableCell>{order.username}</TableCell>
                                <TableCell>{order.product_name}</TableCell>
                                <TableCell>{order.quantity}</TableCell>
                                <TableCell>${order.total_amount}</TableCell>
                                <TableCell>${order.advance_payment}</TableCell>
                                <TableCell>${order.remaining_payment}</TableCell>
                                <TableCell>{order.status}</TableCell>
                                <TableCell>
                                    <Button variant="contained" color="primary" size="small" onClick={() => handleConfirmClick(order)}>
                                        Confirm
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Paper>

            <Dialog open={!!selectedOrder} onClose={() => setSelectedOrder(null)}>
                <DialogTitle>Confirm Order #{selectedOrder?.id}</DialogTitle>
                <DialogContent>
                    <Typography gutterBottom>
                        <strong>Product:</strong> {selectedOrder?.product_name}<br />
                        <strong>Total Amount:</strong> ${selectedOrder?.total_amount}<br />
                        <strong>Already Paid:</strong> ${selectedOrder?.advance_payment}<br />
                        <strong>Remaining Due:</strong> ${selectedOrder?.remaining_payment}
                    </Typography>
                    <TextField
                        label="Remaining Payment Collected"
                        type="number"
                        fullWidth
                        margin="normal"
                        value={remainingPayment}
                        onChange={(e) => setRemainingPayment(e.target.value)}
                        helperText={`Amount to collect now. Default is full remaining: $${selectedOrder?.remaining_payment}`}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setSelectedOrder(null)}>Cancel</Button>
                    <Button onClick={handleConfirmOrder} variant="contained" color="primary">Confirm Order</Button>
                </DialogActions>
            </Dialog>

            <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={() => setOpenSnackbar(false)}>
                <Alert severity="success" onClose={() => setOpenSnackbar(false)}>{message}</Alert>
            </Snackbar>
        </Container>
    );
};

export default SalesmanDashboard;

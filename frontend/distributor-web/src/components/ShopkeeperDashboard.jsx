import React, { useState, useEffect } from 'react';
import {
    Container,
    Typography,
    TextField,
    Button,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Paper,
    Alert,
    Snackbar,
    Box,
    Chip,
    Grid,
    InputAdornment,
    IconButton,
    Tooltip
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import api from '../services/api';

const PRICE_PER_UNIT = 100;

const ShopkeeperDashboard = () => {
    const [orders, setOrders] = useState([]);
    const [newOrder, setNewOrder] = useState({ product_name: '', quantity: 1, advance_payment: 0 });
    const [message, setMessage] = useState({ type: '', text: '' });
    const [openSnackbar, setOpenSnackbar] = useState(false);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const response = await api.get('/orders/my-orders');
            setOrders(response.data);
        } catch (error) {
            console.error("Failed to fetch orders:", error);
            setMessage({ type: 'error', text: 'Failed to fetch order history.' });
            setOpenSnackbar(true);
        }
    };

    const handleDownloadInvoice = async (orderId) => {
        try {
            const response = await api.get(`/orders/${orderId}/invoice`, {
                responseType: 'blob' // Important for file handling
            });

            // Create a URL for the blob
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `invoice_${orderId}.pdf`); // Filename
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error("Failed to download invoice:", error);
            setMessage({ type: 'error', text: 'Failed to download invoice.' });
            setOpenSnackbar(true);
        }
    };

    const calculatedTotal = newOrder.quantity * PRICE_PER_UNIT;
    const maxAdvance = calculatedTotal * 0.6;

    const handleCreateOrder = async (e) => {
        e.preventDefault();

        if (newOrder.advance_payment > maxAdvance) {
            setMessage({ type: 'error', text: `Advance payment cannot exceed 60% of total amount (Max: ₹${maxAdvance})` });
            setOpenSnackbar(true);
            return;
        }

        try {
            await api.post('/orders/', newOrder);
            setMessage({ type: 'success', text: 'Order placed successfully!' });
            setNewOrder({ product_name: '', quantity: 1, advance_payment: 0 });
            fetchOrders();
            setOpenSnackbar(true);
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to place order. ' + (error.response?.data?.detail || '') });
            setOpenSnackbar(true);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'delivered': return 'success';
            case 'dispatched': return 'info';
            case 'confirmed': return 'primary';
            case 'placed': return 'warning';
            default: return 'default';
        }
    };

    return (
        <Container sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                Shopkeeper Dashboard
            </Typography>

            {/* Place Order Section */}
            <Paper elevation={3} sx={{ p: 4, mb: 5, borderRadius: 2 }}>
                <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
                    Place New Order
                </Typography>
                <form onSubmit={handleCreateOrder}>
                    <Grid container spacing={3}>
                        <Grid item xs={12} sm={4}>
                            <TextField
                                label="Product Name"
                                fullWidth
                                value={newOrder.product_name}
                                onChange={(e) => setNewOrder({ ...newOrder, product_name: e.target.value })}
                                required
                                variant="outlined"
                            />
                        </Grid>
                        <Grid item xs={12} sm={3}>
                            <TextField
                                label="Quantity"
                                type="number"
                                fullWidth
                                value={newOrder.quantity}
                                onChange={(e) => {
                                    const qty = Math.max(1, parseInt(e.target.value) || 0);
                                    setNewOrder({ ...newOrder, quantity: qty });
                                }}
                                required
                                InputProps={{ inputProps: { min: 1 } }}
                                helperText={`Total Cost: ₹${calculatedTotal}`}
                            />
                        </Grid>
                        <Grid item xs={12} sm={3}>
                            <TextField
                                label="Advance Payment"
                                type="number"
                                fullWidth
                                value={newOrder.advance_payment}
                                onChange={(e) => setNewOrder({ ...newOrder, advance_payment: parseFloat(e.target.value) || 0 })}
                                required
                                InputProps={{
                                    startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                                    inputProps: { min: 0, max: maxAdvance }
                                }}
                                helperText={`Max: ₹${maxAdvance} (60%)`}
                            />
                        </Grid>
                        <Grid item xs={12} sm={2} sx={{ display: 'flex', alignItems: 'flex-start' }}>
                            <Button
                                type="submit"
                                variant="contained"
                                size="large"
                                fullWidth
                                sx={{ height: '56px', fontWeight: 'bold' }}
                            >
                                ORDER
                            </Button>
                        </Grid>
                    </Grid>
                </form>
            </Paper>

            {/* Order History Section */}
            <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
                <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
                    My Orders
                </Typography>
                <Table>
                    <TableHead>
                        <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                            <TableCell><b>ID</b></TableCell>
                            <TableCell><b>Product</b></TableCell>
                            <TableCell align="right"><b>Quantity</b></TableCell>
                            <TableCell align="right"><b>Total Amount</b></TableCell>
                            <TableCell align="right"><b>Advance Paid</b></TableCell>
                            <TableCell align="right"><b>Remaining</b></TableCell>
                            <TableCell align="center"><b>Status</b></TableCell>
                            <TableCell align="center"><b>Invoice</b></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {orders.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} align="center">No orders found.</TableCell>
                            </TableRow>
                        ) : (
                            orders.map((order) => (
                                <TableRow key={order.id} hover>
                                    <TableCell>{order.id}</TableCell>
                                    <TableCell>{order.product_name}</TableCell>
                                    <TableCell align="right">{order.quantity}</TableCell>
                                    <TableCell align="right">₹{order.total_amount}</TableCell>
                                    <TableCell align="right">₹{order.advance_payment}</TableCell>
                                    <TableCell align="right" sx={{ color: order.remaining_payment > 0 ? 'error.main' : 'green' }}>
                                        ₹{order.remaining_payment}
                                    </TableCell>
                                    <TableCell align="center">
                                        <Chip
                                            label={order.status.toUpperCase()}
                                            color={getStatusColor(order.status)}
                                            size="small"
                                            variant="outlined"
                                        />
                                    </TableCell>
                                    <TableCell align="center">
                                        <Tooltip title="Download Invoice">
                                            <IconButton onClick={() => handleDownloadInvoice(order.id)} color="primary">
                                                <DownloadIcon />
                                            </IconButton>
                                        </Tooltip>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </Paper>

            <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={() => setOpenSnackbar(false)}>
                <Alert severity={message.type === 'success' ? 'success' : 'error'} onClose={() => setOpenSnackbar(false)}>
                    {message.text}
                </Alert>
            </Snackbar>
        </Container>
    );
};

export default ShopkeeperDashboard;

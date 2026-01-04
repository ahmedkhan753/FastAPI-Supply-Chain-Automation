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
    Tooltip,
    MenuItem
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import api from '../services/api';

const PRODUCT_PRICES = {
    "candy": 100,
    "snacks": 150,
    "chocolates": 200,
    "biscuits": 250,
    "cold_drinks": 50,
    "chewing_gums": 30,
    "juices": 120,
    "jelly": 80
};

const ShopkeeperDashboard = () => {
    const [orders, setOrders] = useState([]);
    const [newOrder, setNewOrder] = useState({ product_name: 'candy', quantity: 1, advance_payment: 0 });
    const [message, setMessage] = useState({ type: 'success', text: '' });
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
        }
    };

    const handleDownloadInvoice = async (orderId) => {
        try {
            const response = await api.get(`/orders/${orderId}/invoice`, {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `invoice_${orderId}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error("Failed to download invoice:", error);
            setMessage({ type: 'error', text: 'Failed to download invoice.' });
            setOpenSnackbar(true);
        }
    };

    const calculatedTotal = newOrder.quantity * (PRODUCT_PRICES[newOrder.product_name] || 0);
    const maxAdvance = calculatedTotal * 0.6;

    const handleCreateOrder = async (e) => {
        e.preventDefault();
        if (newOrder.advance_payment > maxAdvance) {
            setMessage({ type: 'error', text: `Advance payment cannot exceed 60% (Max: ₹${maxAdvance})` });
            setOpenSnackbar(true);
            return;
        }
        try {
            await api.post('/orders/', newOrder);
            setMessage({ type: 'success', text: 'Order placed successfully!' });
            setNewOrder({ product_name: 'candy', quantity: 1, advance_payment: 0 });
            fetchOrders();
            setOpenSnackbar(true);
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.detail || 'Failed to place order.' });
            setOpenSnackbar(true);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'delivered': return 'success';
            case 'dispatched': return 'info';
            case 'confirmed': return 'primary';
            case 'placed': return 'warning';
            case 'stock_requested': return 'secondary';
            case 'payment_requested': return 'error';
            case 'paid_to_manufacturer': return 'secondary';
            default: return 'default';
        }
    };

    return (
        <Container sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                Shopkeeper Dashboard
            </Typography>

            <Paper elevation={3} sx={{ p: 4, mb: 5, borderRadius: 2 }}>
                <Typography variant="h6" gutterBottom>Place New Order</Typography>
                <form onSubmit={handleCreateOrder}>
                    <Grid container spacing={3}>
                        <Grid item xs={12} sm={4}>
                            <TextField
                                select
                                label="Product"
                                fullWidth
                                value={newOrder.product_name}
                                onChange={(e) => setNewOrder({ ...newOrder, product_name: e.target.value })}
                                required
                            >
                                {Object.keys(PRODUCT_PRICES).map((product) => (
                                    <MenuItem key={product} value={product}>
                                        {product.replace(/_/g, ' ').toUpperCase()} (₹{PRODUCT_PRICES[product]}/unit)
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid item xs={12} sm={3}>
                            <TextField
                                label="Quantity"
                                type="number"
                                fullWidth
                                value={newOrder.quantity}
                                onChange={(e) => setNewOrder({ ...newOrder, quantity: Math.max(1, parseInt(e.target.value) || 0) })}
                                required
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
                                    startAdornment: <InputAdornment position="start">₹</InputAdornment>
                                }}
                                helperText={`Max (60%): ₹${maxAdvance.toFixed(2)}`}
                            />
                        </Grid>
                        <Grid item xs={12} sm={2} sx={{ display: 'flex', alignItems: 'flex-start' }}>
                            <Button type="submit" variant="contained" size="large" fullWidth sx={{ height: '56px', fontWeight: 'bold' }}>
                                ORDER
                            </Button>
                        </Grid>
                    </Grid>
                </form>
            </Paper>

            <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
                <Typography variant="h6" gutterBottom>My Order History</Typography>
                <Table>
                    <TableHead>
                        <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                            <TableCell><b>ID</b></TableCell>
                            <TableCell><b>Product</b></TableCell>
                            <TableCell align="right"><b>Qty</b></TableCell>
                            <TableCell align="right"><b>Total</b></TableCell>
                            <TableCell align="right"><b>Remaining</b></TableCell>
                            <TableCell align="center"><b>Status</b></TableCell>
                            <TableCell align="center"><b>Invoice</b></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {orders.length === 0 ? (
                            <TableRow><TableCell colSpan={7} align="center">No orders yet.</TableCell></TableRow>
                        ) : (
                            orders.map((order) => (
                                <TableRow key={order.id} hover>
                                    <TableCell>{order.id}</TableCell>
                                    <TableCell>{order.product_name.toUpperCase()}</TableCell>
                                    <TableCell align="right">{order.quantity}</TableCell>
                                    <TableCell align="right">₹{order.total_amount}</TableCell>
                                    <TableCell align="right" sx={{ color: order.remaining_payment > 0 ? 'error.main' : 'green', fontWeight: 'bold' }}>
                                        ₹{order.remaining_payment}
                                    </TableCell>
                                    <TableCell align="center">
                                        <Chip
                                            label={order.status.replace(/_/g, ' ').toUpperCase()}
                                            color={getStatusColor(order.status)}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell align="center">
                                        <IconButton onClick={() => handleDownloadInvoice(order.id)} color="primary">
                                            <DownloadIcon />
                                        </IconButton>
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

export default ShopkeeperDashboard;

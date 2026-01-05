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
    MenuItem,
    Stack
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import DeleteIcon from '@mui/icons-material/Delete';
import api from '../services/api';
import { PRODUCT_IMAGES, getProductImage, handleImageError } from '../constants/images';
import { useAuth } from '../context/AuthContext';
import { Avatar } from '@mui/material';

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
    const { user: currentUser } = useAuth();

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

    const handleRemoveOrder = (orderId) => {
        setOrders(orders.filter(order => order.id !== orderId));
        setMessage({ type: 'info', text: 'Order removed from view locally.' });
        setOpenSnackbar(true);
    };

    const calculatedTotal = newOrder.quantity * (PRODUCT_PRICES[newOrder.product_name] || 0);
    const maxAdvance = calculatedTotal * 0.6;

    const handleCreateOrder = async (e) => {
        e.preventDefault();
        if (newOrder.advance_payment > maxAdvance) {
            setMessage({ type: 'error', text: `Advance payment cannot exceed 60% (Max: Rs ${maxAdvance})` });
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
            <Box display="flex" alignItems="center" gap={2} sx={{ mb: 4 }}>
                <Avatar
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.username}`}
                    sx={{ width: 64, height: 64, border: '3px solid #1976d2' }}
                />
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1976d2', lineHeight: 1 }}>
                        Shopkeeper Dashboard
                    </Typography>
                    <Typography variant="subtitle1" color="textSecondary">
                        Welcome back, {currentUser.username}
                    </Typography>
                </Box>
            </Box>

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
                                        <Box display="flex" alignItems="center" gap={1}>
                                            <Avatar
                                                src={getProductImage(product)}
                                                variant="rounded"
                                                sx={{ width: 24, height: 24, bgcolor: '#f0f0f0' }}
                                            >
                                                {product[0]?.toUpperCase()}
                                            </Avatar>
                                            {product.replace(/_/g, ' ').toUpperCase()} (Rs {PRODUCT_PRICES[product]}/unit)
                                        </Box>
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
                                helperText={`Total Cost: Rs ${calculatedTotal}`}
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
                                    startAdornment: <InputAdornment position="start">Rs</InputAdornment>
                                }}
                                helperText={`Max (60%): Rs ${maxAdvance.toFixed(2)}`}
                            />
                        </Grid>
                        <Grid item xs={12} sm={2} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                            <Avatar
                                src={getProductImage(newOrder.product_name)}
                                variant="rounded"
                                sx={{ width: '100%', height: '56px', borderRadius: 2, mb: 1, border: '1px solid #ddd', bgcolor: '#f5f5f5' }}
                            >
                                {newOrder.product_name[0]?.toUpperCase()}
                            </Avatar>
                            <Button type="submit" variant="contained" size="large" fullWidth sx={{ fontWeight: 'bold' }}>
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
                            <TableCell align="center"><b>Actions</b></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {orders.length === 0 ? (
                            <TableRow><TableCell colSpan={7} align="center">No orders yet.</TableCell></TableRow>
                        ) : (
                            orders.map((order) => (
                                <TableRow key={order.id} hover>
                                    <TableCell>{order.id}</TableCell>
                                    <TableCell>
                                        <Box display="flex" alignItems="center" gap={2}>
                                            <Avatar
                                                src={getProductImage(order.product_name)}
                                                variant="rounded"
                                                sx={{ width: 40, height: 40, bgcolor: '#e3f2fd', color: '#1976d2', fontWeight: 'bold' }}
                                            >
                                                {order.product_name[0]?.toUpperCase()}
                                            </Avatar>
                                            {order.product_name.toUpperCase()}
                                        </Box>
                                    </TableCell>
                                    <TableCell align="right">{order.quantity}</TableCell>
                                    <TableCell align="right">Rs {order.total_amount}</TableCell>
                                    <TableCell align="right" sx={{ color: order.remaining_payment > 0 ? 'error.main' : 'green', fontWeight: 'bold' }}>
                                        Rs {order.remaining_payment}
                                    </TableCell>
                                    <TableCell align="center">
                                        <Chip
                                            label={order.status.replace(/_/g, ' ').toUpperCase()}
                                            color={getStatusColor(order.status)}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell align="center">
                                        <Stack direction="row" spacing={1} justifyContent="center">
                                            <IconButton onClick={() => handleDownloadInvoice(order.id)} color="primary">
                                                <DownloadIcon />
                                            </IconButton>
                                            <IconButton onClick={() => handleRemoveOrder(order.id)} color="error">
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

            <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={() => setOpenSnackbar(false)}>
                <Alert severity={message.type} onClose={() => setOpenSnackbar(false)}>
                    {message.text}
                </Alert>
            </Snackbar>
        </Container>
    );
};

export default ShopkeeperDashboard;

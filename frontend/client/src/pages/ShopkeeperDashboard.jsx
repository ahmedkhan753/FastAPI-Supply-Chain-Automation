import React, { useState, useEffect } from 'react';
import {
    Typography,
    Grid,
    Paper,
    TextField,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Card,
    CardContent,
    CardHeader,
    Chip
} from '@mui/material';
import { orderAPI } from '../services/api';
import { useSnackbar } from 'notistack';
import LoadingSpinner from '../components/LoadingSpinner';

const ShopkeeperDashboard = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [newOrder, setNewOrder] = useState({
        total_amount: '',
        advance_payment: ''
    });
    const { enqueueSnackbar } = useSnackbar();

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const response = await orderAPI.getMyOrders();
            setOrders(response.data);
        } catch (error) {
            console.error('Error fetching orders:', error);
            enqueueSnackbar('Failed to load orders', { variant: 'error' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const handleInputChange = (e) => {
        setNewOrder({
            ...newOrder,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (parseFloat(newOrder.advance_payment) > parseFloat(newOrder.total_amount)) {
            enqueueSnackbar('Advance payment cannot be greater than total amount', { variant: 'warning' });
            return;
        }

        try {
            await orderAPI.createOrder({
                total_amount: parseFloat(newOrder.total_amount),
                advance_payment: parseFloat(newOrder.advance_payment)
            });
            enqueueSnackbar('Order placed successfully!', { variant: 'success' });
            setNewOrder({ total_amount: '', advance_payment: '' });
            fetchOrders();
        } catch (error) {
            console.error('Error creating order:', error);
            enqueueSnackbar('Failed to place order', { variant: 'error' });
        }
    };

    return (
        <Grid container spacing={3}>
            {loading && <LoadingSpinner />}

            {/* Order Placement Form */}
            <Grid item xs={12} md={4}>
                <Card elevation={3}>
                    <CardHeader title="Place New Order" />
                    <CardContent>
                        <form onSubmit={handleSubmit}>
                            <TextField
                                fullWidth
                                margin="normal"
                                label="Total Amount"
                                name="total_amount"
                                type="number"
                                value={newOrder.total_amount}
                                onChange={handleInputChange}
                                required
                            />
                            <TextField
                                fullWidth
                                margin="normal"
                                label="Advance Payment"
                                name="advance_payment"
                                type="number"
                                value={newOrder.advance_payment}
                                onChange={handleInputChange}
                                required
                            />
                            <Button
                                type="submit"
                                variant="contained"
                                color="primary"
                                fullWidth
                                sx={{ mt: 2 }}
                            >
                                Place Order
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </Grid>

            {/* Orders List */}
            <Grid item xs={12} md={8}>
                <Paper elevation={3} sx={{ p: 2 }}>
                    <Typography variant="h6" gutterBottom>
                        My Orders
                    </Typography>
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Order ID</TableCell>
                                    <TableCell>Total</TableCell>
                                    <TableCell>Advance</TableCell>
                                    <TableCell>Remaining</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell>Fully Paid</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {orders.map((order) => (
                                    <TableRow key={order.id} hover>
                                        <TableCell>#{order.id}</TableCell>
                                        <TableCell>${order.total_amount}</TableCell>
                                        <TableCell>${order.advance_payment}</TableCell>
                                        <TableCell>${order.remaining_amount}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={order.status}
                                                color={order.status === 'dispatched' ? 'success' : order.status === 'placed' ? 'warning' : 'default'}
                                                size="small"
                                                sx={{ textTransform: 'uppercase' }}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={order.fully_paid ? 'Yes' : 'No'}
                                                color={order.fully_paid ? 'success' : 'error'}
                                                size="small"
                                                variant="outlined"
                                            />
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {orders.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={6} align="center">No orders found</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>
            </Grid>
        </Grid>
    );
};

export default ShopkeeperDashboard;

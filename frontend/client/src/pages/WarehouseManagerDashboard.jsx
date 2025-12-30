import React, { useState, useEffect } from 'react';
import {
    Typography,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Stack
} from '@mui/material';
import { warehouseAPI } from '../services/api';
import { useSnackbar } from 'notistack';
import LoadingSpinner from '../components/LoadingSpinner';

const WarehouseManagerDashboard = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const { enqueueSnackbar } = useSnackbar();

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const response = await warehouseAPI.getConfirmedOrders();
            setOrders(response.data);
        } catch (error) {
            console.error('Error fetching confirmed orders:', error);
            enqueueSnackbar('Failed to load confirmed orders', { variant: 'error' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const handleProcessOrder = async (orderId, action) => {
        try {
            await warehouseAPI.processOrder({
                order_id: orderId,
                action: action
            });
            enqueueSnackbar(
                action === 'dispatch' ? 'Order dispatched successfully!' : 'Stock requested from manufacturer',
                { variant: 'success' }
            );
            fetchOrders();
        } catch (error) {
            console.error(`Error processing order (${action}):`, error);
            enqueueSnackbar(`Failed to process order: ${action}`, { variant: 'error' });
        }
    };

    return (
        <>
            {loading && <LoadingSpinner />}
            <Typography variant="h5" gutterBottom>
                Confirmed Orders (Ready for Processing)
            </Typography>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Order ID</TableCell>
                            <TableCell>Total Amount</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {orders.map((order) => (
                            <TableRow key={order.id}>
                                <TableCell>#{order.id}</TableCell>
                                <TableCell>${order.total_amount}</TableCell>
                                <TableCell>{order.status}</TableCell>
                                <TableCell>
                                    <Stack direction="row" spacing={2}>
                                        <Button
                                            variant="contained"
                                            color="success"
                                            size="small"
                                            onClick={() => handleProcessOrder(order.id, 'dispatch')}
                                        >
                                            Dispatch
                                        </Button>
                                        <Button
                                            variant="outlined"
                                            color="secondary"
                                            size="small"
                                            onClick={() => handleProcessOrder(order.id, 'request_stock')}
                                        >
                                            Request Stock
                                        </Button>
                                    </Stack>
                                </TableCell>
                            </TableRow>
                        ))}
                        {orders.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={4} align="center">No confirmed orders</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </>
    );
};

export default WarehouseManagerDashboard;

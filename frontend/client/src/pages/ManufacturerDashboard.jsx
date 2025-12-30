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
    Paper
} from '@mui/material';
import { manufacturerAPI } from '../services/api';
import { useSnackbar } from 'notistack';
import LoadingSpinner from '../components/LoadingSpinner';

const ManufacturerDashboard = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const { enqueueSnackbar } = useSnackbar();

    const fetchStockRequests = async () => {
        setLoading(true);
        try {
            const response = await manufacturerAPI.getStockRequests();
            setOrders(response.data);
        } catch (error) {
            console.error('Error fetching stock requests:', error);
            enqueueSnackbar('Failed to load stock requests', { variant: 'error' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStockRequests();
    }, []);

    const handleShipStock = async (orderId) => {
        try {
            await manufacturerAPI.shipStock(orderId);
            enqueueSnackbar('Stock shipped successfully!', { variant: 'success' });
            fetchStockRequests();
        } catch (error) {
            console.error('Error shipping stock:', error);
            enqueueSnackbar('Failed to ship stock', { variant: 'error' });
        }
    };

    return (
        <>
            {loading && <LoadingSpinner />}
            <Typography variant="h5" gutterBottom>
                Stock Requests
            </Typography>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Order ID</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Action</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {orders.map((order) => (
                            <TableRow key={order.id}>
                                <TableCell>#{order.id}</TableCell>
                                <TableCell>{order.status}</TableCell>
                                <TableCell>
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        onClick={() => handleShipStock(order.id)}
                                    >
                                        Ship Stock
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                        {orders.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={3} align="center">No stock requests</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </>
    );
};

export default ManufacturerDashboard;

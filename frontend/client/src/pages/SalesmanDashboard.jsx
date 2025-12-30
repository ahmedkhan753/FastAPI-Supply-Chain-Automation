import React, { useState, useEffect } from 'react';
import {
    Typography,
    Grid,
    Paper,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField
} from '@mui/material';
import { salesmanAPI } from '../services/api';
import { useSnackbar } from 'notistack';
import LoadingSpinner from '../components/LoadingSpinner';

const SalesmanDashboard = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [openModal, setOpenModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [collectedAmount, setCollectedAmount] = useState('');
    const { enqueueSnackbar } = useSnackbar();

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const response = await salesmanAPI.getPendingOrders();
            setOrders(response.data);
        } catch (error) {
            console.error('Error fetching pending orders:', error);
            enqueueSnackbar('Failed to load pending orders', { variant: 'error' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const handleOpenModal = (order) => {
        setSelectedOrder(order);
        setCollectedAmount(''); // Reset
        setOpenModal(true);
    };

    const handleCloseModal = () => {
        setOpenModal(false);
        setSelectedOrder(null);
    };

    const handleConfirmPayment = async () => {
        if (!selectedOrder) return;

        if (parseFloat(collectedAmount) !== parseFloat(selectedOrder.remaining_amount)) {
            enqueueSnackbar(`Collected amount must be exactly ${selectedOrder.remaining_amount}`, { variant: 'warning' });
            return;
        }

        try {
            await salesmanAPI.confirmOrder({
                order_id: selectedOrder.id,
                remaining_payment_collected: parseFloat(collectedAmount)
            });
            enqueueSnackbar('Order confirmed and payment collected!', { variant: 'success' });
            handleCloseModal();
            fetchOrders();
        } catch (error) {
            console.error('Error confirming order:', error);
            enqueueSnackbar('Failed to confirm order', { variant: 'error' });
        }
    };

    return (
        <>
            {loading && <LoadingSpinner />}
            <Typography variant="h5" gutterBottom>
                Pending Orders
            </Typography>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Order ID</TableCell>
                            <TableCell>Shopkeeper</TableCell>
                            <TableCell>Total Amount</TableCell>
                            <TableCell>Remaining Payment</TableCell>
                            <TableCell>Action</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {orders.map((order) => (
                            <TableRow key={order.id}>
                                <TableCell>#{order.id}</TableCell>
                                <TableCell>{order.shopkeeper_id} (ID)</TableCell>
                                {/* Note: In real app, might want to resolve username if backend sends it, or just show ID */}
                                <TableCell>${order.total_amount}</TableCell>
                                <TableCell>${order.remaining_amount}</TableCell>
                                <TableCell>
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        size="small"
                                        onClick={() => handleOpenModal(order)}
                                    >
                                        Confirm & Collect
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                        {orders.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} align="center">No pending orders</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Payment Collection Modal */}
            <Dialog open={openModal} onClose={handleCloseModal}>
                <DialogTitle>Collect Payment</DialogTitle>
                <DialogContent>
                    <Typography variant="body1" gutterBottom>
                        Order #{selectedOrder?.id}
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                        Remaining Amount to Collect: <strong>${selectedOrder?.remaining_amount}</strong>
                    </Typography>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Amount Collected"
                        type="number"
                        fullWidth
                        variant="outlined"
                        value={collectedAmount}
                        onChange={(e) => setCollectedAmount(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseModal}>Cancel</Button>
                    <Button onClick={handleConfirmPayment} variant="contained" color="primary">
                        Confirm Payment
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default SalesmanDashboard;

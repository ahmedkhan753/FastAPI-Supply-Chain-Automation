import React, { useState, useEffect } from 'react';
import {
    Container,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Button,
    Paper,
    Snackbar,
    Alert,
    Grid,
    Card,
    CardContent,
    Box,
    Chip,
    Stack
} from '@mui/material';
import api from '../services/api';

const WarehouseDashboard = () => {
    const [pendingOrders, setPendingOrders] = useState([]);
    const [stock, setStock] = useState([]);
    const [message, setMessage] = useState({ type: 'success', text: '' });
    const [openSnackbar, setOpenSnackbar] = useState(false);

    useEffect(() => {
        fetchAllData();
    }, []);

    const fetchAllData = () => {
        fetchPendingActions();
        fetchStock();
    };

    const fetchPendingActions = async () => {
        try {
            const response = await api.get('/warehouse/pending-actions');
            setPendingOrders(response.data);
        } catch (error) {
            console.error("Failed to fetch pending actions:", error);
        }
    };

    const fetchStock = async () => {
        try {
            const response = await api.get('/warehouse/stock');
            setStock(response.data);
        } catch (error) {
            console.error("Failed to fetch stock:", error);
        }
    };

    const handleProcessOrder = async (orderId, action) => {
        try {
            await api.post('/warehouse/process-order', {
                order_id: orderId,
                action: action
            });
            setMessage({ type: 'success', text: `Order ${action === 'dispatch' ? 'dispatched' : 'stock requested'} successfully!` });
            setOpenSnackbar(true);
            fetchAllData();
        } catch (error) {
            console.error(`Failed to ${action} order:`, error);
            setMessage({ type: 'error', text: `Failed to ${action} order. ${error.response?.data?.detail || ''}` });
            setOpenSnackbar(true);
        }
    };

    const handlePayManufacturer = async (orderId) => {
        try {
            await api.post('/warehouse/pay-manufacturer', { order_id: orderId });
            setMessage({ type: 'success', text: 'Payment sent to manufacturer!' });
            setOpenSnackbar(true);
            fetchAllData();
        } catch (error) {
            console.error("Failed to pay manufacturer:", error);
            setMessage({ type: 'error', text: 'Failed to send payment.' });
            setOpenSnackbar(true);
        }
    };

    const handleDownloadInvoice = async (orderId) => {
        try {
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
            case 'confirmed': return 'primary';
            case 'stock_requested': return 'info';
            case 'payment_requested': return 'warning';
            case 'paid_to_manufacturer': return 'secondary';
            default: return 'default';
        }
    };

    return (
        <Container sx={{ mt: 4 }}>
            <Typography variant="h4" gutterBottom sx={{ color: '#2e7d32', fontWeight: 'bold' }}>
                Warehouse Dashboard
            </Typography>

            {/* Stock Overview */}
            <Paper elevation={3} sx={{ p: 3, mb: 4, backgroundColor: '#f1f8e9', borderRadius: 2 }}>
                <Typography variant="h6" gutterBottom>Central Inventory Status</Typography>
                <Grid container spacing={2}>
                    {stock.length === 0 ? <Typography sx={{ p: 2 }}>No inventory data.</Typography> :
                        stock.map((item) => (
                            <Grid item xs={12} sm={6} md={3} key={item.id}>
                                <Card sx={{ height: '100%' }}>
                                    <CardContent>
                                        <Typography color="textSecondary" variant="subtitle2" gutterBottom>
                                            {item.item_name.toUpperCase()}
                                        </Typography>
                                        <Typography variant="h5" component="h2" sx={{ fontWeight: 'bold' }}>
                                            {item.quantity}
                                        </Typography>
                                        <Typography variant="caption" color="textSecondary">units available</Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))
                    }
                </Grid>
            </Paper>

            <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
                <Typography variant="h6" gutterBottom>Orders Requiring Action</Typography>
                <Table>
                    <TableHead>
                        <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                            <TableCell><b>ID</b></TableCell>
                            <TableCell><b>Product</b></TableCell>
                            <TableCell align="right"><b>Qty</b></TableCell>
                            <TableCell><b>Ordered By</b></TableCell>
                            <TableCell align="right"><b>Retail (Shopkeeper)</b></TableCell>
                            <TableCell align="right"><b>Wholesale (Manufacturer)</b></TableCell>
                            <TableCell align="center"><b>Status</b></TableCell>
                            <TableCell align="center"><b>Actions</b></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {pendingOrders.length === 0 ? (
                            <TableRow><TableCell colSpan={8} align="center">No active orders found.</TableCell></TableRow>
                        ) : (
                            pendingOrders.map((order) => (
                                <TableRow key={order.id} hover>
                                    <TableCell>{order.id}</TableCell>
                                    <TableCell>{order.product_name}</TableCell>
                                    <TableCell align="right">{order.quantity}</TableCell>
                                    <TableCell>{order.username}</TableCell>
                                    <TableCell align="right">₹{order.total_amount}</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 'bold', color: 'error.main' }}>
                                        ₹{order.manufacturer_price}
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
                                            {order.status === 'confirmed' && (
                                                <>
                                                    <Button
                                                        variant="contained"
                                                        color="success"
                                                        size="small"
                                                        onClick={() => handleProcessOrder(order.id, 'dispatch')}
                                                    >
                                                        Dispatch
                                                    </Button>
                                                    <Button
                                                        variant="contained"
                                                        color="warning"
                                                        size="small"
                                                        onClick={() => handleProcessOrder(order.id, 'request_stock')}
                                                    >
                                                        Request Stock
                                                    </Button>
                                                </>
                                            )}
                                            {order.status === 'payment_requested' && (
                                                <Stack direction="row" spacing={1}>
                                                    <Button
                                                        variant="contained"
                                                        color="secondary"
                                                        size="small"
                                                        onClick={() => handlePayManufacturer(order.id)}
                                                    >
                                                        Pay Manufacturer
                                                    </Button>
                                                    <Button
                                                        variant="outlined"
                                                        color="info"
                                                        size="small"
                                                        onClick={() => handleDownloadInvoice(order.id)}
                                                    >
                                                        Receipt
                                                    </Button>
                                                </Stack>
                                            )}
                                            {order.status === 'stock_requested' && (
                                                <Typography variant="body2" color="textSecondary">Stock Requested...</Typography>
                                            )}
                                            {order.status === 'paid_to_manufacturer' && (
                                                <Stack direction="row" spacing={1} alignItems="center">
                                                    <Typography variant="body2" color="textSecondary">Paid...</Typography>
                                                    <Button
                                                        variant="text"
                                                        size="small"
                                                        onClick={() => handleDownloadInvoice(order.id)}
                                                    >
                                                        View Invoice
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

export default WarehouseDashboard;

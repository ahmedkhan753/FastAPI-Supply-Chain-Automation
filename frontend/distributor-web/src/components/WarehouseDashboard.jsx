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
    Tabs,
    Tab,
    Box
} from '@mui/material';
import api from '../services/api';

const WarehouseDashboard = () => {
    const [confirmedOrders, setConfirmedOrders] = useState([]);
    const [deliveredOrders, setDeliveredOrders] = useState([]);
    const [stock, setStock] = useState([]);
    const [tabValue, setTabValue] = useState(0);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [openSnackbar, setOpenSnackbar] = useState(false);

    useEffect(() => {
        fetchAllData();
    }, []);

    const fetchAllData = () => {
        fetchConfirmedOrders();
        fetchDeliveredOrders();
        fetchStock();
    };

    const fetchConfirmedOrders = async () => {
        try {
            const response = await api.get('/warehouse/confirmed-orders');
            setConfirmedOrders(response.data);
        } catch (error) {
            console.error("Failed to fetch confirmed orders:", error);
        }
    };

    const fetchDeliveredOrders = async () => {
        try {
            const response = await api.get('/warehouse/Delivered-Orders');
            setDeliveredOrders(response.data);
        } catch (error) {
            console.error("Failed to fetch delivered orders:", error);
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

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    return (
        <Container sx={{ mt: 4 }}>
            <Typography variant="h4" gutterBottom sx={{ color: '#2e7d32', fontWeight: 'bold' }}>
                Warehouse Dashboard
            </Typography>

            {/* Stock Overview */}
            <Paper elevation={3} sx={{ p: 3, mb: 4, backgroundColor: '#e8f5e9' }}>
                <Typography variant="h6" gutterBottom>Current Stock Inventory</Typography>
                <Grid container spacing={2}>
                    {stock.length === 0 ? <Typography sx={{ p: 2 }}>No stock data available.</Typography> :
                        stock.map((item) => (
                            <Grid item xs={12} sm={6} md={3} key={item.id}>
                                <Card>
                                    <CardContent>
                                        <Typography color="textSecondary" gutterBottom>
                                            {item.item_name}
                                        </Typography>
                                        <Typography variant="h5" component="h2">
                                            {item.quantity} Units
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))
                    }
                </Grid>
            </Paper>

            <Box sx={{ width: '100%', mb: 4 }}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs value={tabValue} onChange={handleTabChange} aria-label="warehouse tabs">
                        <Tab label={`New Orders (${confirmedOrders.length})`} />
                        <Tab label={`Ready to Dispatch (${deliveredOrders.length})`} />
                    </Tabs>
                </Box>

                {/* Confirmed Orders Tab */}
                <div role="tabpanel" hidden={tabValue !== 0}>
                    {tabValue === 0 && (
                        <Paper sx={{ p: 3, mt: 2 }}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>ID</TableCell>
                                        <TableCell>Product</TableCell>
                                        <TableCell>Quantity</TableCell>
                                        <TableCell>Customer</TableCell>
                                        <TableCell>Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {confirmedOrders.length === 0 ? (
                                        <TableRow><TableCell colSpan={5} align="center">No new orders.</TableCell></TableRow>
                                    ) : (
                                        confirmedOrders.map((order) => (
                                            <TableRow key={order.id}>
                                                <TableCell>{order.id}</TableCell>
                                                <TableCell>{order.product_name}</TableCell>
                                                <TableCell>{order.quantity}</TableCell>
                                                <TableCell>{order.username}</TableCell>
                                                <TableCell>
                                                    <Button
                                                        variant="contained"
                                                        color="success"
                                                        size="small"
                                                        sx={{ mr: 1 }}
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
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </Paper>
                    )}
                </div>

                {/* Delivered Orders Tab */}
                <div role="tabpanel" hidden={tabValue !== 1}>
                    {tabValue === 1 && (
                        <Paper sx={{ p: 3, mt: 2 }}>
                            <Typography variant="subtitle2" sx={{ mb: 2, color: 'text.secondary' }}>
                                Stock has arrived from manufacturer. Dispatch these to customers.
                            </Typography>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Order ID</TableCell>
                                        <TableCell>Product</TableCell>
                                        <TableCell>Quantity</TableCell>
                                        <TableCell>Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {deliveredOrders.length === 0 ? (
                                        <TableRow><TableCell colSpan={4} align="center">No delivered orders pending dispatch.</TableCell></TableRow>
                                    ) : (
                                        deliveredOrders.map((order) => (
                                            <TableRow key={order.order_id}>
                                                <TableCell>{order.order_id}</TableCell>
                                                <TableCell>{order.product_name}</TableCell>
                                                <TableCell>{order.quantity}</TableCell>
                                                <TableCell>
                                                    <Button
                                                        variant="contained"
                                                        color="primary"
                                                        onClick={() => handleProcessOrder(order.order_id, 'dispatch')}
                                                    >
                                                        Final Dispatch
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </Paper>
                    )}
                </div>
            </Box>

            <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={() => setOpenSnackbar(false)}>
                <Alert severity={message.type === 'success' ? 'success' : 'error'} onClose={() => setOpenSnackbar(false)}>
                    {message.text}
                </Alert>
            </Snackbar>
        </Container>
    );
};

export default WarehouseDashboard;

import React from 'react';
import { Container, Box, Typography, Paper } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import ShopkeeperDashboard from './ShopkeeperDashboard';
import SalesmanDashboard from './SalesmanDashboard';
import WarehouseManagerDashboard from './WarehouseManagerDashboard';
import ManufacturerDashboard from './ManufacturerDashboard';
import Navbar from '../components/Navbar';

const Dashboard = () => {
    const { user } = useAuth();

    const renderDashboard = () => {
        switch (user?.role) {
            case 'shopkeeper':
                return <ShopkeeperDashboard />;
            case 'salesman':
                return <SalesmanDashboard />;
            case 'warehouse_manager':
                return <WarehouseManagerDashboard />;
            case 'manufacturer':
                return <ManufacturerDashboard />;
            default:
                return (
                    <Paper sx={{ p: 3, textAlign: 'center' }}>
                        <Typography variant="h6" color="error">
                            Unknown Role or Unauthorized Access
                        </Typography>
                        <Typography variant="body1">
                            Please contact an administrator if you believe this is an error.
                        </Typography>
                    </Paper>
                );
        }
    };

    return (
        <>
            <Navbar />
            <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h4" component="h1" gutterBottom>
                        Dashboard
                    </Typography>
                    <Typography variant="subtitle1" color="text.secondary">
                        Role: <strong>{user?.role?.replace('_', ' ')}</strong>
                    </Typography>
                </Box>
                {renderDashboard()}
            </Container>
        </>
    );
};

export default Dashboard;

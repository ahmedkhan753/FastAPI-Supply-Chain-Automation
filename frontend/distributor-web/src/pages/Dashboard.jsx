import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Container, Typography } from '@mui/material';
import ShopkeeperDashboard from '../components/ShopkeeperDashboard';
import SalesmanDashboard from '../components/SalesmanDashboard';
import WarehouseDashboard from '../components/WarehouseDashboard';
import ManufacturerDashboard from '../components/ManufacturerDashboard';

const Dashboard = () => {
    const { user } = useAuth();

    if (!user) {
        return (
            <Container>
                <Typography variant="h6">Loading user details...</Typography>
            </Container>
        );
    }

    switch (user.role) {
        case 'shopkeeper':
            return <ShopkeeperDashboard />;
        case 'salesman':
            return <SalesmanDashboard />;
        case 'warehouse_manager':
            return <WarehouseDashboard />;
        case 'manufacturer':
            return <ManufacturerDashboard />;
        default:
            return (
                <Container>
                    <Typography variant="h5">Unknown Role: {user.role}</Typography>
                </Container>
            );
    }
};

export default Dashboard;

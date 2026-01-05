import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box, Avatar } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <AppBar position="sticky" sx={{ background: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(12px)', boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)' }}>
            <Toolbar>
                <Typography variant="h6" component="div" sx={{ flexGrow: 1, color: '#1e293b', fontWeight: 'bold', letterSpacing: '-0.5px' }}>
                    Distributor<span style={{ color: '#2563eb' }}>App</span>
                </Typography>
                {user ? (
                    <Box display="flex" alignItems="center" gap={2}>
                        <Avatar
                            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`}
                            sx={{ width: 32, height: 32, border: '2px solid #2563eb' }}
                        />
                        <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500 }}>
                            {user.username} <span style={{ opacity: 0.5 }}>|</span> <span style={{ color: '#2563eb', textTransform: 'capitalize' }}>{user.role.replace('_', ' ')}</span>
                        </Typography>
                        <Button variant="outlined" color="primary" size="small" onClick={handleLogout} sx={{ borderRadius: 20, px: 3 }}>
                            Logout
                        </Button>
                    </Box>
                ) : (
                    <Box gap={1} display="flex">
                        <Button color="primary" onClick={() => navigate('/login')} sx={{ fontWeight: 600 }}>
                            Login
                        </Button>
                        <Button variant="contained" color="primary" onClick={() => navigate('/register')} sx={{ borderRadius: 20, px: 3, boxShadow: 'none' }}>
                            Get Started
                        </Button>
                    </Box>
                )}
            </Toolbar>
        </AppBar>
    );
};

export default Navbar;

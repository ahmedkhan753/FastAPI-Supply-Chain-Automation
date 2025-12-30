import React, { useState } from 'react';
import { TextField, Button, Box, Typography, Container, Alert, Paper, MenuItem, Select, FormControl, InputLabel } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const Register = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        role: 'shopkeeper', // default role
    });
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            // Register
            await api.post('/auth/register', formData);
            // Auto-login after register
            await login(formData.username, formData.password);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.detail || 'Registration failed');
        }
    };

    return (
        <Box
            sx={{
                minHeight: '90vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                py: 4
            }}
        >
            <Container maxWidth="xs" className="fade-in">
                <Paper
                    elevation={6}
                    sx={{
                        padding: 5,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        background: 'rgba(255, 255, 255, 0.9)',
                        backdropFilter: 'blur(10px)',
                        borderRadius: 3
                    }}
                >
                    <Typography
                        variant="h4"
                        gutterBottom
                        align="center"
                        color="primary"
                        sx={{ mb: 3 }}
                    >
                        Create Account
                    </Typography>

                    {error && (
                        <Alert severity="error" sx={{ width: '100%', mb: 2, borderRadius: 2 }}>
                            {error}
                        </Alert>
                    )}

                    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
                        <TextField
                            label="Username"
                            name="username"
                            fullWidth
                            margin="normal"
                            value={formData.username}
                            onChange={handleChange}
                            required
                        />
                        <TextField
                            label="Email"
                            name="email"
                            type="email"
                            fullWidth
                            margin="normal"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                        <TextField
                            label="Password"
                            name="password"
                            type="password"
                            fullWidth
                            margin="normal"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                        <FormControl fullWidth margin="normal">
                            <InputLabel>Role</InputLabel>
                            <Select
                                name="role"
                                value={formData.role}
                                label="Role"
                                onChange={handleChange}
                                sx={{ borderRadius: 3 }}
                            >
                                <MenuItem value="shopkeeper">Shopkeeper</MenuItem>
                                <MenuItem value="salesman">Salesman</MenuItem>
                                <MenuItem value="warehouse_manager">Warehouse Manager</MenuItem>
                                <MenuItem value="manufacturer">Manufacturer</MenuItem>
                            </Select>
                        </FormControl>
                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            fullWidth
                            size="large"
                            sx={{ mt: 4, mb: 2 }}
                        >
                            Register
                        </Button>
                        <Button
                            color="secondary"
                            fullWidth
                            onClick={() => navigate('/login')}
                            sx={{ mt: 1 }}
                        >
                            Already have an account? Login
                        </Button>
                    </Box>
                </Paper>
            </Container>
        </Box>
    );
};

export default Register;

import React, { useState } from 'react';
import {
    Container,
    Paper,
    Typography,
    TextField,
    Button,
    Box,
    Link,
    FormControl,
    InputLabel,
    Select,
    MenuItem
} from '@mui/material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSnackbar } from 'notistack';

const Register = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        role: 'shopkeeper' // default role
    });

    const { register } = useAuth();
    const navigate = useNavigate();
    const { enqueueSnackbar } = useSnackbar();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await register(formData);
            enqueueSnackbar('Registration successful! Logging you in...', { variant: 'success' });
            navigate('/dashboard');
        } catch (error) {
            console.error('Registration error:', error);
            enqueueSnackbar(
                error.response?.data?.detail ?
                    (typeof error.response.data.detail === 'string' ? error.response.data.detail : JSON.stringify(error.response.data.detail))
                    : 'Registration failed.',
                { variant: 'error' }
            );
        }
    };

    return (
        <Container maxWidth="xs">
            <Box
                sx={{
                    marginTop: 8,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}
            >
                <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
                    <Typography component="h1" variant="h5" align="center" gutterBottom>
                        Sign Up
                    </Typography>
                    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            id="username"
                            label="Username"
                            name="username"
                            autoComplete="username"
                            autoFocus
                            value={formData.username}
                            onChange={handleChange}
                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            id="email"
                            label="Email Address"
                            name="email"
                            autoComplete="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            name="password"
                            label="Password"
                            type="password"
                            id="password"
                            autoComplete="new-password"
                            value={formData.password}
                            onChange={handleChange}
                        />
                        <FormControl fullWidth margin="normal">
                            <InputLabel id="role-label">Role</InputLabel>
                            <Select
                                labelId="role-label"
                                id="role"
                                name="role"
                                value={formData.role}
                                label="Role"
                                onChange={handleChange}
                            >
                                <MenuItem value="shopkeeper">Shopkeeper</MenuItem>
                                <MenuItem value="salesman">Salesman</MenuItem>
                                <MenuItem value="warehouse_manager">Warehouse Manager</MenuItem>
                                <MenuItem value="manufacturer">Manufacturer</MenuItem>
                            </Select>
                        </FormControl>
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{ mt: 3, mb: 2 }}
                        >
                            Sign Up
                        </Button>
                        <Box display="flex" justifyContent="center">
                            <Link component={RouterLink} to="/login" variant="body2">
                                {"Already have an account? Sign In"}
                            </Link>
                        </Box>
                    </Box>
                </Paper>
            </Box>
        </Container>
    );
};

export default Register;

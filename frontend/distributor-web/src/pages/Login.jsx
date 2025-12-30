import React, { useState } from 'react';
import { TextField, Button, Box, Typography, Container, Alert, Paper } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await login(username, password);
            navigate('/');
        } catch (err) {
            setError('Invalid credentials or server error');
        }
    };

    return (
        <Box
            sx={{
                minHeight: '80vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
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
                        background: 'rgba(255, 255, 255, 0.9)', // Glass-ish
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
                        Welcome Back
                    </Typography>

                    {error && (
                        <Alert severity="error" sx={{ width: '100%', mb: 2, borderRadius: 2 }}>
                            {error}
                        </Alert>
                    )}

                    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
                        <TextField
                            label="Username"
                            fullWidth
                            margin="normal"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            autoFocus
                        />
                        <TextField
                            label="Password"
                            type="password"
                            fullWidth
                            margin="normal"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            fullWidth
                            size="large"
                            sx={{ mt: 4, mb: 2 }}
                        >
                            Sign In
                        </Button>
                    </Box>
                </Paper>
            </Container>
        </Box>
    );
};

export default Login;

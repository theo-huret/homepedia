import React, { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
    Container,
    Box,
    Typography,
    TextField,
    Button,
    Paper,
    Divider,
    Alert,
    Stack
} from '@mui/material';
import { styled } from '@mui/material/styles';
import GoogleIcon from '@mui/icons-material/Google';
import { useAppContext } from '../context/AppContext';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

const Root = styled(Container)(({ theme }) => ({
    marginTop: theme.spacing(8),
    marginBottom: theme.spacing(8),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(4),
    width: '100%',
    maxWidth: 450,
}));

const Form = styled('form')(({ theme }) => ({
    width: '100%',
    marginTop: theme.spacing(1),
}));

const SubmitButton = styled(Button)(({ theme }) => ({
    margin: theme.spacing(3, 0, 2),
}));

const GoogleButton = styled(Button)(({ theme }) => ({
    margin: theme.spacing(2, 0),
    backgroundColor: '#DB4437',
    color: '#fff',
    '&:hover': {
        backgroundColor: '#C53929',
    },
}));

const LoginPage = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { setUser } = useAppContext();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await axios.post(`${API_URL}/auth/login`, formData);

            if (response.data.success && response.data.token) {
                localStorage.setItem('token', response.data.token);

                const userResponse = await axios.get(`${API_URL}/auth/me`, {
                    headers: { Authorization: `Bearer ${response.data.token}` }
                });

                setUser(userResponse.data.data);
                navigate('/');
            } else {
                setError(response.data.message || 'Échec de la connexion');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Erreur lors de la connexion');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = () => {
        window.location.href = `${API_URL}/auth/google`;
    };

    return (
        <Root maxWidth="sm">
            <StyledPaper elevation={3}>
                <Box sx={{ textAlign: 'center', mb: 3 }}>
                    <Typography component="h1" variant="h5">
                        Connexion
                    </Typography>
                </Box>

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                <Form onSubmit={handleSubmit}>
                    <TextField
                        variant="outlined"
                        margin="normal"
                        required
                        fullWidth
                        id="email"
                        label="Adresse email"
                        name="email"
                        autoComplete="email"
                        autoFocus
                        value={formData.email}
                        onChange={handleChange}
                    />
                    <TextField
                        variant="outlined"
                        margin="normal"
                        required
                        fullWidth
                        name="password"
                        label="Mot de passe"
                        type="password"
                        id="password"
                        autoComplete="current-password"
                        value={formData.password}
                        onChange={handleChange}
                    />
                    <SubmitButton
                        type="submit"
                        fullWidth
                        variant="contained"
                        color="primary"
                        disabled={loading}
                    >
                        {loading ? 'Connexion...' : 'Se connecter'}
                    </SubmitButton>
                </Form>

                <Divider sx={{ my: 2 }}>ou</Divider>

                <GoogleButton
                    startIcon={<GoogleIcon />}
                    fullWidth
                    variant="contained"
                    onClick={handleGoogleLogin}
                >
                    Se connecter avec Google
                </GoogleButton>

                <Box sx={{ mt: 2, textAlign: 'center' }}>
                    <Stack direction="row" spacing={1} justifyContent="center">
                        <Typography variant="body2">
                            Vous n'avez pas de compte ?
                        </Typography>
                        <Typography
                            variant="body2"
                            component={RouterLink}
                            to="/register"
                            color="primary"
                            sx={{ textDecoration: 'none' }}
                        >
                            S'inscrire
                        </Typography>
                    </Stack>
                </Box>
            </StyledPaper>
        </Root>
    );
};

export default LoginPage;
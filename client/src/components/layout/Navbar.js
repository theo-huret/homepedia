import React, { useEffect } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
    AppBar,
    Toolbar,
    Typography,
    Button,
    IconButton,
    Container,
    Box,
    Avatar,
    Menu,
    MenuItem,
    Divider
} from '@mui/material';
import { styled } from '@mui/material/styles';
import HomeIcon from '@mui/icons-material/Home';
import PersonIcon from '@mui/icons-material/Person';
import { useAppContext } from '../../context/AppContext';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

const Root = styled('div')(({ theme }) => ({
    flexGrow: 1,
}));

const MenuButton = styled(IconButton)(({ theme }) => ({
    marginRight: theme.spacing(2),
}));

const Title = styled(Typography)(({ theme }) => ({
    flexGrow: 1,
    display: 'flex',
    alignItems: 'center',
}));

const NavLinks = styled(Button)(({ theme }) => ({
    marginLeft: theme.spacing(2),
}));

const UserBox = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer'
}));

const UserAvatar = styled(Avatar)(({ theme }) => ({
    width: 35,
    height: 35,
    marginLeft: theme.spacing(1),
    backgroundColor: theme.palette.primary.main
}));

const Navbar = () => {
    const { user, setUser, logout } = useAppContext();
    const [anchorEl, setAnchorEl] = React.useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const checkLoggedIn = async () => {
            const token = localStorage.getItem('token');

            if (token && !user) {
                try {
                    const userResponse = await axios.get(`${API_URL}/auth/me`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });

                    if (userResponse.data.success) {
                        setUser(userResponse.data.data);
                    }
                } catch (error) {
                    localStorage.removeItem('token');
                }
            }
        };

        checkLoggedIn();
    }, [setUser, user]);

    const handleMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        logout();
        handleMenuClose();
        navigate('/');
    };

    const handleProfile = () => {
        handleMenuClose();
        navigate('/profile');
    };

    // Ajouter un gestionnaire de clics pour fermer le menu lors d'un clic en dehors
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (anchorEl && !anchorEl.contains(event.target)) {
                setAnchorEl(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [anchorEl]);

    return (
        <Root>
            <AppBar position="static">
                <Container>
                    <Toolbar>
                        <Title variant="h6">
                            <MenuButton
                                edge="start"
                                sx={{ marginRight: 1 }}
                                color="inherit"
                                component={RouterLink}
                                to="/"
                            >
                                <HomeIcon />
                            </MenuButton>
                            HOMEPEDIA
                        </Title>

                        {/* Navigation Links */}
                        <NavLinks color="inherit" component={RouterLink} to="/">
                            Accueil
                        </NavLinks>
                        <NavLinks color="inherit" component={RouterLink} to="/explorer">
                            Explorer
                        </NavLinks>
                        <NavLinks color="inherit" component={RouterLink} to="/analyse">
                            Analyser
                        </NavLinks>
                        <NavLinks color="inherit" component={RouterLink} to="/about">
                            À propos
                        </NavLinks>

                        {/* Auth Button/User Menu */}
                        {!user ? (
                            <Button
                                variant="contained"
                                color="secondary"
                                component={RouterLink}
                                to="/login"
                                sx={{ ml: 2 }}
                            >
                                Connexion
                            </Button>
                        ) : (
                            <Box>
                                <UserBox onClick={handleMenuOpen}>
                                    <Typography variant="body1" marginRight={1}>
                                        {user.nom}
                                    </Typography>
                                    <UserAvatar>
                                        {user.nom.charAt(0).toUpperCase()}
                                    </UserAvatar>
                                </UserBox>
                                <Menu
                                    id="user-menu"
                                    anchorEl={anchorEl}
                                    open={Boolean(anchorEl)}
                                    onClose={handleMenuClose}
                                    onClick={handleMenuClose} // Ferme le menu sur n'importe quel clic à l'intérieur
                                    PaperProps={{
                                        elevation: 3,
                                        sx: { minWidth: 180 }
                                    }}
                                    transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                                    anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                                    // S'assurer que le menu est bien au-dessus des autres éléments
                                    sx={{ zIndex: 1300 }}
                                    // Gérer la fermeture sur les clics extérieurs
                                    MenuListProps={{
                                        'aria-labelledby': 'user-button',
                                        dense: true,
                                        autoFocusItem: false
                                    }}
                                    keepMounted
                                >
                                    <MenuItem onClick={handleProfile}>
                                        <PersonIcon fontSize="small" sx={{ mr: 1 }} />
                                        Mon profil
                                    </MenuItem>
                                    <Divider />
                                    <MenuItem onClick={handleLogout}>
                                        Déconnexion
                                    </MenuItem>
                                </Menu>
                            </Box>
                        )}
                    </Toolbar>
                </Container>
            </AppBar>
        </Root>
    );
};

export default Navbar;
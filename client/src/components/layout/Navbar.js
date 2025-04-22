import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
    AppBar,
    Toolbar,
    Typography,
    Button,
    IconButton,
    Container,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import HomeIcon from '@mui/icons-material/Home';

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

const Logo = styled('div')(({ theme }) => ({
    marginRight: theme.spacing(1),
}));

const NavLinks = styled(Button)(({ theme }) => ({
    marginLeft: theme.spacing(2),
}));

const Navbar = () => {
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
                    </Toolbar>
                </Container>
            </AppBar>
        </Root>
    );
};

export default Navbar;
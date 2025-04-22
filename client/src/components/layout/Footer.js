import React from 'react';
import { Box, Container, Grid, Typography, Link, styled } from '@mui/material';

const FooterContainer = styled(Box)(({ theme }) => ({
    backgroundColor: theme.palette.primary.main,
    color: 'white',
    padding: theme.spacing(6, 0),
    marginTop: 'auto',
}));

const FooterLink = styled(Link)(({ theme }) => ({
    color: 'white',
    marginRight: theme.spacing(2),
}));

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <FooterContainer component="footer">
            <Container maxWidth="lg">
                <Grid container spacing={3}>
                    <Grid item xs={12} sm={4}>
                        <Typography variant="h6" gutterBottom>
                            HOMEPEDIA
                        </Typography>
                        <Typography variant="body2">
                            Explorez, comprenez et analysez le marché immobilier en France.
                        </Typography>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <Typography variant="h6" gutterBottom>
                            Liens rapides
                        </Typography>
                        <FooterLink href="/" underline="hover">
                            Accueil
                        </FooterLink>
                        <FooterLink href="/explorer" underline="hover">
                            Explorer
                        </FooterLink>
                        <FooterLink href="/analyse" underline="hover">
                            Analyser
                        </FooterLink>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <Typography variant="h6" gutterBottom>
                            Sources de données
                        </Typography>
                        <Typography variant="body2">
                            INSEE, data.gouv.fr, et autres sources publiques
                        </Typography>
                    </Grid>
                </Grid>
                <Box mt={3}>
                    <Typography variant="body2" align="center">
                        © {currentYear} HOMEPEDIA. Tous droits réservés.
                    </Typography>
                </Box>
            </Container>
        </FooterContainer>
    );
};

export default Footer;
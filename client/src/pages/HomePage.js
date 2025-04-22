import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
    Box,
    Button,
    Container,
    Grid,
    Typography,
    Card,
    CardContent,
    styled
} from '@mui/material';
import ExploreIcon from '@mui/icons-material/Explore';
import AssessmentIcon from '@mui/icons-material/Assessment';
import HomeWorkIcon from '@mui/icons-material/HomeWork';

const HeroContent = styled('div')(({ theme }) => ({
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(8, 0, 6),
}));

const HeroButtons = styled('div')(({ theme }) => ({
    marginTop: theme.spacing(4),
}));

const CardGrid = styled(Container)(({ theme }) => ({
    paddingTop: theme.spacing(8),
    paddingBottom: theme.spacing(8),
}));

const StyledCard = styled(Card)(({ theme }) => ({
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
}));

const CardContent2 = styled(CardContent)(({ theme }) => ({
    flexGrow: 1,
}));

const Icon = styled(Box)(({ theme }) => ({
    fontSize: 60,
    color: theme.palette.primary.main,
}));

const IconContainer = styled(Box)(({ theme }) => ({
    display: 'flex',
    justifyContent: 'center',
    marginBottom: theme.spacing(2),
}));

const HomePage = () => {
    return (
        <>
            <HeroContent>
                <Container maxWidth="md">
                    <Typography variant="h2" align="center" color="textPrimary" gutterBottom>
                        HOMEPEDIA
                    </Typography>
                    <Typography variant="h5" align="center" color="textSecondary" paragraph>
                        Votre plateforme d'analyse du marché immobilier français.
                        Explorez les tendances, comparez les régions et prenez des décisions éclairées.
                    </Typography>
                    <HeroButtons>
                        <Grid container spacing={2} justifyContent="center">
                            <Grid item>
                                <Button variant="contained" color="primary" component={RouterLink} to="/explorer">
                                    Explorer le marché
                                </Button>
                            </Grid>
                            <Grid item>
                                <Button variant="outlined" color="primary" component={RouterLink} to="/analyse">
                                    Analyser les données
                                </Button>
                            </Grid>
                        </Grid>
                    </HeroButtons>
                </Container>
            </HeroContent>
            <CardGrid maxWidth="md">
                <Grid container spacing={4}>
                    <Grid item xs={12} sm={6} md={4}>
                        <StyledCard>
                            <IconContainer>
                                <ExploreIcon sx={{ fontSize: 60, color: 'primary.main' }} />
                            </IconContainer>
                            <CardContent2>
                                <Typography gutterBottom variant="h5" component="h2" align="center">
                                    Explorer
                                </Typography>
                                <Typography>
                                    Découvrez le marché immobilier français à travers des cartes interactives et des visualisations dynamiques.
                                </Typography>
                            </CardContent2>
                        </StyledCard>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <StyledCard>
                            <IconContainer>
                                <AssessmentIcon sx={{ fontSize: 60, color: 'primary.main' }} />
                            </IconContainer>
                            <CardContent2>
                                <Typography gutterBottom variant="h5" component="h2" align="center">
                                    Analyser
                                </Typography>
                                <Typography>
                                    Utilisez nos outils d'analyse avancés pour comprendre les tendances et prendre des décisions éclairées.
                                </Typography>
                            </CardContent2>
                        </StyledCard>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <StyledCard>
                            <IconContainer>
                                <HomeWorkIcon sx={{ fontSize: 60, color: 'primary.main' }} />
                            </IconContainer>
                            <CardContent2>
                                <Typography gutterBottom variant="h5" component="h2" align="center">
                                    Comparer
                                </Typography>
                                <Typography>
                                    Comparez les marchés immobiliers entre différentes régions, départements et communes.
                                </Typography>
                            </CardContent2>
                        </StyledCard>
                    </Grid>
                </Grid>
            </CardGrid>
        </>
    );
};

export default HomePage;
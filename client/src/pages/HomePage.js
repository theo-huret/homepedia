import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
    Box,
    Button,
    Container,
    Grid,
    Typography,
    Card,
    CardContent,
    styled,
    CircularProgress,
    Divider
} from '@mui/material';
import ExploreIcon from '@mui/icons-material/Explore';
import AssessmentIcon from '@mui/icons-material/Assessment';
import HomeWorkIcon from '@mui/icons-material/HomeWork';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import LocationCityIcon from '@mui/icons-material/LocationCity';
import EuroIcon from '@mui/icons-material/Euro';
import apiService from '../services/apiService';
import { useAppContext } from '../context/AppContext';

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

const IconContainer = styled(Box)(({ theme }) => ({
    display: 'flex',
    justifyContent: 'center',
    marginBottom: theme.spacing(2),
}));

const StatsContainer = styled(Box)(({ theme }) => ({
    padding: theme.spacing(4, 0),
    backgroundColor: theme.palette.background.default,
}));

const StatCard = styled(Card)(({ theme }) => ({
    height: '100%',
    textAlign: 'center',
    padding: theme.spacing(2),
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
}));

const StatValue = styled(Typography)(({ theme }) => ({
    fontSize: '2rem',
    fontWeight: 'bold',
    color: theme.palette.primary.main,
}));

const TopCitiesCard = styled(Card)(({ theme }) => ({
    marginTop: theme.spacing(4),
    padding: theme.spacing(2),
}));

const CityItem = styled(Box)(({ theme }) => ({
    display: 'flex',
    justifyContent: 'space-between',
    padding: theme.spacing(1, 0),
    borderBottom: `1px solid ${theme.palette.divider}`,
    '&:last-child': {
        borderBottom: 'none',
    },
}));

const HomePage = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const { setError } = useAppContext();

    useEffect(() => {
        const fetchHomeStats = async () => {
            try {
                setLoading(true);
                const response = await apiService.getHomepageStats();
                setStats(response.data.data);
                setLoading(false);
            } catch (error) {
                console.error('Erreur lors de la récupération des statistiques:', error);
                setError('Impossible de charger les statistiques du marché immobilier.');
                setLoading(false);
            }
        };

        fetchHomeStats();
    }, [setError]);

    const formatNumber = (num) => {
        if (!num) return "0";
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    };

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

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <CircularProgress />
                </Box>
            ) : stats && (
                <StatsContainer>
                    <Container maxWidth="lg">
                        <Typography variant="h4" align="center" gutterBottom>
                            Le marché immobilier en France
                        </Typography>
                        <Typography variant="subtitle1" align="center" color="textSecondary" paragraph>
                            Année de référence : {stats.derniere_annee}
                        </Typography>

                        <Grid container spacing={3} sx={{ mt: 2 }}>
                            <Grid item xs={12} sm={6} md={3}>
                                <StatCard elevation={2}>
                                    <EuroIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
                                    <StatValue>{stats.prix_moyen_france} €/m²</StatValue>
                                    <Typography variant="body1">Prix moyen au m²</Typography>
                                </StatCard>
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <StatCard elevation={2}>
                                    <TrendingUpIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
                                    <StatValue>{stats.evolution_prix > 0 ? '+' : ''}{stats.evolution_prix}%</StatValue>
                                    <Typography variant="body1">Évolution des prix</Typography>
                                </StatCard>
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <StatCard elevation={2}>
                                    <HomeWorkIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
                                    <StatValue>{formatNumber(stats.transactions_count)}</StatValue>
                                    <Typography variant="body1">Transactions analysées</Typography>
                                </StatCard>
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <StatCard elevation={2}>
                                    <LocationCityIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
                                    <StatValue>{formatNumber(stats.communes_couvertes)}</StatValue>
                                    <Typography variant="body1">Communes couvertes</Typography>
                                </StatCard>
                            </Grid>
                        </Grid>

                        <Grid container spacing={4} sx={{ mt: 2 }}>
                            <Grid item xs={12} md={6}>
                                <TopCitiesCard elevation={2}>
                                    <Typography variant="h6" gutterBottom>
                                        Top 5 villes les plus chères (appartements)
                                    </Typography>
                                    <Divider sx={{ mb: 2 }} />
                                    {stats.top_villes && stats.top_villes.map((ville, index) => (
                                        <CityItem key={index}>
                                            <Typography>{ville.nom} ({ville.departement})</Typography>
                                            <Typography fontWeight="bold">{ville.prix_moyen_m2} €/m²</Typography>
                                        </CityItem>
                                    ))}
                                </TopCitiesCard>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TopCitiesCard elevation={2}>
                                    <Typography variant="h6" gutterBottom>
                                        Top 5 régions les plus chères
                                    </Typography>
                                    <Divider sx={{ mb: 2 }} />
                                    {stats.top_regions && stats.top_regions.map((region, index) => (
                                        <CityItem key={index}>
                                            <Typography>{region.nom}</Typography>
                                            <Typography fontWeight="bold">{region.prix_moyen_m2} €/m²</Typography>
                                        </CityItem>
                                    ))}
                                </TopCitiesCard>
                            </Grid>
                        </Grid>
                    </Container>
                </StatsContainer>
            )}

            <CardGrid maxWidth="md">
                <Typography variant="h4" align="center" gutterBottom>
                    Nos services
                </Typography>
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
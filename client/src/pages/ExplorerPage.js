import React, { useState, useEffect } from 'react';
import {
    Box,
    Container,
    Typography,
    Paper,
    Grid,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    styled,
    CircularProgress,
    Card,
    CardContent,
    Divider,
    List,
    ListItem,
    ListItemText
} from '@mui/material';
import MapComponent from '../components/maps/MapComponent';
import apiService from '../services/apiService';
import { useAppContext } from '../context/AppContext';

const Root = styled(Container)(({ theme }) => ({
    padding: theme.spacing(4),
}));

const Title = styled(Typography)(({ theme }) => ({
    marginBottom: theme.spacing(4),
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(3),
    marginBottom: theme.spacing(3),
}));

const StyledFormControl = styled(FormControl)(({ theme }) => ({
    margin: theme.spacing(1),
    minWidth: 120,
}));

const MapContainer = styled(Box)(({ theme }) => ({
    height: 500,
    width: '100%',
    position: 'relative'
}));

const LoadingOverlay = styled(Box)(({ theme }) => ({
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    zIndex: 10
}));

const StatsCard = styled(Card)(({ theme }) => ({
    marginTop: theme.spacing(3),
}));

const StatValue = styled(Typography)(({ theme }) => ({
    fontWeight: 'bold',
    color: theme.palette.primary.main,
}));

const ExplorerPage = () => {
    const [region, setRegion] = useState('');
    const [departement, setDepartement] = useState('');
    const [indicator, setIndicator] = useState('prix');
    const [typeBien, setTypeBien] = useState('1'); // 1 = Appartement par défaut
    const [loading, setLoading] = useState(false);
    const [regionsData, setRegionsData] = useState([]);
    const [departementsData, setDepartementsData] = useState([]);
    const [mapData, setMapData] = useState([]);
    const [selectedRegionData, setSelectedRegionData] = useState(null);
    const [selectedDeptData, setSelectedDeptData] = useState(null);
    const [typesBien, setTypesBien] = useState([]);
    const { setError } = useAppContext();

    // Charger les régions au démarrage
    useEffect(() => {
        const fetchRegions = async () => {
            try {
                const response = await apiService.getRegions();
                setRegionsData(response.data.data);
            } catch (error) {
                console.error('Erreur lors du chargement des régions:', error);
                setError('Impossible de charger les régions.');
            }
        };

        const fetchTypesBien = async () => {
            try {
                const response = await apiService.getTypesBien();
                setTypesBien(response.data.data);
            } catch (error) {
                console.error('Erreur lors du chargement des types de biens:', error);
            }
        };

        fetchRegions();
        fetchTypesBien();
    }, [setError]);

    // Charger les départements lorsqu'une région est sélectionnée
    useEffect(() => {
        const fetchDepartements = async () => {
            if (!region) {
                setDepartementsData([]);
                return;
            }

            try {
                const response = await apiService.getDepartements({ regionId: region });
                setDepartementsData(response.data.data);
            } catch (error) {
                console.error('Erreur lors du chargement des départements:', error);
                setError('Impossible de charger les départements de cette région.');
            }
        };

        fetchDepartements();
    }, [region, setError]);

    // Charger les statistiques de la région sélectionnée
    useEffect(() => {
        const fetchRegionStats = async () => {
            if (!region) {
                setSelectedRegionData(null);
                return;
            }

            try {
                const response = await apiService.getRegionStats(region, { annee: 2022 });
                setSelectedRegionData(response.data.data);
            } catch (error) {
                console.error('Erreur lors du chargement des statistiques de la région:', error);
            }
        };

        fetchRegionStats();
    }, [region]);

    // Charger les statistiques du département sélectionné
    useEffect(() => {
        const fetchDepartementStats = async () => {
            if (!departement) {
                setSelectedDeptData(null);
                return;
            }

            try {
                const response = await apiService.getDepartementStats(departement, { annee: 2022 });
                setSelectedDeptData(response.data.data);
            } catch (error) {
                console.error('Erreur lors du chargement des statistiques du département:', error);
            }
        };

        fetchDepartementStats();
    }, [departement]);

    // Charger les données pour la carte selon l'indicateur choisi
    useEffect(() => {
        const fetchDataForMap = async () => {
            setLoading(true);
            try {
                let response;

                if (departement) {
                    // Données pour une carte au niveau communes du département
                    if (indicator === 'prix') {
                        response = await apiService.getPricesByCommune({
                            departementId: departement,
                            annee: 2022,
                            typeBienId: typeBien
                        });
                    }
                } else if (region) {
                    // Données pour une carte au niveau départements de la région
                    if (indicator === 'prix') {
                        response = await apiService.getPricesByDepartement({
                            regionId: region,
                            annee: 2022,
                            typeBienId: typeBien
                        });
                    }
                } else {
                    // Données pour une carte nationale au niveau régions
                    if (indicator === 'prix') {
                        response = await apiService.getPricesByRegion({
                            annee: 2022,
                            typeBienId: typeBien
                        });
                    }
                }

                if (response && response.data) {
                    setMapData(response.data.data);
                }
            } catch (error) {
                console.error('Erreur lors du chargement des données pour la carte:', error);
                setError('Impossible de charger les données pour la carte.');
            } finally {
                setLoading(false);
            }
        };

        fetchDataForMap();
    }, [region, departement, indicator, typeBien, setError]);

    const handleRegionChange = (event) => {
        setRegion(event.target.value);
        setDepartement(''); // Réinitialiser le département lorsque la région change
    };

    const handleDepartementChange = (event) => {
        setDepartement(event.target.value);
    };

    const handleIndicatorChange = (event) => {
        setIndicator(event.target.value);
    };

    const handleTypeBienChange = (event) => {
        setTypeBien(event.target.value);
    };

    // Formater les données pour l'affichage
    const getTypeBienLabel = (id) => {
        const typeBien = typesBien.find(type => type.id === parseInt(id));
        return typeBien ? typeBien.libelle : 'Tous types';
    };

    return (
        <Root>
            <Title variant="h4">
                Explorer le marché immobilier
            </Title>

            <StyledPaper>
                <Grid container spacing={3}>
                    <Grid item xs={12} md={3}>
                        <StyledFormControl variant="outlined" fullWidth>
                            <InputLabel id="region-select-label">Région</InputLabel>
                            <Select
                                labelId="region-select-label"
                                id="region-select"
                                value={region}
                                onChange={handleRegionChange}
                                label="Région"
                            >
                                <MenuItem value=""><em>Toutes</em></MenuItem>
                                {regionsData.map((region) => (
                                    <MenuItem key={region.id} value={region.id}>
                                        {region.nom}
                                    </MenuItem>
                                ))}
                            </Select>
                        </StyledFormControl>
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <StyledFormControl variant="outlined" fullWidth disabled={!region}>
                            <InputLabel id="departement-select-label">Département</InputLabel>
                            <Select
                                labelId="departement-select-label"
                                id="departement-select"
                                value={departement}
                                onChange={handleDepartementChange}
                                label="Département"
                            >
                                <MenuItem value=""><em>Tous</em></MenuItem>
                                {departementsData.map((dept) => (
                                    <MenuItem key={dept.id} value={dept.id}>
                                        {dept.code} - {dept.nom}
                                    </MenuItem>
                                ))}
                            </Select>
                        </StyledFormControl>
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <StyledFormControl variant="outlined" fullWidth>
                            <InputLabel id="indicator-select-label">Indicateur</InputLabel>
                            <Select
                                labelId="indicator-select-label"
                                id="indicator-select"
                                value={indicator}
                                onChange={handleIndicatorChange}
                                label="Indicateur"
                            >
                                <MenuItem value="prix">Prix moyen au m²</MenuItem>
                                <MenuItem value="evolution">Évolution des prix</MenuItem>
                                <MenuItem value="transactions">Nombre de transactions</MenuItem>
                            </Select>
                        </StyledFormControl>
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <StyledFormControl variant="outlined" fullWidth>
                            <InputLabel id="type-bien-label">Type de bien</InputLabel>
                            <Select
                                labelId="type-bien-label"
                                id="type-bien"
                                value={typeBien}
                                onChange={handleTypeBienChange}
                                label="Type de bien"
                            >
                                {typesBien.map((type) => (
                                    <MenuItem key={type.id} value={type.id.toString()}>
                                        {type.libelle}
                                    </MenuItem>
                                ))}
                            </Select>
                        </StyledFormControl>
                    </Grid>
                </Grid>
            </StyledPaper>

            <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                    <StyledPaper>
                        <Typography variant="h6" gutterBottom>
                            Carte interactive
                        </Typography>
                        <MapContainer>
                            {loading && (
                                <LoadingOverlay>
                                    <CircularProgress />
                                </LoadingOverlay>
                            )}
                            <MapComponent
                                region={region}
                                indicator={indicator}
                                data={mapData}
                            />
                        </MapContainer>
                    </StyledPaper>
                </Grid>
                <Grid item xs={12} md={4}>
                    {/* Affichage des statistiques de la région sélectionnée */}
                    {selectedRegionData && (
                        <StatsCard>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    {regionsData.find(r => r.id === parseInt(region))?.nom || 'Région sélectionnée'}
                                </Typography>
                                <Divider sx={{ mb: 2 }} />

                                <Typography variant="subtitle2" gutterBottom>
                                    Prix moyen au m² ({getTypeBienLabel(typeBien)})
                                </Typography>
                                {selectedRegionData.prix && selectedRegionData.prix.map((item, index) => (
                                    <Box key={index} sx={{ mb: 1 }}>
                                        {item.type_bien === getTypeBienLabel(typeBien) && (
                                            <StatValue>
                                                {item.prix_moyen_m2} €/m²
                                            </StatValue>
                                        )}
                                    </Box>
                                ))}

                                <Box sx={{ mt: 2 }}>
                                    <Typography variant="subtitle2" gutterBottom>
                                        Départements ({selectedRegionData.departements?.length || 0})
                                    </Typography>
                                    <List dense>
                                        {selectedRegionData.departements?.slice(0, 5).map((dept, index) => (
                                            <ListItem key={index} sx={{ py: 0 }}>
                                                <ListItemText
                                                    primary={`${dept.code} - ${dept.nom}`}
                                                />
                                            </ListItem>
                                        ))}
                                        {(selectedRegionData.departements?.length || 0) > 5 && (
                                            <ListItem sx={{ py: 0 }}>
                                                <ListItemText
                                                    primary={`... et ${selectedRegionData.departements.length - 5} autres`}
                                                />
                                            </ListItem>
                                        )}
                                    </List>
                                </Box>
                            </CardContent>
                        </StatsCard>
                    )}

                    {/* Affichage des statistiques du département sélectionné */}
                    {selectedDeptData && (
                        <StatsCard sx={{ mt: 2 }}>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    {departementsData.find(d => d.id === parseInt(departement))?.nom || 'Département sélectionné'}
                                </Typography>
                                <Divider sx={{ mb: 2 }} />

                                <Typography variant="subtitle2" gutterBottom>
                                    Prix moyen au m² ({getTypeBienLabel(typeBien)})
                                </Typography>
                                {selectedDeptData.prix && selectedDeptData.prix.map((item, index) => (
                                    <Box key={index} sx={{ mb: 1 }}>
                                        {item.type_bien === getTypeBienLabel(typeBien) && (
                                            <StatValue>
                                                {item.prix_moyen_m2} €/m²
                                            </StatValue>
                                        )}
                                    </Box>
                                ))}

                                <Box sx={{ mt: 2 }}>
                                    <Typography variant="subtitle2" gutterBottom>
                                        Principales communes ({selectedDeptData.communes?.length || 0})
                                    </Typography>
                                    <List dense>
                                        {selectedDeptData.communes?.slice(0, 5).map((commune, index) => (
                                            <ListItem key={index} sx={{ py: 0 }}>
                                                <ListItemText
                                                    primary={commune.nom}
                                                />
                                            </ListItem>
                                        ))}
                                        {(selectedDeptData.communes?.length || 0) > 5 && (
                                            <ListItem sx={{ py: 0 }}>
                                                <ListItemText
                                                    primary={`... et ${selectedDeptData.communes.length - 5} autres`}
                                                />
                                            </ListItem>
                                        )}
                                    </List>
                                </Box>
                            </CardContent>
                        </StatsCard>
                    )}
                </Grid>
            </Grid>
        </Root>
    );
};

export default ExplorerPage;
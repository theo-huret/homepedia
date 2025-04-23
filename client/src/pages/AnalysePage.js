import React, { useState, useEffect } from 'react';
import {
    Container,
    Typography,
    Paper,
    Box,
    Grid,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Button,
    styled,
    CircularProgress,
    Alert
} from '@mui/material';
import SimpleBarChart from '../components/charts/SimpleBarChart';
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

const ChartContainer = styled('div')(({ theme }) => ({
    height: 400,
    width: '100%',
    position: 'relative'
}));

const ActionButton = styled(Button)(({ theme }) => ({
    margin: theme.spacing(2, 0),
}));

const LoadingOverlay = styled('div')(({ theme }) => ({
    position: 'absolute',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    zIndex: 10
}));

const AnalysePage = () => {
    const [propertyType, setPropertyType] = useState('1'); // 1 = Appartement par défaut
    const [analysisType, setAnalysisType] = useState('price');
    const [timeFrame, setTimeFrame] = useState('2022');
    const [loading, setLoading] = useState(false);
    const [chartData, setChartData] = useState([]);
    const [typesBien, setTypesBien] = useState([]);
    const [regions, setRegions] = useState([]);
    const [selectedRegion, setSelectedRegion] = useState('');
    const [error, setError] = useState('');
    const { setIsLoading } = useAppContext();

    // Charger les types de biens et les régions au chargement
    useEffect(() => {
        const fetchInitialData = async () => {
            setIsLoading(true);
            try {
                const [typesBienResponse, regionsResponse] = await Promise.all([
                    apiService.getTypesBien(),
                    apiService.getRegions()
                ]);

                setTypesBien(typesBienResponse.data.data);
                setRegions(regionsResponse.data.data);
            } catch (err) {
                console.error('Erreur lors du chargement des données initiales:', err);
                setError('Erreur lors du chargement des données initiales. Veuillez réessayer.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchInitialData();
    }, [setIsLoading]);

    const handlePropertyTypeChange = (event) => {
        setPropertyType(event.target.value);
    };

    const handleAnalysisTypeChange = (event) => {
        setAnalysisType(event.target.value);
    };

    const handleTimeFrameChange = (event) => {
        setTimeFrame(event.target.value);
    };

    const handleRegionChange = (event) => {
        setSelectedRegion(event.target.value);
    };

    const handleAnalyse = async () => {
        setLoading(true);
        setError('');

        try {
            let response;
            let formattedData = [];

            // Récupérer les données selon le type d'analyse
            if (analysisType === 'price') {
                if (selectedRegion) {
                    response = await apiService.getPricesByDepartement({
                        regionId: selectedRegion,
                        annee: timeFrame,
                        typeBienId: propertyType
                    });
                } else {
                    response = await apiService.getPricesByRegion({
                        annee: timeFrame,
                        typeBienId: propertyType
                    });
                }

                // Formater les données pour le graphique
                formattedData = response.data.data.map(item => ({
                    name: item.nom,
                    value: parseFloat(item.prix_moyen_m2) || 0
                })).sort((a, b) => b.value - a.value).slice(0, 10); // Top 10

            } else if (analysisType === 'evolution') {
                const periode = timeFrame === '5-years' ? 5 : (timeFrame === '10-years' ? 10 : 1);

                response = await apiService.getPriceEvolution({
                    regionId: selectedRegion || undefined,
                    periode,
                    typeBienId: propertyType
                });

                // Formater les données pour le graphique d'évolution
                formattedData = response.data.data.map(item => ({
                    name: item.annee.toString(),
                    value: parseFloat(item.prix_moyen_m2) || 0,
                    evolution: parseFloat(item.evolution) || 0
                }));

            } else if (analysisType === 'transactions') {
                response = await apiService.getTransactionVolume({
                    regionId: selectedRegion || undefined,
                    annee: timeFrame,
                    typeBienId: propertyType
                });

                // Formater les données pour le graphique de volume
                formattedData = response.data.data.map(item => ({
                    name: item.type_bien,
                    value: parseInt(item.nombre_transactions) || 0
                }));
            }

            setChartData(formattedData);
        } catch (err) {
            console.error('Erreur lors de l\'analyse:', err);
            setError('Erreur lors de l\'analyse des données. Veuillez réessayer.');
        } finally {
            setLoading(false);
        }
    };

    const getTypeBienLabel = (id) => {
        const typeBien = typesBien.find(type => type.id === parseInt(id));
        return typeBien ? typeBien.libelle : 'Type inconnu';
    };

    const getRegionLabel = (id) => {
        const region = regions.find(r => r.id === parseInt(id));
        return region ? region.nom : 'Toutes les régions';
    };

    const getAnalysisTitle = () => {
        const typeBienLabel = getTypeBienLabel(propertyType);
        const regionLabel = selectedRegion ? getRegionLabel(selectedRegion) : 'France entière';

        if (analysisType === 'price') {
            return `Prix moyen au m² des ${typeBienLabel.toLowerCase()}s en ${timeFrame} - ${regionLabel}`;
        } else if (analysisType === 'evolution') {
            const period = timeFrame === '5-years' ? '5 dernières années' :
                (timeFrame === '10-years' ? '10 dernières années' : timeFrame);
            return `Évolution des prix des ${typeBienLabel.toLowerCase()}s sur les ${period} - ${regionLabel}`;
        } else {
            return `Volume de transactions par type de bien en ${timeFrame} - ${regionLabel}`;
        }
    };

    return (
        <Root>
            <Title variant="h4">
                Analyser le marché immobilier
            </Title>

            <StyledPaper>
                <Grid container spacing={3}>
                    <Grid item xs={12} md={3}>
                        <StyledFormControl variant="outlined" fullWidth>
                            <InputLabel id="analysis-type-label">Type d'analyse</InputLabel>
                            <Select
                                labelId="analysis-type-label"
                                id="analysis-type"
                                value={analysisType}
                                onChange={handleAnalysisTypeChange}
                                label="Type d'analyse"
                            >
                                <MenuItem value="price">Prix moyen au m²</MenuItem>
                                <MenuItem value="evolution">Évolution des prix</MenuItem>
                                <MenuItem value="transactions">Volume de transactions</MenuItem>
                            </Select>
                        </StyledFormControl>
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <StyledFormControl variant="outlined" fullWidth>
                            <InputLabel id="property-type-label">Type de bien</InputLabel>
                            <Select
                                labelId="property-type-label"
                                id="property-type"
                                value={propertyType}
                                onChange={handlePropertyTypeChange}
                                label="Type de bien"
                            >
                                {typesBien.map(type => (
                                    <MenuItem key={type.id} value={type.id.toString()}>
                                        {type.libelle}
                                    </MenuItem>
                                ))}
                            </Select>
                        </StyledFormControl>
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <StyledFormControl variant="outlined" fullWidth>
                            <InputLabel id="time-frame-label">Période</InputLabel>
                            <Select
                                labelId="time-frame-label"
                                id="time-frame"
                                value={timeFrame}
                                onChange={handleTimeFrameChange}
                                label="Période"
                            >
                                <MenuItem value="2023">2023</MenuItem>
                                <MenuItem value="2022">2022</MenuItem>
                                <MenuItem value="5-years">5 dernières années</MenuItem>
                                <MenuItem value="10-years">10 dernières années</MenuItem>
                            </Select>
                        </StyledFormControl>
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <StyledFormControl variant="outlined" fullWidth>
                            <InputLabel id="region-label">Région</InputLabel>
                            <Select
                                labelId="region-label"
                                id="region"
                                value={selectedRegion}
                                onChange={handleRegionChange}
                                label="Région"
                            >
                                <MenuItem value="">Toutes les régions</MenuItem>
                                {regions.map(region => (
                                    <MenuItem key={region.id} value={region.id.toString()}>
                                        {region.nom}
                                    </MenuItem>
                                ))}
                            </Select>
                        </StyledFormControl>
                    </Grid>
                </Grid>

                <ActionButton
                    variant="contained"
                    color="primary"
                    fullWidth
                    onClick={handleAnalyse}
                    disabled={loading}
                >
                    {loading ? 'Analyse en cours...' : 'Analyser'}
                </ActionButton>

                {error && (
                    <Alert severity="error" sx={{ mt: 2 }}>
                        {error}
                    </Alert>
                )}
            </StyledPaper>

            <StyledPaper>
                <Typography variant="h6" gutterBottom>
                    Résultats de l'analyse
                </Typography>
                <Typography variant="subtitle1" gutterBottom>
                    {chartData.length > 0 ? getAnalysisTitle() : 'Veuillez lancer une analyse pour afficher les résultats'}
                </Typography>

                <ChartContainer>
                    {loading && (
                        <LoadingOverlay>
                            <CircularProgress />
                        </LoadingOverlay>
                    )}
                    {chartData.length > 0 ? (
                        <SimpleBarChart
                            data={chartData}
                            dataKey="value"
                            label={analysisType === 'price' ? 'Prix moyen (€/m²)' :
                                (analysisType === 'evolution' ? 'Prix moyen (€/m²)' : 'Nombre de transactions')}
                        />
                    ) : (
                        <Box sx={{
                            height: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'text.secondary'
                        }}>
                            <Typography>
                                Aucune donnée à afficher. Lancez une analyse pour voir les résultats.
                            </Typography>
                        </Box>
                    )}
                </ChartContainer>
            </StyledPaper>
        </Root>
    );
};

export default AnalysePage;
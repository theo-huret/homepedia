import React, { useState } from 'react';
import {
    Container,
    Typography,
    Paper,
    Grid,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Button,
    styled
} from '@mui/material';
import SimpleBarChart from '../components/charts/SimpleBarChart';

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
}));

const ActionButton = styled(Button)(({ theme }) => ({
    margin: theme.spacing(2, 0),
}));

const dummyData = [
    { name: 'Paris', value: 10700 },
    { name: 'Lyon', value: 4900 },
    { name: 'Marseille', value: 3800 },
    { name: 'Bordeaux', value: 4600 },
    { name: 'Toulouse', value: 3500 },
    { name: 'Nantes', value: 3900 },
    { name: 'Strasbourg', value: 3700 },
    { name: 'Lille', value: 3200 },
    { name: 'Rennes', value: 3600 },
    { name: 'Nice', value: 4300 },
];

const AnalysePage = () => {
    const [propertyType, setPropertyType] = useState('apartment');
    const [analysisType, setAnalysisType] = useState('price');
    const [timeFrame, setTimeFrame] = useState('2023');

    const handlePropertyTypeChange = (event) => {
        setPropertyType(event.target.value);
    };

    const handleAnalysisTypeChange = (event) => {
        setAnalysisType(event.target.value);
    };

    const handleTimeFrameChange = (event) => {
        setTimeFrame(event.target.value);
    };

    return (
        <Root>
            <Title variant="h4">
                Analyser le marché immobilier
            </Title>

            <StyledPaper>
                <Grid container spacing={3}>
                    <Grid item xs={12} md={4}>
                        <StyledFormControl variant="outlined" fullWidth>
                            <InputLabel id="property-type-label">Type de bien</InputLabel>
                            <Select
                                labelId="property-type-label"
                                id="property-type"
                                value={propertyType}
                                onChange={handlePropertyTypeChange}
                                label="Type de bien"
                            >
                                <MenuItem value="apartment">Appartement</MenuItem>
                                <MenuItem value="house">Maison</MenuItem>
                                <MenuItem value="land">Terrain</MenuItem>
                            </Select>
                        </StyledFormControl>
                    </Grid>
                    <Grid item xs={12} md={4}>
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
                    <Grid item xs={12} md={4}>
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
                </Grid>

                <ActionButton
                    variant="contained"
                    color="primary"
                    fullWidth
                >
                    Analyser
                </ActionButton>
            </StyledPaper>

            <StyledPaper>
                <Typography variant="h6" gutterBottom>
                    Résultats de l'analyse
                </Typography>
                <Typography variant="subtitle1" gutterBottom>
                    {analysisType === 'price' && 'Prix moyen au m² '}
                    {analysisType === 'evolution' && 'Évolution des prix '}
                    {analysisType === 'transactions' && 'Volume de transactions '}
                    par ville pour les {propertyType === 'apartment' && 'appartements'}
                    {propertyType === 'house' && 'maisons'}
                    {propertyType === 'land' && 'terrains'}
                    {timeFrame === '2023' && ' en 2023'}
                    {timeFrame === '2022' && ' en 2022'}
                    {timeFrame === '5-years' && ' sur les 5 dernières années'}
                    {timeFrame === '10-years' && ' sur les 10 dernières années'}
                </Typography>
                <ChartContainer>
                    <SimpleBarChart data={dummyData} />
                </ChartContainer>
            </StyledPaper>
        </Root>
    );
};

export default AnalysePage;
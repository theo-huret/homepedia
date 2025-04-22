import React, { useState } from 'react';
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
    styled
} from '@mui/material';
import MapComponent from '../components/maps/MapComponent';

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
}));

const ExplorerPage = () => {
    const [region, setRegion] = useState('');
    const [indicator, setIndicator] = useState('prix');

    const handleRegionChange = (event) => {
        setRegion(event.target.value);
    };

    const handleIndicatorChange = (event) => {
        setIndicator(event.target.value);
    };

    return (
        <Root>
            <Title variant="h4">
                Explorer le marché immobilier
            </Title>

            <StyledPaper>
                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
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
                                <MenuItem value="ile-de-france">Île-de-France</MenuItem>
                                <MenuItem value="auvergne-rhone-alpes">Auvergne-Rhône-Alpes</MenuItem>
                                <MenuItem value="nouvelle-aquitaine">Nouvelle-Aquitaine</MenuItem>
                                <MenuItem value="occitanie">Occitanie</MenuItem>
                                <MenuItem value="hauts-de-france">Hauts-de-France</MenuItem>
                                <MenuItem value="grand-est">Grand Est</MenuItem>
                                <MenuItem value="provence-alpes-cote-dazur">Provence-Alpes-Côte d'Azur</MenuItem>
                                <MenuItem value="normandie">Normandie</MenuItem>
                                <MenuItem value="bretagne">Bretagne</MenuItem>
                                <MenuItem value="pays-de-la-loire">Pays de la Loire</MenuItem>
                                <MenuItem value="bourgogne-franche-comte">Bourgogne-Franche-Comté</MenuItem>
                                <MenuItem value="centre-val-de-loire">Centre-Val de Loire</MenuItem>
                            </Select>
                        </StyledFormControl>
                    </Grid>
                    <Grid item xs={12} md={6}>
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
                                <MenuItem value="loyer">Loyer moyen</MenuItem>
                            </Select>
                        </StyledFormControl>
                    </Grid>
                </Grid>
            </StyledPaper>

            <StyledPaper>
                <Typography variant="h6" gutterBottom>
                    Carte interactive
                </Typography>
                <MapContainer>
                    <MapComponent region={region} indicator={indicator} />
                </MapContainer>
            </StyledPaper>
        </Root>
    );
};

export default ExplorerPage;
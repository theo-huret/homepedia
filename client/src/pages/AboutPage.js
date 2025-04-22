import React from 'react';
import {
    Container,
    Typography,
    Paper,
    Box,
    Grid,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    styled
} from '@mui/material';
import DataUsageIcon from '@mui/icons-material/DataUsage';
import StorageIcon from '@mui/icons-material/Storage';
import TimelineIcon from '@mui/icons-material/Timeline';
import PublicIcon from '@mui/icons-material/Public';

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

const Section = styled(Box)(({ theme }) => ({
    marginTop: theme.spacing(4),
}));

const StyledIcon = styled(Box)(({ theme }) => ({
    color: theme.palette.primary.main,
}));

const AboutPage = () => {
    return (
        <Root>
            <Title variant="h4">
                À propos de HOMEPEDIA
            </Title>

            <StyledPaper>
                <Typography variant="h6" gutterBottom>
                    Notre mission
                </Typography>
                <Typography variant="body1" paragraph>
                    HOMEPEDIA a pour mission de rendre l'information sur le marché immobilier français accessible,
                    compréhensible et exploitable par tous. Que vous soyez un acheteur potentiel,
                    un investisseur, un étudiant ou un professionnel de l'immobilier, notre plateforme
                    vous offre des outils d'analyse et de visualisation pour mieux comprendre les dynamiques
                    du marché.
                </Typography>
            </StyledPaper>

            <Section>
                <Typography variant="h5" gutterBottom>
                    Nos données
                </Typography>
                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <StyledPaper>
                            <List>
                                <ListItem>
                                    <ListItemIcon>
                                        <StyledIcon component={DataUsageIcon} />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary="Données immobilières"
                                        secondary="Prix, transactions, surfaces, typologies, etc."
                                    />
                                </ListItem>
                                <ListItem>
                                    <ListItemIcon>
                                        <StyledIcon component={PublicIcon} />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary="Couverture géographique"
                                        secondary="Nationale, régionale, départementale et communale"
                                    />
                                </ListItem>
                            </List>
                        </StyledPaper>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <StyledPaper>
                            <List>
                                <ListItem>
                                    <ListItemIcon>
                                        <StyledIcon component={StorageIcon} />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary="Sources"
                                        secondary="INSEE, data.gouv.fr, et autres sources publiques"
                                    />
                                </ListItem>
                                <ListItem>
                                    <ListItemIcon>
                                        <StyledIcon component={TimelineIcon} />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary="Indicateurs complémentaires"
                                        secondary="Économie, éducation, environnement, infrastructures, etc."
                                    />
                                </ListItem>
                            </List>
                        </StyledPaper>
                    </Grid>
                </Grid>
            </Section>

            <StyledPaper sx={{ marginTop: '24px' }}>
                <Typography variant="h6" gutterBottom>
                    Technologies utilisées
                </Typography>
                <Typography variant="body1" paragraph>
                    HOMEPEDIA utilise des technologies modernes pour offrir une expérience utilisateur
                    fluide et performante : React pour l'interface utilisateur, Node.js pour le backend,
                    PostgreSQL et MongoDB pour le stockage des données, ainsi que des outils avancés pour
                    le traitement des big data comme Hadoop et Spark. Nos visualisations sont créées avec
                    D3.js et Recharts, offrant une expérience interactive et informative.
                </Typography>
                <Grid container spacing={2} sx={{ marginTop: '16px' }}>
                    <Grid item xs={6} sm={3}>
                        <Box sx={{ textAlign: 'center' }}>
                            <img src="https://via.placeholder.com/60x60?text=React" alt="React" style={{ borderRadius: '4px' }} />
                            <Typography variant="body2" sx={{ marginTop: '8px' }}>React</Typography>
                        </Box>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                        <Box sx={{ textAlign: 'center' }}>
                            <img src="https://via.placeholder.com/60x60?text=Node.js" alt="Node.js" style={{ borderRadius: '4px' }} />
                            <Typography variant="body2" sx={{ marginTop: '8px' }}>Node.js</Typography>
                        </Box>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                        <Box sx={{ textAlign: 'center' }}>
                            <img src="https://via.placeholder.com/60x60?text=D3.js" alt="D3.js" style={{ borderRadius: '4px' }} />
                            <Typography variant="body2" sx={{ marginTop: '8px' }}>D3.js</Typography>
                        </Box>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                        <Box sx={{ textAlign: 'center' }}>
                            <img src="https://via.placeholder.com/60x60?text=PostgreSQL" alt="PostgreSQL" style={{ borderRadius: '4px' }} />
                            <Typography variant="body2" sx={{ marginTop: '8px' }}>PostgreSQL</Typography>
                        </Box>
                    </Grid>
                </Grid>
            </StyledPaper>

            <StyledPaper sx={{ marginTop: '24px' }}>
                <Typography variant="h6" gutterBottom>
                    Contact
                </Typography>
                <Typography variant="body1">
                    Pour toute question ou suggestion concernant HOMEPEDIA, n'hésitez pas à nous contacter à l'adresse :
                    <Box component="span" fontWeight="medium" sx={{ marginLeft: '8px' }}>
                        contact@homepedia.fr
                    </Box>
                </Typography>
            </StyledPaper>
        </Root>
    );
};

export default AboutPage;
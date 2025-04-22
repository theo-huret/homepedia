import React, { useRef, useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Box, Typography } from '@mui/material';

const MAPBOX_TOKEN = 'pk.eyJ1Ijoic3RvbXBhciIsImEiOiJjbTlzbTEyZ3owMXhqMnJyNm1meGc1YXd1In0.IQecquzqoSmFlMraw4J0oA';

const MapComponent = ({ region, indicator }) => {
    const mapContainer = useRef(null);
    const map = useRef(null);

    useEffect(() => {
        if (!mapContainer.current) return;

        mapboxgl.accessToken = MAPBOX_TOKEN;

        if (!map.current) {
            map.current = new mapboxgl.Map({
                container: mapContainer.current,
                style: 'mapbox://styles/mapbox/light-v10',
                center: [2.213749, 46.227638], // Centre de la France
                zoom: 5
            });

            map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
        }

        if (region) {
            const regionCoordinates = {
                'ile-de-france': { center: [2.3522, 48.8566], zoom: 8 },
                'auvergne-rhone-alpes': { center: [4.3872, 45.4397], zoom: 7 },
                'nouvelle-aquitaine': { center: [-0.5795, 44.8378], zoom: 7 },
                'occitanie': { center: [1.4442, 43.6047], zoom: 7 },
                'hauts-de-france': { center: [2.7883, 50.6292], zoom: 7 },
                'grand-est': { center: [5.5734, 48.6998], zoom: 7 },
                'provence-alpes-cote-dazur': { center: [5.9459, 43.5298], zoom: 7 },
                'normandie': { center: [0.1043, 49.2733], zoom: 7 },
                'bretagne': { center: [-2.7601, 48.1142], zoom: 7 },
                'pays-de-la-loire': { center: [-0.8545, 47.4784], zoom: 7 },
                'bourgogne-franche-comte': { center: [5.0414, 47.2803], zoom: 7 },
                'centre-val-de-loire': { center: [1.6790, 47.7511], zoom: 7 }
            };

            if (regionCoordinates[region]) {
                map.current.flyTo({
                    center: regionCoordinates[region].center,
                    zoom: regionCoordinates[region].zoom,
                    essential: true
                });
            }
        }

        return () => {};
    }, [region]);

    return (
        <>
            {!MAPBOX_TOKEN.includes('example') ? (
                <Box ref={mapContainer} sx={{ width: '100%', height: '100%' }} />
            ) : (
                <Box
                    sx={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: '#f5f5f5',
                        border: '1px solid #ddd'
                    }}
                >
                    <Typography variant="subtitle1" color="textSecondary">
                        Pour afficher la carte, veuillez configurer un token Mapbox valide.
                    </Typography>
                </Box>
            )}
        </>
    );
};

export default MapComponent;
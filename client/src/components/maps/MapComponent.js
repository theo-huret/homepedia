import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Box, Typography } from '@mui/material';

const MAPBOX_TOKEN = 'pk.eyJ1Ijoic3RvbXBhciIsImEiOiJjbTlzbTEyZ3owMXhqMnJyNm1meGc1YXd1In0.IQecquzqoSmFlMraw4J0oA';

const MapComponent = ({ region, indicator, data = [] }) => {
    const mapContainer = useRef(null);
    const map = useRef(null);
    const [legendData, setLegendData] = useState(null);
    const markersRef = useRef([]);

    // Initialiser la carte
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

        return () => {
            // Nettoyage au démontage du composant
            markersRef.current.forEach(marker => marker.remove());
            markersRef.current = [];
        };
    }, []);

    // Centrer la carte sur la région sélectionnée
    useEffect(() => {
        if (!map.current) return;

        if (region) {
            // Ces valeurs sont fictives, il faudrait les remplacer par les vraies coordonnées
            const regionCoordinates = {
                '11': { center: [2.3522, 48.8566], zoom: 8 }, // Île-de-France
                '84': { center: [4.3872, 45.4397], zoom: 7 }, // Auvergne-Rhône-Alpes
                '75': { center: [-0.5795, 44.8378], zoom: 7 }, // Nouvelle-Aquitaine
                '76': { center: [1.4442, 43.6047], zoom: 7 }, // Occitanie
                '32': { center: [2.7883, 50.6292], zoom: 7 }, // Hauts-de-France
                '44': { center: [5.5734, 48.6998], zoom: 7 }, // Grand Est
                '93': { center: [5.9459, 43.5298], zoom: 7 }, // Provence-Alpes-Côte d'Azur
                '28': { center: [0.1043, 49.2733], zoom: 7 }, // Normandie
                '53': { center: [-2.7601, 48.1142], zoom: 7 }, // Bretagne
                '52': { center: [-0.8545, 47.4784], zoom: 7 }, // Pays de la Loire
                '27': { center: [5.0414, 47.2803], zoom: 7 }, // Bourgogne-Franche-Comté
                '24': { center: [1.6790, 47.7511], zoom: 7 }  // Centre-Val de Loire
            };

            const regionId = region.toString();
            if (regionCoordinates[regionId]) {
                map.current.flyTo({
                    center: regionCoordinates[regionId].center,
                    zoom: regionCoordinates[regionId].zoom,
                    essential: true
                });
            }
        } else {
            // Vue d'ensemble de la France
            map.current.flyTo({
                center: [2.213749, 46.227638],
                zoom: 5,
                essential: true
            });
        }
    }, [region]);

    // Afficher les données sur la carte
    useEffect(() => {
        if (!map.current || !data || data.length === 0) return;

        // Fonction pour obtenir une couleur en fonction de la valeur
        const getColor = (value) => {
            if (indicator === 'prix') {
                if (value > 8000) return '#0d47a1';  // Bleu très foncé
                if (value > 5000) return '#1976d2';  // Bleu foncé
                if (value > 3000) return '#42a5f5';  // Bleu moyen
                if (value > 2000) return '#90caf9';  // Bleu clair
                return '#bbdefb';                    // Bleu très clair
            } else if (indicator === 'evolution') {
                if (value > 10) return '#1b5e20';    // Vert foncé (forte hausse)
                if (value > 5) return '#4caf50';     // Vert moyen
                if (value > 0) return '#a5d6a7';     // Vert clair
                if (value > -5) return '#ffcdd2';    // Rouge clair
                return '#e57373';                    // Rouge moyen (forte baisse)
            } else {
                if (value > 5000) return '#4a148c';  // Violet foncé
                if (value > 1000) return '#7b1fa2';  // Violet moyen
                if (value > 500) return '#9c27b0';   // Violet
                if (value > 100) return '#ba68c8';   // Violet clair
                return '#e1bee7';                    // Violet très clair
            }
        };

        // Mettre à jour la légende
        if (indicator === 'prix') {
            setLegendData([
                { color: '#0d47a1', label: '> 8000 €/m²' },
                { color: '#1976d2', label: '5000-8000 €/m²' },
                { color: '#42a5f5', label: '3000-5000 €/m²' },
                { color: '#90caf9', label: '2000-3000 €/m²' },
                { color: '#bbdefb', label: '< 2000 €/m²' }
            ]);
        } else if (indicator === 'evolution') {
            setLegendData([
                { color: '#1b5e20', label: '> +10%' },
                { color: '#4caf50', label: '+5% à +10%' },
                { color: '#a5d6a7', label: '0% à +5%' },
                { color: '#ffcdd2', label: '-5% à 0%' },
                { color: '#e57373', label: '< -5%' }
            ]);
        } else {
            setLegendData([
                { color: '#4a148c', label: '> 5000' },
                { color: '#7b1fa2', label: '1000-5000' },
                { color: '#9c27b0', label: '500-1000' },
                { color: '#ba68c8', label: '100-500' },
                { color: '#e1bee7', label: '< 100' }
            ]);
        }

        // Nettoyer les marqueurs existants
        markersRef.current.forEach(marker => marker.remove());
        markersRef.current = [];

        // Ajouter les nouveaux marqueurs
        data.forEach(item => {
            let value;
            if (indicator === 'prix') {
                value = item.prix_moyen_m2;
            } else if (indicator === 'evolution') {
                value = item.evolution_prix;
            } else {
                value = item.nombre_transactions;
            }

            if (!value) return;

            const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
                <div style="padding: 10px;">
                    <h4 style="margin: 0 0 8px 0;">${item.nom}</h4>
                    <p style="margin: 0;">${indicator === 'prix' ? 'Prix moyen: ' + value + ' €/m²' :
                (indicator === 'evolution' ? 'Évolution: ' + value + '%' :
                    'Transactions: ' + value)}</p>
                </div>
            `);

            // Si nous avons des coordonnées directes
            if (item.latitude && item.longitude) {
                const marker = new mapboxgl.Marker({
                    color: getColor(value)
                })
                    .setLngLat([item.longitude, item.latitude])
                    .setPopup(popup)
                    .addTo(map.current);

                markersRef.current.push(marker);
            }
            // Si nous avons seulement un code (pour les régions/départements)
            else {
                // Ici tu peux récupérer les coordonnées des régions/départements à partir d'un fichier GeoJSON
                fetch('path_to_your_geojson_file.geojson')  // Remplace par le chemin de ton fichier GeoJSON
                    .then(response => response.json())
                    .then(geojsonData => {
                        // Trouver la région ou le département dans les données GeoJSON en fonction du code
                        const regionOrDepartement = geojsonData.features.find(feature => {
                            return feature.properties.code === item.code;  // Assurez-vous que 'code' correspond à la clé dans tes données GeoJSON
                        });

                        if (regionOrDepartement) {
                            // Ajouter une couche de frontières de la région/département
                            const boundary = regionOrDepartement.geometry.coordinates;

                            // Si la région/département est un multipolygone, il peut y avoir plusieurs coordonnées
                            if (boundary.length > 1) {
                                boundary.forEach(coords => {
                                    const polygon = new mapboxgl.Polygon(coords);
                                    map.current.addLayer({
                                        id: `boundary-${item.code}`,
                                        type: 'fill',
                                        source: {
                                            type: 'geojson',
                                            data: {
                                                type: 'Feature',
                                                geometry: {
                                                    type: 'Polygon',
                                                    coordinates: coords
                                                }
                                            }
                                        },
                                        paint: {
                                            'fill-color': '#f00',  // Choisir une couleur pour la frontière
                                            'fill-opacity': 0.3
                                        }
                                    });
                                });
                            } else {
                                // Si c'est une seule frontière (pas un multipolygone)
                                const polygon = new mapboxgl.Polygon(boundary);
                                map.current.addLayer({
                                    id: `boundary-${item.code}`,
                                    type: 'fill',
                                    source: {
                                        type: 'geojson',
                                        data: regionOrDepartement
                                    },
                                    paint: {
                                        'fill-color': '#f00',
                                        'fill-opacity': 0.3
                                    }
                                });
                            }
                        } else {
                            console.log(`Pas de coordonnées disponibles pour ${item.nom}`);
                        }
                    })
                    .catch(error => {
                        console.error('Erreur lors du chargement du fichier GeoJSON', error);
                    });
            }
        });

    }, [data, indicator]);

    return (
        <>
            {!MAPBOX_TOKEN.includes('example') ? (
                <Box sx={{ width: '100%', height: '100%', position: 'relative' }}>
                    <Box ref={mapContainer} sx={{ width: '100%', height: '100%' }} />
                    {legendData && (
                        <Box sx={{
                            position: 'absolute',
                            bottom: 20,
                            right: 20,
                            backgroundColor: 'rgba(255,255,255,0.8)',
                            padding: 2,
                            borderRadius: 1,
                            boxShadow: 1,
                            zIndex: 1
                        }}>
                            <Typography variant="subtitle2" gutterBottom>Légende</Typography>
                            {legendData.map((item, index) => (
                                <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                                    <Box sx={{ width: 16, height: 16, backgroundColor: item.color, mr: 1 }} />
                                    <Typography variant="caption">{item.label}</Typography>
                                </Box>
                            ))}
                        </Box>
                    )}
                </Box>
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
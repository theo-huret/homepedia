import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Box, Typography, Alert } from '@mui/material';

// Token MapBox
const MAPBOX_TOKEN = 'pk.eyJ1Ijoic3RvbXBhciIsImEiOiJjbTlzbTEyZ3owMXhqMnJyNm1meGc1YXd1In0.IQecquzqoSmFlMraw4J0oA';

// Coordonnées des régions françaises avec IDs correspondant à l'API
const REGIONS = {
    // Métropole
    "4": [2.35, 48.85, 8],  // Île-de-France
    "5": [1.7, 47.8, 7],    // Centre-Val de Loire
    "6": [5.0, 47.3, 7],    // Bourgogne-Franche-Comté
    "7": [0.1, 49.2, 7],    // Normandie
    "8": [2.8, 50.6, 7],    // Hauts-de-France
    "9": [5.5, 48.7, 7],    // Grand Est
    "10": [-0.8, 47.5, 7],  // Pays de la Loire
    "11": [-2.8, 48.1, 7],  // Bretagne
    "12": [-0.6, 44.8, 7],  // Nouvelle-Aquitaine
    "13": [1.4, 43.6, 7],   // Occitanie
    "14": [4.4, 45.4, 7],   // Auvergne-Rhône-Alpes
    "15": [6.0, 43.5, 7],   // Provence-Alpes-Côte d'Azur
    "16": [9.0, 42.2, 8],   // Corse
    // DOM-TOM
    "17": [-61.6, 16.25, 9], // Guadeloupe
    "18": [-61.0, 14.7, 9],  // Martinique
    "19": [-53.0, 4.0, 7],   // Guyane
    "20": [55.5, -21.1, 9],  // La Réunion
    "21": [45.2, -12.8, 10]  // Mayotte
};

// Noms des régions pour la légende
const REGION_NAMES = {
    "4": "Île-de-France",
    "5": "Centre-Val de Loire",
    "6": "Bourgogne-Franche-Comté",
    "7": "Normandie",
    "8": "Hauts-de-France",
    "9": "Grand Est",
    "10": "Pays de la Loire",
    "11": "Bretagne",
    "12": "Nouvelle-Aquitaine",
    "13": "Occitanie",
    "14": "Auvergne-Rhône-Alpes",
    "15": "Provence-Alpes-Côte d'Azur",
    "16": "Corse",
    "17": "Guadeloupe",
    "18": "Martinique",
    "19": "Guyane",
    "20": "La Réunion",
    "21": "Mayotte"
};

// Coordonnées des départements français
const DEPARTEMENTS = {
    // Format: code: [longitude, latitude]
    "01": [5.33, 46.10], "02": [3.62, 49.57], "03": [3.33, 46.57],
    "04": [6.23, 44.08], "05": [6.50, 44.67], "06": [7.25, 43.70],
    "07": [4.60, 44.75], "08": [4.72, 49.50], "09": [1.60, 42.93],
    "10": [4.17, 48.33], "11": [2.35, 43.22], "12": [2.58, 44.35],
    "13": [5.43, 43.53], "14": [-0.35, 49.18], "15": [2.67, 45.03],
    "16": [0.33, 45.70], "17": [-0.63, 45.75], "18": [2.50, 47.08],
    "19": [1.83, 45.33], "2A": [8.73, 41.92], "2B": [9.38, 42.38],
    "21": [5.02, 47.32], "22": [-2.78, 48.52], "23": [2.08, 46.00],
    "24": [0.75, 45.00], "25": [6.03, 47.25], "26": [5.17, 44.75],
    "27": [1.15, 49.03], "28": [1.50, 48.45], "29": [-4.10, 48.00],
    "30": [4.08, 44.13], "31": [1.43, 43.60], "32": [0.58, 43.65],
    "33": [-0.57, 44.83], "34": [3.88, 43.62], "35": [-1.68, 48.12],
    "36": [1.72, 46.80], "37": [0.68, 47.25], "38": [5.73, 45.27],
    "39": [5.55, 46.67], "40": [-0.50, 43.83], "41": [1.43, 47.60],
    "42": [4.30, 45.73], "43": [3.88, 45.05], "44": [-1.58, 47.23],
    "45": [2.12, 47.92], "46": [1.68, 44.62], "47": [0.50, 44.33],
    "48": [3.50, 44.52], "49": [-0.55, 47.47], "50": [-1.08, 49.12],
    "51": [4.33, 49.00], "52": [5.13, 48.12], "53": [-0.77, 48.07],
    "54": [6.20, 48.70], "55": [5.33, 49.00], "56": [-2.75, 47.75],
    "57": [6.17, 49.13], "58": [3.50, 47.08], "59": [3.07, 50.63],
    "60": [2.08, 49.43], "61": [0.08, 48.58], "62": [2.53, 50.53],
    "63": [3.08, 45.78], "64": [-0.77, 43.33], "65": [0.15, 43.03],
    "66": [2.90, 42.70], "67": [7.75, 48.58], "68": [7.35, 47.95],
    "69": [4.85, 45.75], "70": [6.08, 47.63], "71": [4.50, 46.58],
    "72": [0.20, 48.00], "73": [6.30, 45.57], "74": [6.33, 46.00],
    "75": [2.35, 48.86], "76": [0.93, 49.65], "77": [3.08, 48.60],
    "78": [1.95, 48.80], "79": [-0.33, 46.50], "80": [2.30, 49.90],
    "81": [2.15, 43.93], "82": [1.35, 44.02], "83": [6.27, 43.42],
    "84": [5.03, 44.03], "85": [-1.43, 46.67], "86": [0.33, 46.58],
    "87": [1.25, 45.83], "88": [6.38, 48.20], "89": [3.57, 47.80],
    "90": [6.87, 47.63], "91": [2.15, 48.45], "92": [2.25, 48.88],
    "93": [2.48, 48.92], "94": [2.47, 48.78], "95": [2.13, 49.08],
    // DOM-TOM
    "971": [-61.58, 16.25], "972": [-61.00, 14.67], "973": [-53.00, 4.00],
    "974": [55.53, -21.11], "976": [45.23, -12.78]
};

const MapComponent = ({ region, indicator, data = [] }) => {
    const mapContainer = useRef(null);
    const map = useRef(null);
    const [legendData, setLegendData] = useState(null);
    const markersRef = useRef([]);
    const [mapLoaded, setMapLoaded] = useState(false);
    const [error, setError] = useState(null);

    // Initialisation de la carte
    useEffect(() => {
        console.log("🔄 Initialisation de la carte");

        if (!mapContainer.current) {
            console.warn("❌ Container de carte non disponible");
            return;
        }

        try {
            mapboxgl.accessToken = MAPBOX_TOKEN;

            if (!map.current) {
                map.current = new mapboxgl.Map({
                    container: mapContainer.current,
                    style: 'mapbox://styles/mapbox/light-v10',
                    center: [2.21, 46.23], // Centre de la France
                    zoom: 5
                });

                map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

                map.current.on('load', () => {
                    console.log("✅ Carte chargée avec succès");
                    setMapLoaded(true);
                });

                map.current.on('error', (e) => {
                    console.error("❌ Erreur Mapbox:", e);
                    setError(`Erreur de carte: ${e.error?.message || 'Erreur inconnue'}`);
                });
            }
        } catch (err) {
            console.error("❌ Erreur lors de l'initialisation de la carte:", err);
            setError(`Erreur d'initialisation: ${err.message}`);
        }

        return () => {
            console.log("🧹 Nettoyage complet");
            markersRef.current.forEach(marker => marker.remove());
            markersRef.current = [];

            if (map.current) {
                map.current.remove();
                map.current = null;
            }
        };
    }, []);

    useEffect(() => {
        if (!map.current || !mapLoaded) {
            console.log("⏳ Attente du chargement de la carte pour le centrage");
            return;
        }

        try {
            if (region) {
                const regionId = region.toString();
                console.log("🔍 Centrage sur la région ID:", regionId);

                if (REGIONS[regionId]) {
                    const [longitude, latitude, zoom] = REGIONS[regionId];
                    console.log(`🎯 Centrage carte: [${longitude}, ${latitude}], zoom=${zoom}`);

                    map.current.flyTo({
                        center: [longitude, latitude],
                        zoom: zoom || 7,
                        essential: true
                    });
                } else {
                    console.warn(`⚠️ Région ID=${regionId} non trouvée - affichage de la France entière`);
                    map.current.flyTo({
                        center: [2.21, 46.23],
                        zoom: 5,
                        essential: true
                    });
                }
            } else {
                console.log("🌍 Affichage de la France entière");
                map.current.flyTo({
                    center: [2.21, 46.23],
                    zoom: 5,
                    essential: true
                });
            }
        } catch (err) {
            console.error("❌ Erreur lors du centrage de la carte:", err);
            setError(`Erreur de centrage: ${err.message}`);
        }
    }, [region, mapLoaded]);

    useEffect(() => {
        if (!map.current || !mapLoaded) {
            console.log("⏳ Attente de la carte pour l'affichage des données");
            return;
        }

        displayDefaultRegions();

        console.log(`📊 Affichage de ${data.length} éléments sur la carte (indicateur: ${indicator})`);
        if (data.length > 0) {
            console.log("📋 Premier élément des données:", data[0]);
        }

        try {
            markersRef.current.forEach(marker => marker.remove());
            markersRef.current = [];

            // Si pas de données, afficher un message
            if (!data || data.length === 0) {
                console.warn("⚠️ Pas de données à afficher");
                setError("Aucune donnée disponible pour cet indicateur.");
                return;
            }

            // Trouver les valeurs min et max pour ajuster l'échelle des couleurs
            let minValue = Infinity;
            let maxValue = -Infinity;

            data.forEach(item => {
                let value;
                if (indicator === 'prix') {
                    value = parseFloat(item.prix_moyen_m2);
                } else if (indicator === 'evolution') {
                    value = parseFloat(item.evolution_prix);
                } else {
                    value = parseInt(item.nombre_transactions);
                }

                if (!isNaN(value)) {
                    minValue = Math.min(minValue, value);
                    maxValue = Math.max(maxValue, value);
                }
            });

            console.log(`Valeurs pour ${indicator}: min=${minValue.toFixed(2)}, max=${maxValue.toFixed(2)}`);

            // Si pas de valeurs valides, afficher un message
            if (minValue === Infinity || maxValue === -Infinity) {
                console.warn("⚠️ Pas de valeurs valides trouvées dans les données");
                setError("Aucune donnée valide trouvée pour cet indicateur.");
                return;
            }

            // Fonction pour obtenir une couleur selon la valeur
            const getColor = (value) => {
                if (indicator === 'prix') {
                    // Échelle adaptative pour les prix immobiliers
                    const threshold1 = minValue + (maxValue - minValue) * 0.2;
                    const threshold2 = minValue + (maxValue - minValue) * 0.4;
                    const threshold3 = minValue + (maxValue - minValue) * 0.6;
                    const threshold4 = minValue + (maxValue - minValue) * 0.8;

                    if (value > threshold4) return '#0d47a1'; // Bleu très foncé
                    if (value > threshold3) return '#1976d2'; // Bleu foncé
                    if (value > threshold2) return '#42a5f5'; // Bleu moyen
                    if (value > threshold1) return '#90caf9'; // Bleu clair
                    return '#bbdefb';                         // Bleu très clair
                } else if (indicator === 'evolution') {
                    // Pour l'évolution, seuils FIXES comme dans l'ancienne version
                    if (value > 10) return '#1b5e20';    // Vert foncé (forte hausse)
                    if (value > 5) return '#4caf50';     // Vert moyen
                    if (value > 0) return '#a5d6a7';     // Vert clair
                    if (value > -5) return '#ffcdd2';    // Rouge clair
                    return '#e57373';                    // Rouge moyen (forte baisse)
                } else {
                    // Pour les transactions, échelle violette adaptative
                    const threshold1 = minValue + (maxValue - minValue) * 0.2;
                    const threshold2 = minValue + (maxValue - minValue) * 0.4;
                    const threshold3 = minValue + (maxValue - minValue) * 0.6;
                    const threshold4 = minValue + (maxValue - minValue) * 0.8;

                    if (value > threshold4) return '#4a148c'; // Violet foncé
                    if (value > threshold3) return '#7b1fa2'; // Violet moyen
                    if (value > threshold2) return '#9c27b0'; // Violet
                    if (value > threshold1) return '#ba68c8'; // Violet clair
                    return '#e1bee7';                         // Violet très clair
                }
            };

            // Mise à jour de la légende avec des seuils adaptés
            if (indicator === 'prix') {
                const threshold1 = Math.round(minValue + (maxValue - minValue) * 0.2);
                const threshold2 = Math.round(minValue + (maxValue - minValue) * 0.4);
                const threshold3 = Math.round(minValue + (maxValue - minValue) * 0.6);
                const threshold4 = Math.round(minValue + (maxValue - minValue) * 0.8);

                setLegendData([
                    { color: '#0d47a1', label: `> ${threshold4} €/m²` },
                    { color: '#1976d2', label: `${threshold3} - ${threshold4} €/m²` },
                    { color: '#42a5f5', label: `${threshold2} - ${threshold3} €/m²` },
                    { color: '#90caf9', label: `${threshold1} - ${threshold2} €/m²` },
                    { color: '#bbdefb', label: `< ${threshold1} €/m²` }
                ]);
            } else if (indicator === 'evolution') {
                // Légende FIXE pour l'évolution comme dans l'ancienne version
                setLegendData([
                    { color: '#1b5e20', label: '> +10%' },
                    { color: '#4caf50', label: '+5% à +10%' },
                    { color: '#a5d6a7', label: '0% à +5%' },
                    { color: '#ffcdd2', label: '-5% à 0%' },
                    { color: '#e57373', label: '< -5%' }
                ]);
            } else {
                const threshold1 = Math.round(minValue + (maxValue - minValue) * 0.2);
                const threshold2 = Math.round(minValue + (maxValue - minValue) * 0.4);
                const threshold3 = Math.round(minValue + (maxValue - minValue) * 0.6);
                const threshold4 = Math.round(minValue + (maxValue - minValue) * 0.8);

                setLegendData([
                    { color: '#4a148c', label: `> ${threshold4}` },
                    { color: '#7b1fa2', label: `${threshold3} - ${threshold4}` },
                    { color: '#9c27b0', label: `${threshold2} - ${threshold3}` },
                    { color: '#ba68c8', label: `${threshold1} - ${threshold2}` },
                    { color: '#e1bee7', label: `< ${threshold1}` }
                ]);
            }

            // Ajouter les marqueurs pour chaque élément
            let markersAdded = 0;
            data.forEach(item => {
                // Extraire la valeur selon l'indicateur
                let value;
                if (indicator === 'prix') {
                    value = parseFloat(item.prix_moyen_m2);
                } else if (indicator === 'evolution') {
                    value = parseFloat(item.evolution_prix);
                } else {
                    value = parseInt(item.nombre_transactions);
                }

                if (isNaN(value)) {
                    console.warn(`⚠️ Valeur invalide pour ${item.nom || 'item inconnu'}: ${value}`);
                    return;
                }

                // Contenu du popup
                const popupContent = `
                    <div style="padding: 10px;">
                        <h4 style="margin: 0 0 8px 0;">${item.nom || 'N/A'}</h4>
                        <p style="margin: 0;">
                            ${indicator === 'prix'
                    ? 'Prix moyen: ' + value.toFixed(2) + ' €/m²'
                    : (indicator === 'evolution'
                        ? 'Évolution: ' + value.toFixed(2) + '%'
                        : 'Transactions: ' + value)}
                        </p>
                    </div>
                `;

                // Trouver les coordonnées
                let lng = 0, lat = 0;
                let coordFound = false;
                console.log(item);
                if (item.longitude && item.latitude) {
                    console.log("ok");
                    lng = parseFloat(item.longitude);
                    lat = parseFloat(item.latitude);
                    if (lng !== 0 && lat !== 0) {
                        coordFound = true;
                        console.log(`Coordonnées directes trouvées pour ${item.nom}: [${lng}, ${lat}]`);
                    }
                }

                if (!coordFound && item.id) {
                    const regionId = item.id.toString();
                    if (REGIONS[regionId]) {
                        lng = REGIONS[regionId][0];
                        lat = REGIONS[regionId][1];
                        coordFound = true;
                        console.log(`✅ Coordonnées trouvées pour région ID=${regionId} (${item.nom})`);
                    }
                }

                if (!coordFound && item.code) {
                    const deptCode = item.code.toString();
                    if (DEPARTEMENTS[deptCode]) {
                        lng = DEPARTEMENTS[deptCode][0];
                        lat = DEPARTEMENTS[deptCode][1];
                        coordFound = true;
                        console.log(`✅ Coordonnées trouvées pour département ${deptCode} (${item.nom})`);
                    }
                }

                // 5. Recherche par nom dans les dictionnaires
                if (!coordFound && item.nom) {
                    // Nom de région
                    for (const [id, name] of Object.entries(REGION_NAMES)) {
                        if (name === item.nom) {
                            lng = REGIONS[id][0];
                            lat = REGIONS[id][1];
                            coordFound = true;
                            console.log(`✅ Coordonnées trouvées pour région par nom: ${item.nom}`);
                            break;
                        }
                    }
                }

                // Si on a trouvé des coordonnées, ajouter le marqueur
                if (coordFound) {
                    try {
                        const marker = new mapboxgl.Marker({
                            color: getColor(value)
                        })
                            .setLngLat([lng, lat])
                            .setPopup(new mapboxgl.Popup().setHTML(popupContent))
                            .addTo(map.current);

                        markersRef.current.push(marker);
                        markersAdded++;
                    } catch (err) {
                        console.error("❌ Erreur lors de l'ajout du marqueur:", err);
                    }
                } else {
                    console.warn(`⚠️ Coordonnées non trouvées pour: ${item.nom || 'élément sans nom'}`);
                }
            });

            console.log(`✅ ${markersAdded} marqueurs ajoutés sur la carte`);

            // Si aucun marqueur n'a été ajouté, afficher un message
            if (markersAdded === 0) {
                setError("Aucun marqueur n'a pu être ajouté. Les données ne contiennent pas de coordonnées valides.");
                // Afficher les régions par défaut
                displayDefaultRegions();
            } else {
                setError(null); // Effacer les erreurs précédentes si tout va bien
            }

        } catch (err) {
            console.error("❌ Erreur lors de l'affichage des données:", err);
            setError(`Erreur d'affichage: ${err.message}`);
        }
    }, [data, indicator, mapLoaded]);

    const displayDefaultRegions = () => {
        try {
            // Nettoyer les marqueurs existants
            markersRef.current.forEach(marker => marker.remove());
            markersRef.current = [];

            // Afficher les régions principales de France métropolitaine
            const defaultRegions = [
                { id: "4", name: "Île-de-France", color: '#1976d2' },
                { id: "14", name: "Auvergne-Rhône-Alpes", color: '#4caf50' },
                { id: "15", name: "Provence-Alpes-Côte d'Azur", color: '#f44336' },
                { id: "12", name: "Nouvelle-Aquitaine", color: '#9c27b0' },
                { id: "13", name: "Occitanie", color: '#ff9800' }
            ];

            defaultRegions.forEach(region => {
                const [lng, lat, zoom] = REGIONS[region.id];

                const marker = new mapboxgl.Marker({
                    color: region.color
                })
                    .setLngLat([lng, lat])
                    .setPopup(new mapboxgl.Popup().setHTML(`<h3>${region.name}</h3><p>Aucune donnée disponible</p>`))
                    .addTo(map.current);

                markersRef.current.push(marker);
            });

            // Mettre à jour la légende
            setLegendData(defaultRegions.map(region => ({
                color: region.color,
                label: region.name
            })));

            console.log("✅ Régions par défaut affichées");
        } catch (err) {
            console.error("❌ Erreur lors de l'affichage des régions par défaut:", err);
        }
    };

    return (
        <>
            {error && (
                <Alert severity="warning" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            <Box sx={{
                width: '100%',
                height: '100%',
                position: 'relative',
                border: '1px solid #eee',
                borderRadius: '4px',
                overflow: 'hidden'
            }}>
                <Box
                    ref={mapContainer}
                    sx={{
                        width: '100%',
                        height: '100%'
                    }}
                />

                {!mapLoaded && (
                    <Box sx={{
                        position: 'absolute',
                        top: 0, left: 0, right: 0, bottom: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: 'rgba(255,255,255,0.7)',
                        zIndex: 1
                    }}>
                        <Typography variant="body1">Chargement de la carte...</Typography>
                    </Box>
                )}

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
        </>
    );
};

export default MapComponent;
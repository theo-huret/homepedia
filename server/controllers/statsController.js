const { pgQuery } = require('../services/dbService');

const getPricesByRegion = async (req, res, next) => {
    try {
        const { annee = new Date().getFullYear() - 1, trimestre = null, typeBienId = null } = req.query;

        let query = `
            SELECT 
                r.id,
                r.code,
                r.nom,
                ROUND(AVG(pmd.prix_moyen_m2), 2) AS prix_moyen_m2,
                SUM(pmd.nombre_transactions) AS nombre_transactions
            FROM prix_moyens_departements pmd
            JOIN departements d ON pmd.departement_id = d.id
            JOIN regions r ON d.region_id = r.id
            WHERE pmd.annee = $1
        `;

        const values = [annee];
        let paramCount = 2;

        if (trimestre) {
            query += ` AND pmd.trimestre = $${paramCount}`;
            values.push(trimestre);
            paramCount++;
        }

        if (typeBienId) {
            query += ` AND pmd.type_bien_id = $${paramCount}`;
            values.push(typeBienId);
            paramCount++;
        }

        query += ` GROUP BY r.id, r.code, r.nom ORDER BY prix_moyen_m2 DESC`;

        const result = await pgQuery(query, values);

        res.status(200).json({
            success: true,
            count: result.rows.length,
            data: result.rows
        });
    } catch (error) {
        next(error);
    }
};

const getPricesByDepartement = async (req, res, next) => {
    try {
        const { regionId, annee = new Date().getFullYear() - 1, trimestre = null, typeBienId = null } = req.query;

        let query = `
            SELECT 
                d.id,
                d.code,
                d.nom,
                r.nom as region_nom,
                ROUND(AVG(pmd.prix_moyen_m2), 2) AS prix_moyen_m2,
                SUM(pmd.nombre_transactions) AS nombre_transactions
            FROM prix_moyens_departements pmd
            JOIN departements d ON pmd.departement_id = d.id
            JOIN regions r ON d.region_id = r.id
            WHERE pmd.annee = $1
        `;

        const values = [annee];
        let paramCount = 2;

        if (trimestre) {
            query += ` AND pmd.trimestre = $${paramCount}`;
            values.push(trimestre);
            paramCount++;
        }

        if (typeBienId) {
            query += ` AND pmd.type_bien_id = $${paramCount}`;
            values.push(typeBienId);
            paramCount++;
        }

        if (regionId) {
            query += ` AND d.region_id = $${paramCount}`;
            values.push(regionId);
            paramCount++;
        }

        query += ` GROUP BY d.id, d.code, d.nom, r.nom ORDER BY prix_moyen_m2 DESC`;

        const result = await pgQuery(query, values);

        res.status(200).json({
            success: true,
            count: result.rows.length,
            data: result.rows
        });
    } catch (error) {
        next(error);
    }
};

const getPricesByCommune = async (req, res, next) => {
    try {
        const { departementId, annee = new Date().getFullYear() - 1, trimestre = null, typeBienId = null, limit = 20 } = req.query;

        let query = `
            SELECT 
                c.id,
                c.code_insee,
                c.nom,
                c.longitude,
                c.latitude,
                d.code as departement_code,
                d.nom as departement_nom,
                ROUND(AVG(pmc.prix_moyen_m2), 2) AS prix_moyen_m2,
                SUM(pmc.nombre_transactions) AS nombre_transactions
            FROM prix_moyens_communes pmc
            JOIN communes c ON pmc.commune_id = c.id
            JOIN departements d ON c.departement_id = d.id
            WHERE pmc.annee = $1
        `;

        const values = [annee];
        let paramCount = 2;

        if (trimestre) {
            query += ` AND pmc.trimestre = $${paramCount}`;
            values.push(trimestre);
            paramCount++;
        }

        if (typeBienId) {
            query += ` AND pmc.type_bien_id = $${paramCount}`;
            values.push(typeBienId);
            paramCount++;
        }

        if (departementId) {
            query += ` AND c.departement_id = $${paramCount}`;
            values.push(departementId);
            paramCount++;
        }

        query += ` GROUP BY c.id, c.code_insee, c.nom, c.latitude, c.longitude, d.code, d.nom
                  ORDER BY prix_moyen_m2 DESC
                  LIMIT $${paramCount}`;
        values.push(limit);

        const result = await pgQuery(query, values);

        res.status(200).json({
            success: true,
            count: result.rows.length,
            data: result.rows
        });
    } catch (error) {
        next(error);
    }
};

const getPriceEvolution = async (req, res, next) => {
    try {
        const { regionId, departementId, communeId, typeBienId, periode = 5 } = req.query;

        const currentYear = new Date().getFullYear();
        const startYear = currentYear - periode;

        let query;
        const values = [];
        let paramCount = 1;

        if (communeId) {
            query = `
                SELECT 
                    annee,
                    ROUND(AVG(prix_moyen_m2), 2) AS prix_moyen_m2,
                    SUM(nombre_transactions) AS nombre_transactions
                FROM prix_moyens_communes
                WHERE commune_id = $${paramCount} AND annee >= $${paramCount + 1}
            `;
            values.push(communeId, startYear);
            paramCount += 2;
        } else if (departementId) {
            query = `
                SELECT 
                    annee,
                    ROUND(AVG(prix_moyen_m2), 2) AS prix_moyen_m2,
                    SUM(nombre_transactions) AS nombre_transactions
                FROM prix_moyens_departements
                WHERE departement_id = $${paramCount} AND annee >= $${paramCount + 1}
            `;
            values.push(departementId, startYear);
            paramCount += 2;
        } else if (regionId) {
            query = `
                SELECT 
                    pmd.annee,
                    ROUND(AVG(pmd.prix_moyen_m2), 2) AS prix_moyen_m2,
                    SUM(pmd.nombre_transactions) AS nombre_transactions
                FROM prix_moyens_departements pmd
                JOIN departements d ON pmd.departement_id = d.id
                WHERE d.region_id = $${paramCount} AND pmd.annee >= $${paramCount + 1}
            `;
            values.push(regionId, startYear);
            paramCount += 2;
        } else {
            query = `
                SELECT 
                    annee,
                    ROUND(AVG(prix_moyen_m2), 2) AS prix_moyen_m2,
                    SUM(nombre_transactions) AS nombre_transactions
                FROM prix_moyens_departements
                WHERE annee >= $${paramCount}
            `;
            values.push(startYear);
            paramCount++;
        }

        if (typeBienId) {
            query += ` AND type_bien_id = $${paramCount}`;
            values.push(typeBienId);
            paramCount++;
        }

        query += ` GROUP BY annee ORDER BY annee`;

        const result = await pgQuery(query, values);

        const dataWithEvolution = result.rows.map((row, index, array) => {
            if (index === 0) {
                return {
                    ...row,
                    evolution: 0
                };
            }

            const prevYear = array[index - 1];
            const evolution = prevYear.prix_moyen_m2 > 0
                ? parseFloat((((row.prix_moyen_m2 - prevYear.prix_moyen_m2) / prevYear.prix_moyen_m2) * 100).toFixed(2))
                : 0;

            return {
                ...row,
                evolution
            };
        });

        res.status(200).json({
            success: true,
            count: dataWithEvolution.length,
            data: dataWithEvolution
        });
    } catch (error) {
        next(error);
    }
};

const getTransactionVolume = async (req, res, next) => {
    try {
        const { regionId, departementId, communeId, typeBienId, annee = new Date().getFullYear() - 1 } = req.query;

        let query;
        const values = [];
        let paramCount = 1;

        if (communeId) {
            query = `
                SELECT 
                    t.type_bien_id,
                    tb.libelle AS type_bien,
                    COUNT(*) AS nombre_transactions,
                    ROUND(AVG(t.valeur_fonciere), 2) AS prix_moyen,
                    ROUND(AVG(t.valeur_fonciere / NULLIF(t.surface_reelle_bati, 0)), 2) AS prix_moyen_m2
                FROM transactions t
                JOIN types_bien tb ON t.type_bien_id = tb.id
                WHERE t.commune_id = $${paramCount}
                AND EXTRACT(YEAR FROM t.date_mutation) = $${paramCount + 1}
            `;
            values.push(communeId, annee);
        } else if (departementId) {
            query = `
                SELECT 
                    t.type_bien_id,
                    tb.libelle AS type_bien,
                    COUNT(*) AS nombre_transactions,
                    ROUND(AVG(t.valeur_fonciere), 2) AS prix_moyen,
                    ROUND(AVG(t.valeur_fonciere / NULLIF(t.surface_reelle_bati, 0)), 2) AS prix_moyen_m2
                FROM transactions t
                JOIN types_bien tb ON t.type_bien_id = tb.id
                JOIN communes c ON t.commune_id = c.id
                WHERE c.departement_id = $${paramCount}
                AND EXTRACT(YEAR FROM t.date_mutation) = $${paramCount + 1}
            `;
            values.push(departementId, annee);
        } else if (regionId) {
            query = `
                SELECT 
                    t.type_bien_id,
                    tb.libelle AS type_bien,
                    COUNT(*) AS nombre_transactions,
                    ROUND(AVG(t.valeur_fonciere), 2) AS prix_moyen,
                    ROUND(AVG(t.valeur_fonciere / NULLIF(t.surface_reelle_bati, 0)), 2) AS prix_moyen_m2
                FROM transactions t
                JOIN types_bien tb ON t.type_bien_id = tb.id
                JOIN communes c ON t.commune_id = c.id
                JOIN departements d ON c.departement_id = d.id
                WHERE d.region_id = $${paramCount}
                AND EXTRACT(YEAR FROM t.date_mutation) = $${paramCount + 1}
            `;
            values.push(regionId, annee);
        } else {
            query = `
                SELECT 
                    t.type_bien_id,
                    tb.libelle AS type_bien,
                    COUNT(*) AS nombre_transactions,
                    ROUND(AVG(t.valeur_fonciere), 2) AS prix_moyen,
                    ROUND(AVG(t.valeur_fonciere / NULLIF(t.surface_reelle_bati, 0)), 2) AS prix_moyen_m2
                FROM transactions t
                JOIN types_bien tb ON t.type_bien_id = tb.id
                WHERE EXTRACT(YEAR FROM t.date_mutation) = $${paramCount}
            `;
            values.push(annee);
        }

        if (typeBienId) {
            query += ` AND t.type_bien_id = $${paramCount + 2}`;
            values.push(typeBienId);
        }

        query += ` GROUP BY t.type_bien_id, tb.libelle ORDER BY nombre_transactions DESC`;

        const result = await pgQuery(query, values);

        res.status(200).json({
            success: true,
            count: result.rows.length,
            data: result.rows
        });
    } catch (error) {
        next(error);
    }
};

const getHomepageStats = async (req, res, next) => {
    try {
        const anneeQuery = `
            SELECT MAX(annee) as derniere_annee 
            FROM prix_moyens_departements
        `;
        const anneeResult = await pgQuery(anneeQuery);
        const derniereAnnee = anneeResult.rows[0].derniere_annee;

        const transactionsQuery = `SELECT COUNT(*) FROM transactions`;
        const transactionsResult = await pgQuery(transactionsQuery);
        const transactionsCount = parseInt(transactionsResult.rows[0].count);

        const communesQuery = `SELECT COUNT(DISTINCT commune_id) FROM prix_moyens_communes`;
        const communesResult = await pgQuery(communesQuery);
        const communesCount = parseInt(communesResult.rows[0].count);

        const prixQuery = `
            SELECT ROUND(AVG(prix_moyen_m2), 2) AS prix_moyen_france
            FROM prix_moyens_departements
            WHERE annee = $1
        `;
        const prixResult = await pgQuery(prixQuery, [derniereAnnee]);
        const prixMoyenFrance = parseFloat(prixResult.rows[0].prix_moyen_france || 0);

        const evolutionQuery = `
            SELECT 
                annee,
                ROUND(AVG(prix_moyen_m2), 2) AS prix_moyen_m2
            FROM prix_moyens_departements
            GROUP BY annee
            ORDER BY annee DESC
            LIMIT 5
        `;
        const evolutionResult = await pgQuery(evolutionQuery);

        let evolutionPrix = 0;
        if (evolutionResult.rows.length >= 2) {
            const prixRecent = evolutionResult.rows[0].prix_moyen_m2;
            const prixPrecedent = evolutionResult.rows[1].prix_moyen_m2;
            evolutionPrix = parseFloat((((prixRecent - prixPrecedent) / prixPrecedent) * 100).toFixed(2));
        }

        const topVillesQuery = `
    SELECT 
        c.nom,
        d.nom AS departement,
        ROUND(AVG(COALESCE(pmc.prix_moyen_m2, 0)), 2) AS prix_moyen_m2
    FROM prix_moyens_communes pmc
    JOIN communes c ON pmc.commune_id = c.id
    JOIN departements d ON c.departement_id = d.id
    JOIN types_bien tb ON pmc.type_bien_id = tb.id
    WHERE pmc.annee = $1
    AND tb.code = 'APPARTEMENT'
    AND pmc.nombre_transactions >= 10
    GROUP BY c.nom, d.nom
    HAVING AVG(COALESCE(pmc.prix_moyen_m2, 0)) > 0
    ORDER BY prix_moyen_m2 DESC
    LIMIT 5
`;
        const topVillesResult = await pgQuery(topVillesQuery, [derniereAnnee]);

        const regionsQuery = `
            SELECT 
                r.nom,
                ROUND(AVG(pmd.prix_moyen_m2), 2) AS prix_moyen_m2
            FROM prix_moyens_departements pmd
            JOIN departements d ON pmd.departement_id = d.id
            JOIN regions r ON d.region_id = r.id
            WHERE pmd.annee = $1
            GROUP BY r.nom
            ORDER BY prix_moyen_m2 DESC
            LIMIT 5
        `;
        const regionsResult = await pgQuery(regionsQuery, [derniereAnnee]);

        res.status(200).json({
            success: true,
            data: {
                derniere_annee: derniereAnnee,
                transactions_count: transactionsCount,
                communes_couvertes: communesCount,
                prix_moyen_france: prixMoyenFrance,
                evolution_prix: evolutionPrix,
                top_villes: topVillesResult.rows,
                top_regions: regionsResult.rows
            }
        });
    } catch (error) {
        next(error);
    }
};

const getTypesBien = async (req, res, next) => {
    try {
        const query = `SELECT id, code, libelle FROM types_bien ORDER BY libelle ASC`;
        const result = await pgQuery(query);

        res.status(200).json({
            success: true,
            count: result.rows.length,
            data: result.rows
        });
    } catch (error) {
        next(error);
    }
};

const compareZones = async (req, res, next) => {
    try {
        const {
            zone1Type, zone1Id,
            zone2Type, zone2Id,
            annee = new Date().getFullYear() - 1,
            typeBienId = 1
        } = req.query;

        if (!zone1Type || !zone1Id || !zone2Type || !zone2Id) {
            return res.status(400).json({
                success: false,
                message: 'Les paramètres zone1Type, zone1Id, zone2Type et zone2Id sont requis'
            });
        }

        const getZoneData = async (zoneType, zoneId) => {
            let query;
            let params = [annee];

            if (zoneType === 'region') {
                query = `
                    WITH price_data AS (
                        SELECT 
                            r.id, r.nom, r.code,
                            ROUND(AVG(pmd.prix_moyen_m2), 2) AS prix_moyen_m2,
                            SUM(pmd.nombre_transactions) AS nombre_transactions
                        FROM prix_moyens_departements pmd
                        JOIN departements d ON pmd.departement_id = d.id
                        JOIN regions r ON d.region_id = r.id
                        WHERE r.id = $2 AND pmd.annee = $1
                        AND pmd.type_bien_id = $3
                        GROUP BY r.id, r.nom, r.code
                    ),
                    eco_data AS (
                        SELECT 
                            AVG(ie.revenu_median) AS revenu_median,
                            AVG(ie.taux_chomage) AS taux_chomage
                        FROM indicateurs_economiques_communes ie
                        JOIN communes c ON ie.commune_id = c.id
                        JOIN departements d ON c.departement_id = d.id
                        WHERE d.region_id = $2 AND ie.annee = $1
                    )
                    SELECT 
                        pd.id, pd.nom, pd.code,
                        'region' AS type_zone,
                        pd.prix_moyen_m2,
                        pd.nombre_transactions,
                        ed.revenu_median,
                        ed.taux_chomage
                    FROM price_data pd, eco_data ed
                `;
                params.push(zoneId, typeBienId);
            } else if (zoneType === 'departement') {
                query = `
                    WITH price_data AS (
                        SELECT 
                            d.id, d.nom, d.code,
                            ROUND(AVG(pmd.prix_moyen_m2), 2) AS prix_moyen_m2,
                            SUM(pmd.nombre_transactions) AS nombre_transactions
                        FROM prix_moyens_departements pmd
                        JOIN departements d ON pmd.departement_id = d.id
                        WHERE d.id = $2 AND pmd.annee = $1
                        AND pmd.type_bien_id = $3
                        GROUP BY d.id, d.nom, d.code
                    ),
                    eco_data AS (
                        SELECT 
                            AVG(ie.revenu_median) AS revenu_median,
                            AVG(ie.taux_chomage) AS taux_chomage
                        FROM indicateurs_economiques_communes ie
                        JOIN communes c ON ie.commune_id = c.id
                        WHERE c.departement_id = $2 AND ie.annee = $1
                    )
                    SELECT 
                        pd.id, pd.nom, pd.code,
                        'departement' AS type_zone,
                        pd.prix_moyen_m2,
                        pd.nombre_transactions,
                        ed.revenu_median,
                        ed.taux_chomage
                    FROM price_data pd, eco_data ed
                `;
                params.push(zoneId, typeBienId);
            } else if (zoneType === 'commune') {
                query = `
                    WITH price_data AS (
                        SELECT 
                            c.id, c.nom, c.code_insee AS code,
                            ROUND(AVG(pmc.prix_moyen_m2), 2) AS prix_moyen_m2,
                            SUM(pmc.nombre_transactions) AS nombre_transactions
                        FROM prix_moyens_communes pmc
                        JOIN communes c ON pmc.commune_id = c.id
                        WHERE c.id = $2 AND pmc.annee = $1
                        AND pmc.type_bien_id = $3
                        GROUP BY c.id, c.nom, c.code_insee
                    ),
                    eco_data AS (
                        SELECT 
                            ie.revenu_median,
                            ie.taux_chomage
                        FROM indicateurs_economiques_communes ie
                        WHERE ie.commune_id = $2 AND ie.annee = $1
                    )
                    SELECT 
                        pd.id, pd.nom, pd.code,
                        'commune' AS type_zone,
                        pd.prix_moyen_m2,
                        pd.nombre_transactions,
                        ed.revenu_median,
                        ed.taux_chomage
                    FROM price_data pd
                    LEFT JOIN eco_data ed ON 1=1
                `;
                params.push(zoneId, typeBienId);
            } else {
                throw new Error('Type de zone invalide');
            }

            const result = await pgQuery(query, params);
            return result.rows.length > 0 ? result.rows[0] : null;
        };

        const zone1Data = await getZoneData(zone1Type, zone1Id);
        const zone2Data = await getZoneData(zone2Type, zone2Id);

        if (!zone1Data || !zone2Data) {
            return res.status(404).json({
                success: false,
                message: 'Une ou plusieurs zones spécifiées n\'ont pas été trouvées'
            });
        }

        const prixDiff = parseFloat(((zone1Data.prix_moyen_m2 - zone2Data.prix_moyen_m2) / zone2Data.prix_moyen_m2 * 100).toFixed(2));

        let revenuDiff = null;
        if (zone1Data.revenu_median && zone2Data.revenu_median) {
            revenuDiff = parseFloat(((zone1Data.revenu_median - zone2Data.revenu_median) / zone2Data.revenu_median * 100).toFixed(2));
        }

        let chomageDiff = null;
        if (zone1Data.taux_chomage && zone2Data.taux_chomage) {
            chomageDiff = parseFloat((zone1Data.taux_chomage - zone2Data.taux_chomage).toFixed(2));
        }

        res.status(200).json({
            success: true,
            data: {
                zone1: zone1Data,
                zone2: zone2Data,
                comparaison: {
                    prix_diff_pourcentage: prixDiff,
                    revenu_diff_pourcentage: revenuDiff,
                    chomage_diff_points: chomageDiff
                }
            }
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getPricesByRegion,
    getPricesByDepartement,
    getPricesByCommune,
    getPriceEvolution,
    getTransactionVolume,
    getHomepageStats,
    getTypesBien,
    compareZones
};
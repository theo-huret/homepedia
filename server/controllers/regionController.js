const { pgQuery } = require('../services/dbService');

const getAllRegions = async (req, res, next) => {
    try {
        const result = await pgQuery('SELECT id, code, nom, population, superficie FROM regions ORDER BY nom ASC');

        res.status(200).json({
            success: true,
            count: result.rows.length,
            data: result.rows
        });
    } catch (error) {
        next(error);
    }
};

const getRegionById = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!isNaN(id)) {
            const result = await pgQuery('SELECT id, code, nom, population, superficie FROM regions WHERE id = $1', [id]);

            if (result.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: `Région avec l'ID ${id} non trouvée`
                });
            }

            res.status(200).json({
                success: true,
                data: result.rows[0]
            });
        } else {
            const result = await pgQuery('SELECT id, code, nom, population, superficie FROM regions WHERE code = $1', [id]);

            if (result.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: `Région avec le code ${id} non trouvée`
                });
            }

            res.status(200).json({
                success: true,
                data: result.rows[0]
            });
        }
    } catch (error) {
        next(error);
    }
};

const getRegionStats = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { annee = new Date().getFullYear() - 1, trimestre = null } = req.query;

        let regionId = id;

        if (isNaN(id)) {
            const regionResult = await pgQuery('SELECT id FROM regions WHERE code = $1', [id]);

            if (regionResult.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: `Région avec le code ${id} non trouvée`
                });
            }

            regionId = regionResult.rows[0].id;
        }

        let query = `
            SELECT 
                tb.id AS type_bien_id,
                tb.libelle AS type_bien,
                ROUND(AVG(pm.prix_moyen_m2), 2) AS prix_moyen_m2,
                SUM(pm.nombre_transactions) AS nombre_transactions
            FROM prix_moyens_departements pm
            JOIN departements d ON pm.departement_id = d.id
            JOIN types_bien tb ON pm.type_bien_id = tb.id
            WHERE d.region_id = $1 AND pm.annee = $2
        `;

        const values = [regionId, annee];

        if (trimestre) {
            query += ` AND pm.trimestre = $3`;
            values.push(trimestre);
        }

        query += ` GROUP BY tb.id, tb.libelle ORDER BY nombre_transactions DESC`;

        const result = await pgQuery(query, values);

        const econQuery = `
            SELECT 
                ROUND(AVG(ie.revenu_median), 2) AS revenu_median_moyen,
                ROUND(AVG(ie.taux_chomage), 2) AS taux_chomage_moyen,
                ROUND(AVG(ie.taux_pauvrete), 2) AS taux_pauvrete_moyen
            FROM indicateurs_economiques_communes ie
            JOIN communes c ON ie.commune_id = c.id
            JOIN departements d ON c.departement_id = d.id
            WHERE d.region_id = $1 AND ie.annee = $2
        `;

        const econResult = await pgQuery(econQuery, [regionId, annee]);

        const deptsQuery = `
            SELECT id, code, nom, population, superficie
            FROM departements
            WHERE region_id = $1
            ORDER BY nom ASC
        `;

        const deptsResult = await pgQuery(deptsQuery, [regionId]);

        res.status(200).json({
            success: true,
            data: {
                prix: result.rows,
                indicateurs_economiques: econResult.rows[0],
                departements: deptsResult.rows
            }
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAllRegions,
    getRegionById,
    getRegionStats
};
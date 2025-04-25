const { pgQuery } = require('../services/dbService');

const getAllDepartements = async (req, res, next) => {
    try {
        const { regionId } = req.query;

        let query = `
            SELECT d.id, d.code, d.nom, d.population, d.superficie, r.id as region_id, r.nom as region_nom 
            FROM departements d
            JOIN regions r ON d.region_id = r.id
        `;

        const values = [];

        if (regionId) {
            query += ` WHERE d.region_id = $1`;
            values.push(regionId);
        }

        query += ` ORDER BY d.nom ASC`;

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

const getDepartementById = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!isNaN(id)) {
            const result = await pgQuery(`
                SELECT d.id, d.code, d.nom, d.population, d.superficie, 
                       r.id as region_id, r.nom as region_nom
                FROM departements d
                JOIN regions r ON d.region_id = r.id
                WHERE d.id = $1
            `, [id]);

            if (result.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: `Département avec l'ID ${id} non trouvé`
                });
            }

            res.status(200).json({
                success: true,
                data: result.rows[0]
            });
        } else {
            const result = await pgQuery(`
                SELECT d.id, d.code, d.nom, d.population, d.superficie, 
                       r.id as region_id, r.nom as region_nom
                FROM departements d
                JOIN regions r ON d.region_id = r.id
                WHERE d.code = $1
            `, [id]);

            if (result.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: `Département avec le code ${id} non trouvé`
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

const getDepartementStats = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { annee = new Date().getFullYear() - 1, trimestre = null } = req.query;

        let departementId = id;

        if (isNaN(id)) {
            const deptResult = await pgQuery('SELECT id FROM departements WHERE code = $1', [id]);

            if (deptResult.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: `Département avec le code ${id} non trouvé`
                });
            }

            departementId = deptResult.rows[0].id;
        }

        let query = `
            SELECT 
                tb.id AS type_bien_id,
                tb.libelle AS type_bien,
                ROUND (AVG(pm.prix_moyen_m2)::numeric, 2) as prix_moyen_m2,
                SUM(pm.nombre_transactions) AS nombre_transactions
            FROM prix_moyens_departements pm
            JOIN types_bien tb ON pm.type_bien_id = tb.id
            WHERE pm.departement_id = $1 AND pm.annee = $2
            GROUP BY tb.id, tb.libelle
        `;

        const values = [departementId, annee];

        if (trimestre) {
            query += ` AND pm.trimestre = $3`;
            values.push(trimestre);
        }

        query += ` ORDER BY nombre_transactions DESC`;

        const result = await pgQuery(query, values);

        const communesQuery = `
            SELECT id, code_insee, code_postal, nom, population, latitude, longitude
            FROM communes
            WHERE departement_id = $1
            ORDER BY population DESC NULLS LAST
            LIMIT 15
        `;

        const communesResult = await pgQuery(communesQuery, [departementId]);

        const econQuery = `
            SELECT 
                ROUND(AVG(ie.revenu_median), 2) AS revenu_median_moyen,
                ROUND(AVG(ie.taux_chomage), 2) AS taux_chomage_moyen,
                ROUND(AVG(ie.taux_pauvrete), 2) AS taux_pauvrete_moyen
            FROM indicateurs_economiques_communes ie
            JOIN communes c ON ie.commune_id = c.id
            WHERE c.departement_id = $1 AND ie.annee = $2
        `;

        const econResult = await pgQuery(econQuery, [departementId, annee]);

        res.status(200).json({
            success: true,
            data: {
                prix: result.rows,
                communes: communesResult.rows,
                indicateurs_economiques: econResult.rows[0]
            }
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAllDepartements,
    getDepartementById,
    getDepartementStats
};
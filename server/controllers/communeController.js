const { pgQuery } = require('../services/dbService');

const getCommunes = async (req, res, next) => {
    try {
        const { departementId, nom, limit = 50, page = 1 } = req.query;

        const offset = (page - 1) * limit;
        let query = `
            SELECT c.id, c.code_insee, c.code_postal, c.nom, c.population, c.superficie, 
                   c.latitude, c.longitude, d.id as departement_id, d.nom as departement_nom
            FROM communes c
            JOIN departements d ON c.departement_id = d.id
            WHERE 1=1
        `;

        const values = [];
        let paramCount = 1;

        if (departementId) {
            query += ` AND c.departement_id = $${paramCount}`;
            values.push(departementId);
            paramCount++;
        }

        if (nom) {
            query += ` AND c.nom ILIKE $${paramCount}`;
            values.push(`%${nom}%`);
            paramCount++;
        }

        query += ` ORDER BY c.nom ASC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
        values.push(limit, offset);

        const result = await pgQuery(query, values);

        let countQuery = `
            SELECT COUNT(*) 
            FROM communes c
            WHERE 1=1
        `;

        const countValues = [];
        paramCount = 1;

        if (departementId) {
            countQuery += ` AND c.departement_id = $${paramCount}`;
            countValues.push(departementId);
            paramCount++;
        }

        if (nom) {
            countQuery += ` AND c.nom ILIKE $${paramCount}`;
            countValues.push(`%${nom}%`);
            paramCount++;
        }

        const countResult = await pgQuery(countQuery, countValues);
        const totalCount = parseInt(countResult.rows[0].count);

        res.status(200).json({
            success: true,
            count: result.rows.length,
            total: totalCount,
            totalPages: Math.ceil(totalCount / limit),
            currentPage: parseInt(page),
            data: result.rows
        });
    } catch (error) {
        next(error);
    }
};

const getCommuneById = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!isNaN(id)) {
            const result = await pgQuery(`
                SELECT c.id, c.code_insee, c.code_postal, c.nom, c.population, c.superficie, 
                       c.latitude, c.longitude, d.id as departement_id, d.nom as departement_nom,
                       r.id as region_id, r.nom as region_nom
                FROM communes c
                JOIN departements d ON c.departement_id = d.id
                JOIN regions r ON d.region_id = r.id
                WHERE c.id = $1
            `, [id]);

            if (result.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: `Commune avec l'ID ${id} non trouvée`
                });
            }

            res.status(200).json({
                success: true,
                data: result.rows[0]
            });
        } else {
            const result = await pgQuery(`
                SELECT c.id, c.code_insee, c.code_postal, c.nom, c.population, c.superficie, 
                       c.latitude, c.longitude, d.id as departement_id, d.nom as departement_nom,
                       r.id as region_id, r.nom as region_nom
                FROM communes c
                JOIN departements d ON c.departement_id = d.id
                JOIN regions r ON d.region_id = r.id
                WHERE c.code_insee = $1
            `, [id]);

            if (result.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: `Commune avec le code INSEE ${id} non trouvée`
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

const getCommuneStats = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { annee = new Date().getFullYear() - 1, trimestre = null } = req.query;

        let communeId = id;

        if (isNaN(id)) {
            const communeResult = await pgQuery('SELECT id FROM communes WHERE code_insee = $1', [id]);

            if (communeResult.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: `Commune avec le code INSEE ${id} non trouvée`
                });
            }

            communeId = communeResult.rows[0].id;
        }

        let query = `
            SELECT 
                tb.id AS type_bien_id,
                tb.libelle AS type_bien,
                pm.prix_moyen_m2,
                pm.nombre_transactions
            FROM prix_moyens_communes pm
            JOIN types_bien tb ON pm.type_bien_id = tb.id
            WHERE pm.commune_id = $1 AND pm.annee = $2
        `;

        const values = [communeId, annee];

        if (trimestre) {
            query += ` AND pm.trimestre = $3`;
            values.push(trimestre);
        }

        query += ` ORDER BY pm.nombre_transactions DESC`;

        const result = await pgQuery(query, values);

        const econQuery = `
            SELECT 
                ie.revenu_median,
                ie.taux_chomage,
                ie.taux_pauvrete,
                ie.nb_entreprises
            FROM indicateurs_economiques_communes ie
            WHERE ie.commune_id = $1 AND ie.annee = $2
        `;

        const econResult = await pgQuery(econQuery, [communeId, annee]);

        const educQuery = `
            SELECT 
                ie.nb_ecoles_primaires,
                ie.nb_colleges,
                ie.nb_lycees,
                ie.nb_universites
            FROM indicateurs_education_communes ie
            WHERE ie.commune_id = $1 AND ie.annee = $2
        `;

        const educResult = await pgQuery(educQuery, [communeId, annee]);

        const transactionsQuery = `
            SELECT 
                t.id,
                t.date_mutation,
                t.nature_mutation,
                t.valeur_fonciere,
                t.surface_reelle_bati,
                t.nombre_pieces,
                t.surface_terrain,
                tb.libelle as type_bien,
                t.adresse_numero,
                t.adresse_suffixe,
                t.adresse_nom_voie,
                t.code_postal
            FROM transactions t
            JOIN types_bien tb ON t.type_bien_id = tb.id
            WHERE t.commune_id = $1
            ORDER BY t.date_mutation DESC
            LIMIT 10
        `;

        const transactionsResult = await pgQuery(transactionsQuery, [communeId]);

        res.status(200).json({
            success: true,
            data: {
                prix: result.rows,
                indicateurs_economiques: econResult.rows.length > 0 ? econResult.rows[0] : null,
                indicateurs_education: educResult.rows.length > 0 ? educResult.rows[0] : null,
                transactions_recentes: transactionsResult.rows
            }
        });
    } catch (error) {
        next(error);
    }
};

const searchCommunes = async (req, res, next) => {
    try {
        const { q, limit = 10 } = req.query;

        if (!q || q.length < 2) {
            return res.status(400).json({
                success: false,
                message: 'Veuillez fournir au moins 2 caractères pour la recherche'
            });
        }

        const query = `
            SELECT 
                c.id, 
                c.code_insee, 
                c.code_postal, 
                c.nom, 
                d.nom as departement_nom, 
                d.code as departement_code
            FROM communes c
            JOIN departements d ON c.departement_id = d.id
            WHERE c.nom ILIKE $1
            ORDER BY 
                CASE WHEN c.nom ILIKE $2 THEN 0 ELSE 1 END,
                c.population DESC NULLS LAST
            LIMIT $3
        `;

        const result = await pgQuery(query, [`%${q}%`, `${q}%`, limit]);

        res.status(200).json({
            success: true,
            count: result.rows.length,
            data: result.rows
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getCommunes,
    getCommuneById,
    getCommuneStats,
    searchCommunes
};
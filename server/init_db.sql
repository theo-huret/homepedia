CREATE TABLE regions (
                         id SERIAL PRIMARY KEY,
                         code VARCHAR(3) NOT NULL UNIQUE,
                         nom VARCHAR(100) NOT NULL,
                         population INTEGER,
                         superficie DECIMAL(10, 2),  -- en km²
                         date_maj TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE departements (
                              id SERIAL PRIMARY KEY,
                              code VARCHAR(3) NOT NULL UNIQUE,
                              nom VARCHAR(100) NOT NULL,
                              region_id INTEGER REFERENCES regions(id),
                              population INTEGER,
                              superficie DECIMAL(10, 2),  -- en km²
                              date_maj TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE communes (
                          id SERIAL PRIMARY KEY,
                          code_insee VARCHAR(5) NOT NULL UNIQUE,
                          code_postal VARCHAR(5),
                          nom VARCHAR(100) NOT NULL,
                          departement_id INTEGER REFERENCES departements(id),
                          population INTEGER,
                          superficie DECIMAL(10, 2),  -- en km²
                          latitude DECIMAL(9, 6),
                          longitude DECIMAL(9, 6),
                          date_maj TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE types_bien (
                            id SERIAL PRIMARY KEY,
                            code VARCHAR(20) NOT NULL UNIQUE,
                            libelle VARCHAR(100) NOT NULL
);

CREATE TABLE transactions (
                              id SERIAL PRIMARY KEY,
                              date_mutation DATE NOT NULL,
                              nature_mutation VARCHAR(50) NOT NULL,
                              valeur_fonciere DECIMAL(15, 2),
                              adresse_numero VARCHAR(10),
                              adresse_suffixe VARCHAR(10),
                              adresse_nom_voie VARCHAR(100),
                              adresse_code_voie VARCHAR(10),
                              code_postal VARCHAR(5),
                              commune_id INTEGER REFERENCES communes(id),
                              type_bien_id INTEGER REFERENCES types_bien(id),
                              surface_reelle_bati DECIMAL(10, 2),
                              nombre_pieces INTEGER,
                              surface_terrain DECIMAL(10, 2),
                              longitude DECIMAL(9, 6),
                              latitude DECIMAL(9, 6)
);

CREATE TABLE prix_moyens_communes (
                                      id SERIAL PRIMARY KEY,
                                      commune_id INTEGER REFERENCES communes(id),
                                      type_bien_id INTEGER REFERENCES types_bien(id),
                                      annee INTEGER NOT NULL,
                                      trimestre INTEGER,
                                      prix_moyen_m2 DECIMAL(10, 2),
                                      nombre_transactions INTEGER,
                                      date_maj TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                                      UNIQUE(commune_id, type_bien_id, annee, trimestre)
);

-- Insertion des données initiales
INSERT INTO types_bien (code, libelle) VALUES
                                           ('APPARTEMENT', 'Appartement'),
                                           ('MAISON', 'Maison'),
                                           ('TERRAIN', 'Terrain'),
                                           ('LOCAL_COMMERCIAL', 'Local commercial'),
                                           ('IMMEUBLE', 'Immeuble');

INSERT INTO regions (code, nom, population, superficie) VALUES
                                                            ('11', 'Île-de-France', 12278210, 12012.30),
                                                            ('93', 'Provence-Alpes-Côte d''Azur', 5055651, 31400.00),
                                                            ('84', 'Auvergne-Rhône-Alpes', 8042936, 69711.00);
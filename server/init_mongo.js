db.createCollection("commentaires");
db.createCollection("analyses_textuelles");
db.createCollection("tendances_marche");
db.createCollection("statistiques_navigation");

db.commentaires.createIndex({ "commune_id": 1 });
db.commentaires.createIndex({ "utilisateur_id": 1 });
db.commentaires.createIndex({ "date_creation": -1 });
db.commentaires.createIndex({ "categories": 1 });
db.commentaires.createIndex({ "sentiment_score": 1 });

db.commentaires.insertMany([
    {
        "commune_id": "75056",
        "utilisateur_id": "1",
        "note": 4,
        "texte": "Quartier dynamique avec beaucoup de commerces et transports en commun. Prix élevés mais prestations au rendez-vous.",
        "date_creation": new Date("2023-01-15"),
        "categories": ["commerces", "transport", "prix"],
        "sentiment_score": 0.65,
        "mots_cles": ["dynamique", "transports", "commerces", "cher"]
    },
    {
        "commune_id": "69123",
        "utilisateur_id": "2",
        "note": 5,
        "texte": "Excellent quartier familial, nombreux espaces verts, écoles de qualité à proximité et bonne desserte en transports.",
        "date_creation": new Date("2023-02-10"),
        "categories": ["famille", "education", "environnement", "transport"],
        "sentiment_score": 0.89,
        "mots_cles": ["familial", "écoles", "espaces verts", "transports"]
    }
]);

console.log("Initialisation de MongoDB terminée");
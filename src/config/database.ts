import { Client } from "pg";
import dotenv from "dotenv";

// Configuration de l'environnement
// Charge les variables d'environnement depuis le fichier .env
dotenv.config();

// Configuration de la connexion à la base de données PostgreSQL
const client = new Client({
    connectionString: `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`,
    ssl: {
        rejectUnauthorized: false
    }
});

// Établissement de la connexion à la base de données
// Affiche un message de succès ou d'erreur selon le résultat
client.connect()
    .then(() => console.log("✅ Connected to PostgreSQL"))
    .catch(err => console.error("❌ Database connection failed:", err));

// Exporte l'instance du client pour utilisation dans les services
export default client;

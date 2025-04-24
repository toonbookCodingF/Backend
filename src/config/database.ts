import { Client } from "pg";
import dotenv from "dotenv";

// Configuration de l'environnement
// Charge les variables d'environnement depuis le fichier .env
dotenv.config();

// Configuration de la connexion à la base de données PostgreSQL
// Utilise les variables d'environnement pour les paramètres sensibles
const client = new Client({
    host: process.env.DB_HOST, // Adresse du serveur de base de données
    port: Number(process.env.DB_PORT), // Port de connexion
    user: process.env.DB_USER, // Nom d'utilisateur
    password: process.env.DB_PASS, // Mot de passe
    database: process.env.DB_NAME, // Nom de la base de données
});

// Établissement de la connexion à la base de données
// Affiche un message de succès ou d'erreur selon le résultat
client.connect()
    .then(() => console.log("✅ Connected to PostgreSQL"))
    .catch(err => console.error("❌ Database connection failed:", err));

// Exporte l'instance du client pour utilisation dans les services
export default client;

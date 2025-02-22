import dotenv from "dotenv";
dotenv.config();
import express from "express";
import router from "./routes";
import "./config/database"; // Assure que la connexion PostgreSQL est initialisée
import cookieParser from "cookie-parser";

const app = express();
const PORT = process.env.PORT || 3000;
export const JWT_SECRET = process.env.JWT_SECRET || 'default_secret'; // Use the secret from environment variables
export const JWT_EXPIRATION = '90d';

app.use(express.json());
app.use(cookieParser()); // Use cookie-parser middleware
app.use("/api", router);

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
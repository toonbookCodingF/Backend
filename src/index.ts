import dotenv from "dotenv";
dotenv.config();
import express from "express";
import router from "./routes";
import "./config/database"; // Assure l'initialisation de PostgreSQL
import cookieParser from "cookie-parser";

const app = express();
const PORT = process.env.PORT || 3000;

// 🔥 Assure-toi que ces constantes sont bien exportées
export const JWT_SECRET = process.env.JWT_SECRET || "default_secret";
export const JWT_EXPIRATION = "90d";

app.use(express.json());
app.use(cookieParser());
app.use("/api", router);

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});

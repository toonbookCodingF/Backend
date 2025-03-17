import dotenv from "dotenv";
dotenv.config();

export const JWT_SECRET = process.env.JWT_SECRET || "default_secret";
export const JWT_EXPIRATION = process.env.JWT_EXPIRATION || "90d";

import { Request, Response } from "express";
import { getAllUsers, postUser } from "../services/user.service";

interface ApiResponse<T> {
    status: number;
    message: string;
    data?: T | null;
}

// Ajout des types pour éviter l'erreur "any"
const handleResponse = <T>(res: Response, status: number, message: string, data: T | null = null) => {
    res.status(status).json({ status, message, data });
};

export const getUsersController = async (req: Request, res: Response) => {
    try {
        const users = await getAllUsers();
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: "Something went wrong" });
    }
};

export const postUserController = async (req: Request, res: Response): Promise<void> => {
    const { username, password, email, name, lastName } = req.body;

    try {
        const newUser = await postUser({ username, password, email, name, lastName });

        if (typeof newUser === "string") {
            throw new Error("postUser returned a string instead of an object");
        }

        res.status(201).json({ message: "User created successfully", data: newUser });
    } catch (err) {
        console.error("Error creating user:", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
};


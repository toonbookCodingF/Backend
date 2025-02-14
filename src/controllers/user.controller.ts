import { Request, Response } from "express";
import { getAllUsers, postUser } from "../services/user.service";
import * as EmailValidator from 'email-validator';
import * as argon2 from "argon2";

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
        const dangerousChars = /[<>\/\\'";]/;
        if (dangerousChars.test(username) || dangerousChars.test(name) || dangerousChars.test(lastName)) {
            throw new Error("Contains invalid characters");
        }
        if (username.length < 6 || username.length > 20) {
            throw new Error("Username must be between 6 and 20 characters");
        }
        if (!EmailValidator.validate(email)) {
            throw new Error("Invalid email address");
        }
        if (dangerousChars.test(password)) {
            throw new Error("Password contains invalid characters");
        }
        if (password.length < 12) {
            throw new Error("Password must be at least 12 characters");
        }
        
        // Check if password contains at least one lowercase letter, one uppercase letter, one number, and one special character (excluding dangerous characters)
        const lowercase = /[a-z]/;
        const uppercase = /[A-Z]/;
        const number = /[0-9]/;
        const safeSpecialChar = /[!@#$%^&*(),.?":{}|]/;

        if (!lowercase.test(password) || !uppercase.test(password) || !number.test(password) || !safeSpecialChar.test(password)) {
            throw new Error("Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character (excluding dangerous characters)");
        }

        // Hash the password
        const hashedPassword = await argon2.hash(password);

        
        const newUser = await postUser({ username, hashedPassword, email, name, lastName });

        if (typeof newUser === "string") {
            throw new Error("postUser returned a string instead of an object");
        }



        res.status(201).json({ message: "User created successfully", data: newUser });
    } catch (err) {
        if (err instanceof Error) {
            console.error("Error creating user:", err.message);
            res.status(400).json({ message: err.message });
        } else {
            console.error("Unknown error creating user");
            res.status(400).json({ message: "Unknown error" });
        }
    }
};


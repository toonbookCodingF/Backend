import { Request, Response } from "express";
import * as EmailValidator from 'email-validator';
import * as argon2 from "argon2";
import { getAllUsers, getUser, postUser } from "../services/user.service";
import jwt from 'jsonwebtoken';
import { JWT_SECRET, JWT_EXPIRATION } from '../index';

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

        const lowerCaseName = name.toLowerCase();
        const lowerCaseLastName = lastName.toLowerCase();

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

        
        const newUser = await postUser({ username, password: hashedPassword, email, name: lowerCaseName, lastName: lowerCaseLastName });

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

export const loginController = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    // Vérification des champs
    if (!email || !password) {
        handleResponse(res, 400, "Email and password are required");
        return;
    }

    // Vérification de l'utilisateur
    const user = await getUser(email);

    if (!user) {
        handleResponse(res, 404, "User not found");
        return;
    }

    // Vérification du mot de passe
    const isPasswordValid = await argon2.verify(user.password, password);
    if (!isPasswordValid) {
        // Log email, provided password, and stored hashed password for debugging
        handleResponse(res, 401, "Invalid password");
        return;
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: JWT_EXPIRATION });

    // Set token as a cookie
    res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
        maxAge: 90 * 24 * 60 * 60 * 1000 // 90 days in milliseconds
    });

    // Envoi de la réponse
    handleResponse(res, 200, "Login successful", user);
}

export const logoutController = async (req: Request, res: Response) => {
    // Clear the token cookie
    res.clearCookie('token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
        sameSite: 'strict'
    });

    // Send a response indicating the user has been logged out
    handleResponse(res, 200, "Logout successful");
};
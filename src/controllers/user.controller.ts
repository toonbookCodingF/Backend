import { Request, Response, NextFunction } from "express";
import { getAllUsers, getUser, postUser } from "../services/user.service";
import * as EmailValidator from 'email-validator';
import * as argon2 from "argon2";
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/jwt.config';

// Ajout des types pour éviter l'erreur "any"
const handleResponse = <T>(res: Response, status: number, message: string, data: T | null = null) => {
    res.status(status).json({ status, message, data });
};

export const getUsersController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const users = await getAllUsers();
        handleResponse(res, 200, "Users retrieved successfully", users);
    } catch (error) {
        handleResponse(res, 500, "Something went wrong");
    }
};

export const getUserController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const email = req.params.email;
        const user = await getUser(email);
        if (!user) {
            handleResponse(res, 404, "User not found");
            return;
        }
        handleResponse(res, 200, "User retrieved successfully", user);
    } catch (error) {
        handleResponse(res, 500, "Something went wrong");
    }
};

export const createUserController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { username, password, email, name, lastName } = req.body;

    try {
        const dangerousChars = /[<>\/\\'";]/;
        if (dangerousChars.test(username) || dangerousChars.test(name) || dangerousChars.test(lastName)) {
            handleResponse(res, 400, "Contains invalid characters");
            return;
        }
        if (username.length < 6 || username.length > 20) {
            handleResponse(res, 400, "Username must be between 6 and 20 characters");
            return;
        }

        const lowerCaseName = name.toLowerCase();
        const lowerCaseLastName = lastName.toLowerCase();

        if (!EmailValidator.validate(email)) {
            handleResponse(res, 400, "Invalid email address");
            return;
        }
        if (dangerousChars.test(password)) {
            handleResponse(res, 400, "Password contains invalid characters");
            return;
        }
        if (password.length < 12) {
            handleResponse(res, 400, "Password must be at least 12 characters");
            return;
        }
        
        const lowercase = /[a-z]/;
        const uppercase = /[A-Z]/;
        const number = /[0-9]/;
        const safeSpecialChar = /[!@#$%^&*(),.?":{}|]/;

        if (!lowercase.test(password) || !uppercase.test(password) || !number.test(password) || !safeSpecialChar.test(password)) {
            handleResponse(res, 400, "Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character (excluding dangerous characters)");
            return;
        }

        const hashedPassword = await argon2.hash(password);

        const newUser = await postUser({ 
            username, 
            password: hashedPassword, 
            email, 
            name: lowerCaseName, 
            lastName: lowerCaseLastName 
        });

        if (typeof newUser === "string") {
            handleResponse(res, 400, "postUser returned a string instead of an object");
            return;
        }

        handleResponse(res, 201, "User created successfully", newUser);
    } catch (err) {
        if (err instanceof Error) {
            console.error("Error creating user:", err.message);
            handleResponse(res, 400, err.message);
        } else {
            console.error("Unknown error creating user");
            handleResponse(res, 400, "Unknown error");
        }
    }
};

export const loginController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            handleResponse(res, 400, "Email et mot de passe requis");
            return;
        }

        const user = await getUser(email);
        if (!user) {
            handleResponse(res, 401, "Email ou mot de passe incorrect");
            return;
        }

        const validPassword = await argon2.verify(user.password, password);
        if (!validPassword) {
            handleResponse(res, 401, "Email ou mot de passe incorrect");
            return;
        }

        const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '24h' });
        res.cookie('token', token, { 
            httpOnly: true, 
            maxAge: 24 * 60 * 60 * 1000,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax'
        });

        handleResponse(res, 200, "Connexion réussie", { 
            id: user.id, 
            email: user.email,
            token: token 
        });
    } catch (error) {
        console.error('Erreur lors de la connexion:', error);
        handleResponse(res, 500, "Erreur serveur");
    }
};

export const logoutController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    res.clearCookie('token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
    });
    handleResponse(res, 200, "Logged out successfully");
};
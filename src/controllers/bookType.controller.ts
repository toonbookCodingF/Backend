import { Request, Response } from "express";
import { getAllBookTypes, getBookType } from "../services/bookType.service";

const handleResponse = <T>(res: Response, status: number, message: string, data: T | null = null) => {
    res.status(status).json({ status, message, data });
};

export const getAllBookTypesController = async (req: Request, res: Response): Promise<void> => {
    try {
        const bookTypes = await getAllBookTypes();
        handleResponse(res, 200, "Types de livres récupérés avec succès", bookTypes);
    } catch (error) {
        handleResponse(res, 500, "Une erreur est survenue");
    }
};

export const getBookTypeController = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const bookType = await getBookType(parseInt(id));
        
        if (!bookType) {
            handleResponse(res, 404, "Type de livre non trouvé");
            return;
        }
        
        handleResponse(res, 200, "Type de livre récupéré avec succès", bookType);
    } catch (error) {
        handleResponse(res, 500, "Une erreur est survenue");
    }
}; 
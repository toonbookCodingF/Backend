import multer from 'multer';

// Configuration du stockage
const storage = multer.memoryStorage();

// Filtre pour n'accepter que les images
const fileFilter = (req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Format de fichier non supporté. Seuls les formats JPEG, PNG, GIF et WEBP sont acceptés.'));
    }
};

// Configuration de multer
export const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // Limite de 5MB
    }
}); 
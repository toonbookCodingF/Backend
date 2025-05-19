import { Request } from 'express';
import { UserProps } from '../services/user.service';

declare global {
    namespace Express {
        interface Request {
            user?: UserProps;
        }
    }
}

export {}; 
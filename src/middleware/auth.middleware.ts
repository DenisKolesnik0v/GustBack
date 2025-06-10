import { Request, Response, NextFunction } from 'express';
import tokenService, { TokenPayload } from '../service/token.service';

interface RequestWithUser extends Request {
    user?: TokenPayload;
}

export const authMiddleware = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    try {
        const authorizationHeader = req.headers.authorization;

        if (!authorizationHeader) {
            res.status(401).json({ message: 'Ошибка, пользователь не авторизирован' });
            return;
        }

        const accessToken = authorizationHeader.split(' ')[1];

        if (!accessToken) {
            res.status(401).json({ message: 'Ошибка, пользователь не авторизирован' });
            return;
        }

        const userData = await tokenService.validateAccessToken(accessToken);

        if (!userData || typeof userData !== 'object' || !('id' in userData) || !('email' in userData)) {
            res.status(401).json({ message: 'Ошибка, пользователь не авторизирован' });
            return;
        }

        req.user = userData as TokenPayload;
        next();
    } catch (e) {
        res.status(401).json({ message: 'Ошибка, пользователь не авторизирован' });
    }
};

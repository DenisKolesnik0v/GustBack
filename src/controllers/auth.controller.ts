import { Request, Response, NextFunction } from 'express';
import AuthService from '../service/auth.service';

class AuthController {
    async registration(req: Request, res: Response, next: NextFunction) {
        try {
            const { username, email, password, confirmPassword, sex, aboutMe } = req.body;
            const device = req.headers['user-agent'] || 'unknown';
            const ip = req.ip;

            const userData = await AuthService.registration({
                username,
                email,
                password,
                confirmPassword,
                sex,
                aboutMe,
                device,
                ip,
                userAgent: req.headers['user-agent']
            });

            res.cookie('refreshToken', userData.refreshToken, {
                maxAge: 30 * 24 * 60 * 60 * 1000,
                httpOnly: true,
                secure: false,
                sameSite: 'lax',
            });

            res.status(201).json(userData);
        } catch (e) {
            next(e);
        }
    }

    async login(req: Request, res: Response, next: NextFunction) {
        try {
            const { email, password } = req.body;
            const device = req.headers['user-agent'] || 'unknown';
            const ip = req.ip;
    
            const userData = await AuthService.login({
                email,
                password,
                device,
                ip,
                userAgent: req.headers['user-agent'],
            });
    
            res.cookie('refreshToken', userData.refreshToken, {
                maxAge: 30 * 24 * 60 * 60 * 1000,
                httpOnly: true,
                secure: false,
                sameSite: 'lax',
            });
    
            const { refreshToken, ...dataToRes } = userData;
            res.status(200).json(dataToRes);
        } catch (e) {
            next(e);
        }
    }
    
    async refreshToken(req: Request, res: Response, next: NextFunction) {
        try {
            const { refreshToken } = req.cookies;
            const device = req.headers['user-agent'] || 'unknown';
            const ip = req.ip || '';
            const userAgent = req.headers['user-agent'] || 'unknown';
    
            const userData = await AuthService.refresh(refreshToken, device, ip, userAgent);
    
            res.cookie('refreshToken', userData.refreshToken, {
                maxAge: 30 * 24 * 60 * 60 * 1000,
                httpOnly: true,
                secure: false,
                sameSite: 'lax',
            });
    
            const { refreshToken: _, ...dataToRes } = userData;
            res.status(200).json(dataToRes);
        } catch (e) {
            next(e);
        }
    }
    
    async logout(req: Request, res: Response, next: NextFunction) {
        try {
            const { refreshToken } = req.cookies;
            const device = req.headers['user-agent'] || 'unknown';
            
            await AuthService.logout(refreshToken, device);

            res.clearCookie('refreshToken', {
                httpOnly: true,
                secure: false,
                sameSite: 'lax',
            });

            res.status(200).json({ message: 'Logout successful' });
        } catch (e) {
            next(e);
        }
    }

    async activateLink(req: Request, res: Response, next: NextFunction) {
        try {
        } catch (e) {
            next(e);
        }
    }

    async users(req: Request, res: Response, next: NextFunction) {
        try {
            res.json(['123', '456']);
        } catch (e) {
            next(e);
        }
    }
}

export default new AuthController();

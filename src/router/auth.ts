import { Router } from 'express';
import AuthController from '../controllers/auth.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const authRouter = Router();

authRouter.post('/registration', AuthController.registration.bind(AuthController));
authRouter.post('/login', AuthController.login.bind(AuthController));
authRouter.get('/logout', AuthController.logout.bind(AuthController));
authRouter.get('/activateLink/:link', AuthController.activateLink.bind(AuthController));
authRouter.get('/validate-token', AuthController.refreshToken.bind(AuthController));

export default authRouter;

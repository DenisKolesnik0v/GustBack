import { Router } from 'express';
import authRouter from './auth';
import profileRouter from './profile.router';
import userCategoryRouter from './user-category';
import extrasRouter from './extras';
import categoryRouter from './category';

const router = Router();

router.use('/auth', authRouter);
router.use('/profile', profileRouter)
router.use('/user-categories', userCategoryRouter)
router.use('/extras', extrasRouter)
router.use('/categories', categoryRouter)

export default router;

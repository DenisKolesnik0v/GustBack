import { Router } from 'express';
import profileController from '../controllers/profile.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { upload } from '../middleware/multer.middleware';

const profileRouter = Router();

profileRouter.get('/user-devices', authMiddleware, profileController.getUserDevice.bind(profileController));
profileRouter.delete('/exit-device/:deviceId', authMiddleware, profileController.deleteDeviceById.bind(profileController));
profileRouter.post('/edit-profile', authMiddleware, profileController.editProfile.bind(profileController));

profileRouter.get('/user-recipes', authMiddleware, profileController.getAllUserRecipe.bind(profileController));
profileRouter.post('/create-recipe', authMiddleware, profileController.createRecipe.bind(profileController));
profileRouter.delete('/delete-recipe/:recipeId', authMiddleware, profileController.deleteRecipeById.bind(profileController));

export default profileRouter;

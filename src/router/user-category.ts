import { Router } from 'express';
import userCategoryController from '../controllers/user-category.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const userCategoryRouter = Router();

userCategoryRouter.post('/', authMiddleware, userCategoryController.createCategory);
userCategoryRouter.delete('/:id', authMiddleware, userCategoryController.deleteCategory);
userCategoryRouter.get('/', authMiddleware, userCategoryController.getUserCategories);
userCategoryRouter.post('/:categoryId/recipes/:recipeId', authMiddleware, userCategoryController.addRecipe);
userCategoryRouter.delete('/:categoryId/recipes/:recipeId', authMiddleware, userCategoryController.removeRecipe);
userCategoryRouter.post('/recipes', userCategoryController.getRecipesByIds);

export default userCategoryRouter;
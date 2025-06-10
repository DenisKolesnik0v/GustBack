import { Request, Response } from 'express';
import userCategoryService from '../service/user-category.service';

class UserCategoryController {
    async createCategory(req: Request, res: Response) {
        try {
            const { name } = req.body;
            const userId = (req as Request & { user: { id: string } }).user.id;
            
            const category = await userCategoryService.createCategory(userId, name);
            res.status(201).json(category);
        } catch (error) {
            res.status(400).json({ message: error });
        }
    }

    async deleteCategory(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const userId = (req as Request & { user: { id: string } }).user.id;
            
            const category = await userCategoryService.deleteCategory(userId, id);
            res.json(category);
        } catch (error) {
            res.status(404).json({ message: error });
        }
    }

    async addRecipe(req: Request, res: Response) {
        try {
            const { categoryId, recipeId } = req.params;
            const userId = (req as Request & { user: { id: string } }).user.id;
            
            const category = await userCategoryService.addRecipeToCategory(
                userId, 
                categoryId, 
                recipeId
            );
            res.json(category);
        } catch (error) {
            res.status(400).json({ message: error });
        }
    }

    async removeRecipe(req: Request, res: Response) {
        try {
            const { categoryId, recipeId } = req.params;
            const userId = (req as Request & { user: { id: string } }).user.id;
            
            const category = await userCategoryService.removeRecipeFromCategory(
                userId, 
                categoryId, 
                recipeId
            );
            res.json(category);
        } catch (error) {
            res.status(400).json({ message: error });
        }
    }

    async getUserCategories(req: Request, res: Response) {
        try {
            const userId = (req as Request & { user: { id: string } }).user.id;
            const categories = await userCategoryService.getUserCategories(userId);
            res.json(categories);
        } catch (error) {
            res.status(500).json({ message: error });
        }
    }

    async getRecipesByIds(req: Request, res: Response) {
        try {
            const { ids } = req.body;

            if (!Array.isArray(ids) || ids.length === 0) {
                res.status(400).json({ message: 'ID рецептов не переданы или некорректны' });
                return;
            }

            const recipes = await userCategoryService.getRecipesByIds(ids);

            if (!recipes.length) {
                res.status(404).json({ message: 'Рецепты не найдены' });
                return;
            }

            res.json(recipes);
        } catch (error) {
            res.status(500).json({ message: 'Ошибка при получении рецептов', error });
        }
    }
}

export default new UserCategoryController();

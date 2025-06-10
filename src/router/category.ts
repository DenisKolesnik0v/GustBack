import { Router } from 'express';
import categoryController from '../controllers/category.controller';

const categoryRouter = Router();

categoryRouter.get('/all-categories', categoryController.getAllCategories);
categoryRouter.get('/recipes/category/:categoryName', categoryController.getRecipesByCategory);
categoryRouter.get('/all-recipes', categoryController.getAllRecipes);
categoryRouter.get('/recipe/:recipeId', categoryController.getRecipeById);
categoryRouter.get('/recipe-by-region/:region', categoryController.getRecipeByRegionName);
categoryRouter.get('/recipe-by-country/:country', categoryController.getRecipesByCountry);
categoryRouter.get('/search', categoryController.searchRecipes);

export default categoryRouter;

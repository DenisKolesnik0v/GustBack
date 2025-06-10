import { Request, Response } from 'express';
import CategoryModel from '../models/category.model';
import RecipeModel from '../models/recipe.model';
import CountryModel from '../models/country.model';
import RegionModel from '../models/region.model';

class CategoryController {
    async getAllCategories(req: Request, res: Response): Promise<void> {
        try {
            const categories = await CategoryModel.find({ isActive: true }).sort({ name: 1 }).exec();
            res.status(200).json(categories);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching categories' });
        }
    }

    async getRecipesByCategory(req: Request, res: Response) {
        try {
            const { categoryName } = req.params;

            const recipes = await RecipeModel.find({ category: categoryName }).populate('category', 'name').exec();
            res.status(200).json(recipes);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching recipes by category' });
        }
    }

    async getAllRecipes(req: Request, res: Response) {
        try {
            const recipes = await RecipeModel.find({ isActive: true }).sort({ name: 1 }).exec();

            if (!recipes) {
                res.status(404).json({ message: 'Recipes not found' });
                return;
            }

            res.status(200).json(recipes);
        } catch(e) {
            res.status(500).json({ message: 'Error fetching recipes by category' });
        }
    }

    async getRecipeById(req: Request, res: Response) {
        try {
            const { recipeId } = req.params;

            if (!recipeId) {
                res.status(404).json({ message: 'Recipe not found'});
                return;
            }

            const recipeById = await RecipeModel.findById(recipeId).exec();

            res.status(200).json(recipeById);
        } catch (e) {
            res.status(500).json({ message: 'Error fetching recipes by category' });
        }
    }

    async getRecipeByRegionName(req: Request, res: Response) {
        try {
            const { region } = req.params;
            
            const regionDocument = await RegionModel.findOne({ 'name.en': region }).exec();
    
            if (!regionDocument) {
                res.status(404).json({ message: 'Region not found' });
                return;
            }

            const recipes = await RecipeModel.find({ region: regionDocument.name.en }).exec();
    
            if (recipes.length === 0) {
                res.status(404).json({ message: 'No recipes found for this region' });
                return;
            }

            res.status(200).json(recipes);
        } catch (e) {
            res.status(500).json({ message: 'Error fetching recipes by region' });
        }
    }

    async getRecipesByCountry(req: Request, res: Response) {
        try {
            const { country } = req.params;
    
            const countryDocument = await CountryModel.findOne({ 'name.en': country }).exec();
    
            if (!countryDocument) {
                res.status(404).json({ message: 'Country not found' });
                return;
            }
    
            const recipes = await RecipeModel.find({ country: countryDocument.name.en }).exec();
    
            if (recipes.length === 0) {
                res.status(404).json({ message: 'No recipes found for this country' });
                return;
            }
    
            res.status(200).json(recipes);
        } catch (e) {
            res.status(500).json({ message: 'Error fetching recipes by country' });
        }
    }

    async searchRecipes (req: Request, res: Response) {
        try {
            const { query } = req.query;
    
            if (!query || typeof query !== 'string') {
                res.status(400).json({ message: 'Query parameter is required' });
                return;
            }
    
            const searchTerms = query.split(',')
                .map(term => term.trim())
                .filter(term => term.length > 0);
    
            if (searchTerms.length === 0) {
                res.status(400).json({ message: 'No valid search terms provided' });
                return;
            }
    
            const searchConditions = searchTerms.map(term => ({
                $or: [
                    { name: { $regex: term, $options: 'i' } },
                    { 'compounds.name': { $regex: term, $options: 'i' } }
                ]
            }));
    
            const recipes = await RecipeModel.find({
                $or: searchConditions,
                isActive: true,
            });
    
            res.status(200).json(recipes);
        } catch (error) {
            res.status(500).json({ message: 'Internal server error' });
        }
    };
}

export default new CategoryController();

import UserCategoryModel, { IUserCategory } from '../models/user-category.model';
import RecipeModel from '../models/recipe.model';

class UserCategoryService {
    async createCategory(userId: string, name: string): Promise<IUserCategory> {
        const existingCategory = await UserCategoryModel.findOne({ user: userId, name });
        if (existingCategory) {
            throw new Error('Категория с таким названием уже существует');
        }

        return await UserCategoryModel.create({ name, user: userId, recipes: [] });
    }

    async deleteCategory(userId: string, categoryId: string): Promise<IUserCategory> {
        const category = await UserCategoryModel.findOneAndDelete({ 
            _id: categoryId, 
            user: userId 
        });
        
        if (!category) {
            throw new Error('Категория не найдена или не принадлежит пользователю');
        }
        
        return category;
    }

    async addRecipeToCategory(
        userId: string,
        categoryId: string,
        recipeId: string
    ): Promise<IUserCategory> {
        const category = await UserCategoryModel.findOneAndUpdate(
            { _id: categoryId, user: userId },
            { $addToSet: { recipes: recipeId } },
            { new: true }
        );

        if (!category) {
            throw new Error('Категория не найдена или не принадлежит пользователю');
        }

        return category;
    }

    async removeRecipeFromCategory(
        userId: string,
        categoryId: string,
        recipeId: string
    ): Promise<IUserCategory> {
        const category = await UserCategoryModel.findOneAndUpdate(
            { _id: categoryId, user: userId },
            { $pull: { recipes: recipeId } },
            { new: true }
        );

        if (!category) {
            throw new Error('Категория не найдена или не принадлежит пользователю');
        }

        return category;
    }

    async getUserCategories(userId: string): Promise<IUserCategory[]> {
        return await UserCategoryModel.find({ user: userId })
            .sort({ createdAt: -1 })
            .exec();
    }

    async getRecipesByIds(ids: string[]) {
        try {
            const recipes = await RecipeModel.find({ '_id': { $in: ids } });
            return recipes;
        } catch (error) {
            throw new Error('Ошибка при получении рецептов');
        }
    }
}

export default new UserCategoryService();
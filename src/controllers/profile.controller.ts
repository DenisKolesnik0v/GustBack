import { Request, Response, NextFunction } from 'express';
import tokenService from '../service/token.service';
import TokenModel from '../models/token.model';
import UserModel from '../models/user.model';
import AuthService from '../service/auth.service';
import RecipeModel from '../models/recipe.model';
import CountryModel from '../models/country.model';
import RegionModel from '../models/region.model';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

interface IDescription {
    language: string;
    text: string;
}

type MetricUnit = 'g' | 'kg' | 'ml' | 'l' | 'tsp' | 'tbsp' | 'cup' | 'pcs';

interface ICompound {
    name: string;
    amount: number;
    unit: MetricUnit;
}

export type DifficultyLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

interface IRecipe {
    name: string;
    descriptions: IDescription[];
    imageUrl: string;
    cookingTime: number;
    calories: number;
    isVegan: boolean;
    isVegetarian: boolean;
    difficulty: DifficultyLevel;
    compounds: ICompound[];
    tags: string[];
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    category: string;
    country: string | null;
    region: string | null;
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const dir = path.resolve(__dirname, '../../public/img');
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname);
        const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
        cb(null, filename);
    }
});

const upload = multer({ storage });

class ProfileController {
    async getUserDevice(req: Request, res: Response, next: NextFunction) {
        try {
            const authorizationHeader = req.headers.authorization;

            if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
                res.status(401).json({ message: 'Ошибка, пользователь не авторизован' });
                return;
            }

            const accessToken = authorizationHeader.split(' ')[1];

            const decodedToken = await tokenService.validateAccessToken(accessToken);

            if (!decodedToken || typeof decodedToken !== 'object' || !('id' in decodedToken) || !('email' in decodedToken)) {
                res.status(401).json({ message: 'Ошибка, пользователь не авторизирован' });
                return;
            }

            if (!decodedToken || !decodedToken.id) {
                res.status(401).json({ message: 'Ошибка, пользователь не авторизирован' });
                return;
            }

            const { id } = decodedToken;

            const devices = await TokenModel.find({ user: id })
                .select('id device createdAt')
                .lean();


            res.status(200).json(devices);
        } catch (e) {
            next(e);
        }
    }

    async deleteDeviceById(req: Request, res: Response, next: NextFunction) {
        try {
            const { deviceId } = req.params;

            if (!deviceId) {
                res.status(400).json({ message: 'Device ID is required' });
                return;
            }

            const deletedDevice = await TokenModel.findByIdAndDelete(deviceId);

            if (!deletedDevice) {
                res.status(404).json({ message: 'Device not found' });
                return;
            }

            res.status(200).json({ message: 'Device deleted successfully' });
        } catch (e) {
            next(e);
        }
    }

    async editProfile(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = (req as Request & { user: { id: string } }).user.id;
            const { username, aboutMe, sex, country, city } = req.body;

            let countryId = null;
            if (country) {
                countryId = await AuthService.getCountryIdByName(country);
                if (!countryId) {
                    res.status(400).json({ message: 'Страна не найдена' });
                    return;
                }
            }

            const updatedUser = await UserModel.findByIdAndUpdate(
                userId,
                {
                    $set: {
                        ...(username && { username }),
                        'profile.aboutMe': aboutMe,
                        'profile.sex': sex,
                        'profile.country': countryId,
                        'profile.city': city,
                    },
                },
                { new: true }
            ).select('username profile');

            if (!updatedUser) {
                res.status(404).json({ message: 'User not found' });
                return;
            }

            res.status(200).json({
                username: updatedUser.username,
                profile: updatedUser.profile,
            });
        } catch (e) {
            next(e);
        }
    }

    async getAllUserRecipe(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = (req as Request & { user: { id: string } }).user.id;

            const recipes: IRecipe[] = await RecipeModel.find({ author: userId });

            res.status(200).json(recipes);
        } catch (e) {
            next(e);
        }
    }

    async deleteRecipeById(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = (req as Request & { user: { id: string } }).user.id;
            const { recipeId } = req.params;

            const recipe = await RecipeModel.findById(recipeId);

            if (!recipe) {
                res.status(404).json({ message: 'Рецепт не найден' });
                return;
            }

            if (recipe.author.toString() !== userId) {
                res.status(403).json({ message: 'Недостаточно прав для удаления этого рецепта' });
                return;
            }

            await RecipeModel.findByIdAndDelete(recipeId);

            res.status(200).json({ message: 'Рецепт успешно удален' });
        } catch (e) {
            next(e);
        }
    }

    async createRecipe(req: Request, res: Response, next: NextFunction) {
        const handler = upload.single('image');

        handler(req, res, async function (err) {
            if (err) {
                return res.status(400).json({ message: 'Ошибка при загрузке изображения', error: err.message });
            }

            try {
                const userId = (req as Request & { user: { id: string } }).user.id;

                const {
                    name,
                    descriptions,
                    cookingTime,
                    calories,
                    isVegan,
                    isVegetarian,
                    difficulty,
                    compounds,
                    tags,
                    category,
                    country,
                    meal,
                    cooking,
                } = req.body;

                const parsedDescriptions = JSON.parse(req.body.descriptions);
                const parsedCompounds = JSON.parse(req.body.compounds);
                const parsedCooking = JSON.parse(req.body.cooking);
                const parsedTags = JSON.parse(req.body.tags);

                const user = await UserModel.findById(userId).exec();
                if (!user) return res.status(404).json({ message: 'User not found' });

                const countryDoc = await CountryModel.findOne({ 'name.en': country }).exec();
                if (!countryDoc) return res.status(404).json({ message: 'Country not found' });

                const regionDoc = await RegionModel.findById(countryDoc.region).exec();

                const imageUrl = req.file ? `/img/${req.file.filename}` : '';

                const newRecipe = new RecipeModel({
                    name: req.body.name,
                    descriptions: parsedDescriptions,
                    imageUrl: imageUrl,
                    cookingTime: Number(req.body.cookingTime),
                    calories: Number(req.body.calories),
                    isVegan: req.body.isVegan === 'true',
                    isVegetarian: req.body.isVegetarian === 'true',
                    difficulty: Number(req.body.difficulty),
                    compounds: parsedCompounds,
                    tags: parsedTags,
                    category: req.body.category,
                    country: countryDoc.name.en,
                    region: regionDoc?.name.en || '',
                    authorCity: user.profile.city || null,
                    author: userId,
                    meal: req.body.meal,
                    cooking: parsedCooking,
                });

                const savedRecipe = await newRecipe.save();
                res.status(201).json(savedRecipe);
            } catch (e) {
                next(e);
            }
        });
    }
}

export default new ProfileController();

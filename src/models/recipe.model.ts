import { Schema, model, Document, Types } from 'mongoose';
import { IUser } from './user.model';

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

type DifficultyLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

export interface IRecipe extends Document {
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
    createdAt: Date;
    updatedAt: Date;
    category: string | null;
    country: string | null;
    region?: Types.ObjectId | null;
    authorCity: string | null;
    author: Types.ObjectId;
    meal?: string;
    cooking: string[];
}

const recipeSchema = new Schema<IRecipe>(
    {
        name: { type: String, required: true, index: true },
        descriptions: {
            type: [
                {
                    language: { type: String, required: true, default: 'ru' },
                    text: { type: String, required: true },
                }
            ],
            required: true,
            validate: [(val: IDescription[]) => val.length > 0, 'Нужно хотя бы одно описание'],
        },
        imageUrl: { type: String, default: '' },
        cookingTime: { type: Number, required: true, min: 1 },
        calories: { type: Number, min: 0 },
        isVegan: { type: Boolean, default: false },
        isVegetarian: { type: Boolean, default: false },
        difficulty: {
            type: Number,
            required: true,
            min: 1,
            max: 10,
            validate: {
                validator: Number.isInteger,
                message: 'Сложность должна быть целым числом',
            }
        },
        compounds: {
            type: [
                {
                    name: { type: String, required: true },
                    amount: { type: Number, required: true, min: 0.01 },
                    unit: {
                        type: String,
                        required: true,
                        enum: ['g', 'kg', 'ml', 'l', 'tsp', 'tbsp', 'cup', 'pcs'],
                        default: 'g',
                    }
                }
            ],
            required: true,
            validate: [(val: ICompound[]) => val.length > 0, 'Нужен хотя бы один ингредиент'],
        },
        tags: {
            type: [String],
            default: [],
            validate: [(val: string[]) => val.every(tag => typeof tag === 'string'), 'Теги должны быть строками'],
        },
        isActive: { type: Boolean, default: true },
        category: {
            type: String,
            required: true,
        },
        country: {
            type: String,
            default: null,
        },
        region: {
            type: String,
            default: null,
        },
        authorCity: {
            type: String,
            default: null,
        },
        author: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        meal: { type: String },
        cooking: { type: [String], required: true },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

recipeSchema.index({ category: 1 });
recipeSchema.index({ country: 1 });
recipeSchema.index({ region: 1 });
recipeSchema.index({ author: 1 });

recipeSchema.index({
    name: 'text',
    isVegan: 1,
    isVegetarian: 1, 
    difficulty: 1,
    cookingTime: 1,
    category: 1,
    country: 1
});
recipeSchema.index({ 'compounds.name': 'text' });
recipeSchema.index({ compoundSearchIndex: 1 });

recipeSchema.pre<IRecipe>('save', async function (next) {
    try {
        const user = await model<IUser>('User').findById(this.author).exec();

        if (!user) {
            return next(new Error('Автор рецепта не найден'));
        }

        next();
    } catch (error: any) {
        next(error);
    }
});

const RecipeModel = model('Recipe', recipeSchema);

export default RecipeModel;
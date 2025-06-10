import { Schema, model, Document, Types } from 'mongoose';

export interface IUserCategory extends Document {
    name: string;
    user: Types.ObjectId;
    recipes: Types.ObjectId[];
    recipesCount: number;
}

export const userCategorySchema = new Schema<IUserCategory>({
    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: [50, 'Название категории не может превышать 50 символов']
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    recipes: [{
        type: Schema.Types.ObjectId,
        ref: 'Recipe',
    }]
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});

userCategorySchema.virtual('recipesCount').get(function() {
    return this.recipes.length;
});

userCategorySchema.index({ user: 1 });
userCategorySchema.index({ name: 1, user: 1 }, { unique: true });

const UserCategoryModel = model<IUserCategory>('UserCategory', userCategorySchema);

export default UserCategoryModel;
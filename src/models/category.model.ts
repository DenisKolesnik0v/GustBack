import mongoose from 'mongoose';

export interface ICategory extends Document {
    name: string;
    description: string;
    imageUrl: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const categorySchema = new mongoose.Schema<ICategory>({
    name: { type: String, required: true, unique: true, index: true },
    description: { type: String, default: '' },
    imageUrl: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
}, {
    timestamps: true,
});

const CategoryModel = mongoose.model('Category', categorySchema);

export default CategoryModel;

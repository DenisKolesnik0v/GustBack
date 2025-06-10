import { Schema, model, Document, Types } from 'mongoose';

export interface IRegion extends Document {
    name: { en: string; ru: string };
    description?: { en: string; ru: string };
    createdAt: Date;
    updatedAt: Date;
}

const regionSchema = new Schema<IRegion>(
    {
        name: { 
            en: { type: String, required: true, unique: true, index: true },
            ru: { type: String, required: true, unique: true, index: true }
        },
        description: { 
            en: { type: String, default: '' },
            ru: { type: String, default: '' }
        }
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

regionSchema.index({ 'name.en': 'text', 'name.ru': 'text' });

const RegionModel = model<IRegion>('Region', regionSchema);

export default RegionModel;

import { Schema, model, Document, Types } from 'mongoose';

export interface ICountry extends Document {
    name: { en: string; ru: string };
    code: string;
    flagUrl: string;
    region: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const countrySchema = new Schema<ICountry>(
    {
        name: { 
            en: { type: String, required: true, unique: true, index: true },
            ru: { type: String, required: true, unique: true, index: true }
        },
        code: { type: String, required: true, unique: true, index: true },
        flagUrl: { type: String, required: true },
        region: { type: Schema.Types.ObjectId, ref: 'Region', required: true }
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

countrySchema.index({ region: 1 });
countrySchema.index({ 'name.en': 'text', 'name.ru': 'text' });

const CountryModel = model<ICountry>('Country', countrySchema);

export default CountryModel;

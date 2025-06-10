import { Schema, model, Document, Types } from 'mongoose';
import { ICountry } from './country.model';
import { IRegion } from './region.model';

export interface IProfile extends Document {
  aboutMe?: string;
  sex?: 'male' | 'female' | 'secret';
  country?: Types.ObjectId | ICountry;
  city?: string;
  backgroundImg?: string;
}

export const profileSchema = new Schema<IProfile>({
  aboutMe: { type: String, default: '' },
  sex: { type: String, enum: ['male', 'female', 'secret'], default: 'secret' },
  country: { type: Schema.Types.ObjectId, ref: 'Country', default: null },
  city: { type: String, default: '' },
  backgroundImg: { type: String },
});

const ProfileModel = model('Profile', profileSchema);

export default ProfileModel;

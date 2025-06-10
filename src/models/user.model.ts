import { Schema, model, Document } from 'mongoose';
import { IProfile, profileSchema } from './profile.model';

export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  isActivated: boolean;
  activationLink: string;
  roles: string[];
  profile: IProfile;
}

export const userSchema = new Schema<IUser>({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isActivated: { type: Boolean, default: false },
  activationLink: { type: String },
  roles: [{ type: String, ref: 'Roles', default: ['USER'] }],
  profile: { type: profileSchema, default: () => ({ }) },
});

export const UserModel = model('User', userSchema);

export default UserModel;

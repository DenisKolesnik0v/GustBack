import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { UserModel } from '../models/user.model';
import MailService from './mail.service';
import TokenService from './token.service';
import { UserDto } from '../dtos/user.dto';
import { registrationSchema, loginSchema } from '../utils/validate.utils';
import CountryModel from '../models/country.model';
import { Types } from 'mongoose';

export interface RegistrationData {
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
    sex?: string;
    aboutMe?: string;
    device: string;
    ip?: string;
    userAgent?: string;
}

export interface LoginData {
    email: string;
    password: string;
    device: string;
    ip?: string;
    userAgent?: string;
}

class AuthService {
    async registration(data: RegistrationData) {
        const { username, email, password, confirmPassword, sex, aboutMe, device, ip, userAgent } = data;

        const { error } = registrationSchema.validate({ username, email, password, confirmPassword });
        if (error) {
            throw new Error(error.details[0].message);
        }

        const existingUser = await UserModel.findOne({ email });
        if (existingUser) {
            throw new Error('User with this email already exists');
        }

        const hashPassword = await bcrypt.hash(password, 10);
        const activationLink = uuidv4();

        const user = await UserModel.create({
            username,
            email,
            password: hashPassword,
            activationLink,
            profile: { sex, aboutMe },
        });

        const userDto = new UserDto(user);
        const tokens = TokenService.generateTokens({ ...userDto });

        await TokenService.saveToken({
            userId: userDto.id,
            refreshToken: tokens.refreshToken,
            device,
            ip,
            userAgent,
        });

        return { user: userDto, ...tokens };
    }

    async login(data: LoginData) {
        const { email, password, device, ip, userAgent } = data;
    
        const { error } = loginSchema.validate({ email, password });
        if (error) {
            throw new Error(error.details[0].message);
        }
    
        const user = await UserModel.findOne({ email })
            .populate('profile.country');
    
        if (!user) {
            throw new Error('User with this email does not exist');
        }
    
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new Error('Invalid password');
        }
    
        const userDto = new UserDto(user);
        const tokens = TokenService.generateTokens({ ...userDto });
    
        await TokenService.saveToken({
            userId: userDto.id,
            refreshToken: tokens.refreshToken,
            device,
            ip,
            userAgent,
        });
    
        return { user: userDto, ...tokens };
    }

    async refresh(refreshToken: string, device: string, ip: string, userAgent: string) {
        if (!refreshToken) {
            throw new Error(refreshToken);
        }
    
        const userData = await TokenService.validateRefreshToken(refreshToken);
        if (!userData) {
            throw new Error("Ошибка рефреш токена");
        }
    
        const user = await UserModel.findById(userData.id)
            .populate('profile.country');
    
        if (!user) {
            throw new Error("Пользователь не найден");
        }
    
        const userDto = new UserDto(user);
        const tokens = TokenService.generateTokens({ ...userDto });
    
        await TokenService.saveToken({
            userId: userDto.id,
            refreshToken: tokens.refreshToken,
            device,
            ip,
            userAgent,
        });
    
        return { user: userDto, ...tokens };
    }
    

    async logout(refreshToken: string, device: string) {
        if (!refreshToken) {
            throw new Error('Refresh token is required');
        }

        await TokenService.removeToken(refreshToken, device);
    }

    async getCountryIdByName(countryName: string): Promise<string | null> {
        if (!countryName) return null;

        const country = await CountryModel.findOne({
            $or: [
                { 'name.en': countryName },
                { 'name.ru': countryName }
            ]
        }).select('_id');

        if (!country) {
            throw new Error('Страна не найдена');
        }

        return (country._id as Types.ObjectId).toString();
    }
}

export default new AuthService();

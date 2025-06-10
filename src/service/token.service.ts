import jwt from 'jsonwebtoken';
import { TokenModel } from '../models/token.model';
import { Types } from 'mongoose';

export interface TokenPayload {
    id: string;
    email: string;
    username?: string;
    isActivated?: boolean;
    roles?: string[];
    sex: string | null;
    aboutMe: string | null;
}

export interface SaveTokenData {
    userId: string;
    refreshToken: string;
    device: string;
    ip?: string;
    userAgent?: string;
    sex?: string;
}

class TokenService {
    generateTokens(payload: TokenPayload) {
        const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET || '', { expiresIn: '15m'});
        const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET || '', { expiresIn: '30d'});

        return {
            accessToken,
            refreshToken,
        };
    }

    async saveToken(data: SaveTokenData) {
        try {
            const { userId, refreshToken, device, ip, userAgent } = data;

            const tokenData = await TokenModel.findOne({ user: userId, device });

            if (tokenData) {
                tokenData.refreshToken = refreshToken;
                tokenData.ip = ip;
                tokenData.userAgent = userAgent;
                await tokenData.save();
                return tokenData;
            }

            const newToken = await TokenModel.create({
                user: userId,
                refreshToken,
                device,
                ip,
                userAgent
            });
    
            return newToken;
        } catch (error) {
            console.error('Error saving token:', error);
            throw error;
        }
    }

    async validateAccessToken(token: string) {
        try {
            const userData = jwt.verify(token, process.env.JWT_ACCESS_SECRET || '');
            return userData;
        } catch (e) {
            return null;
        }
    }
    
    async validateRefreshToken(token: string): Promise<TokenPayload | null> {
        try {
            const userData = jwt.verify(token, process.env.JWT_REFRESH_SECRET || '') as TokenPayload;
            return userData;
        } catch (e) {
            return null;
        }
    }
    

    async findToken(refreshToken: string) {
        const tokenData = await TokenModel.findOne({ refreshToken });
        return tokenData;
    }

    async removeToken(refreshToken: string, device: string) {
        try {
            await TokenModel.deleteOne({ refreshToken, device });
        } catch (error) {
            console.error('Error removing token:', error);
            throw error;
        }
    }
}

export default new TokenService();
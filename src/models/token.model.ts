import { Schema, model, Document, Types } from 'mongoose';

export interface IToken extends Document {
    user: Types.ObjectId;
    refreshToken: string;
    device: string;
    ip?: string;
    userAgent?: string;
    createdAt: Date;
}

export const tokenSchema = new Schema<IToken>(
    {
        user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
        refreshToken: { type: String, required: true },
        device: { type: String, required: true },
        ip: { type: String },
        userAgent: { type: String },
    },
    { timestamps: { createdAt: true, updatedAt: false } },
);

export const TokenModel = model<IToken>('Token', tokenSchema);

export default TokenModel;

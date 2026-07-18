import mongoose, { Schema, Document } from 'mongoose';

export interface IGift extends Document {
    name: string;
    imageUrl?: string;
    totalPrice: number;
    totalQuotas: number;
    claimedQuotas: number;
}

const GiftSchema: Schema = new Schema({
    name: { type: String, required: true },
    imageUrl: { type: String, default: '' },
    totalPrice: { type: Number, required: true },
    totalQuotas: { type: Number, default: 1 },
    claimedQuotas: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.models.Gift || mongoose.model<IGift>('Gift', GiftSchema);
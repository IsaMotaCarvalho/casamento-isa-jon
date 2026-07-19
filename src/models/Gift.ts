import mongoose, { Schema, Document } from 'mongoose';

export interface IReservation {
    _id?: string;
    guestName: string;
    guestPhone: string;
    quantity: number;
    totalValue: number;
    status: 'pendente' | 'recebido';
    message?: string;
    createdAt?: Date;
}

export interface IGift extends Document {
    name: string;
    imageUrl?: string;
    totalPrice: number;
    totalQuotas: number;
    claimedQuotas: number;
    reservations: IReservation[];
}

const ReservationSchema = new Schema({
    guestName: { type: String, required: true },
    guestPhone: { type: String, required: true },
    quantity: { type: Number, required: true },
    totalValue: { type: Number, required: true },
    status: { type: String, enum: ['pendente', 'recebido'], default: 'pendente' },
    message: { type: String, default: '' }
}, { timestamps: true });

const GiftSchema: Schema = new Schema({
    name: { type: String, required: true },
    imageUrl: { type: String, default: '' },
    totalPrice: { type: Number, required: true },
    totalQuotas: { type: Number, default: 1 },
    claimedQuotas: { type: Number, default: 0 },
    reservations: [ReservationSchema]
}, { timestamps: true });

export default mongoose.models.Gift || mongoose.model<IGift>('Gift', GiftSchema);
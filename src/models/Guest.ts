import mongoose, { Schema, Document } from 'mongoose';

export interface IGuest extends Document {
    name: string;
    phone: string;
    side: 'noivo' | 'noiva';
    confirmed: boolean;
    invitedViaWhatsapp: boolean;
    giftClaimedId?: string;
    quotaIndex?: number;
    message?: string;
}

const GuestSchema: Schema = new Schema({
    name: { type: String, required: true },
    phone: { type: String, required: true },
    side: { type: String, enum: ['noivo', 'noiva'], required: true },
    confirmed: { type: Boolean, default: false },
    invitedViaWhatsapp: { type: Boolean, default: false },
    giftClaimedId: { type: String, default: null },
    quotaIndex: { type: Number, default: null },
    message: { type: String, default: '' }
}, { timestamps: true });

export default mongoose.models.Guest || mongoose.model<IGuest>('Guest', GuestSchema);
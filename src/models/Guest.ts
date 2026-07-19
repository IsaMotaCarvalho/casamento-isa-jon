import mongoose, { Schema, Document } from 'mongoose';

export interface IMember {
    _id?: string;
    name: string;
    confirmed: boolean;
}

export interface IGuest extends Document {
    name: string;
    phone: string;
    side: 'noivo' | 'noiva';
    invitedViaWhatsapp: boolean;
    members: IMember[];
    message?: string;
}

const MemberSchema = new Schema({
    name: { type: String, required: true },
    confirmed: { type: Boolean, default: false }
});

const GuestSchema: Schema = new Schema({
    name: { type: String, required: true },
    phone: { type: String, required: true },
    side: { type: String, enum: ['noivo', 'noiva'], required: true },
    invitedViaWhatsapp: { type: Boolean, default: false },
    members: [MemberSchema],
    message: { type: String, default: '' }
}, { timestamps: true });

// Força o Next.js a deletar o modelo antigo do cache em tempo de execução
if (mongoose.models.Guest) {
    delete mongoose.models.Guest;
}

export default mongoose.model<IGuest>('Guest', GuestSchema);
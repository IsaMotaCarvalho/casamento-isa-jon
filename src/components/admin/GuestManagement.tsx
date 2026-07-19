'use client';

import React, { useState } from 'react';
import { Plus, Share2, Trash } from 'lucide-react';

interface GuestManagementProps {
    guests: any[];
    onAddGuest: (guestForm: { name: string; phone: string; side: string }) => Promise<void>;
    onToggleConfirm: (id: string, currentStatus: boolean) => Promise<void>;
    onDeleteItem: (route: 'guests' | 'gifts', id: string) => Promise<void>;
}

export default function GuestManagement({ guests, onAddGuest, onToggleConfirm, onDeleteItem }: GuestManagementProps) {
    const [form, setForm] = useState({ name: '', phone: '', side: 'noivo' });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onAddGuest(form);
        setForm({ name: '', phone: '', side: 'noivo' });
    };

    const sendWhatsappInvite = (guest: any) => {
        const guestLink = `${window.location.origin}/guest?id=${guest._id}`;
        const message = `Olá, *${guest.name}*! ✨\n\nEstamos muito felizes com o nosso casamento e sua presença é fundamental.\n\nPor favor, confirme sua presença e veja nossa lista de presentes acessando o seu link exclusivo abaixo:\n${guestLink}`;
        const cleanPhone = guest.phone.replace(/\D/g, '');
        const formattedPhone = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;
        window.open(`https://api.whatsapp.com/send?phone=${formattedPhone}&text=${encodeURIComponent(message)}`, '_blank');
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-slate-800">Controle de Convidados</h1>

            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">Nome Completo</label>
                    <input type="text" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-800" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">WhatsApp (com DDD)</label>
                    <input type="text" required placeholder="18999999999" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-800" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">Convidado de quem?</label>
                    <select value={form.side} onChange={e => setForm({ ...form, side: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-800">
                        <option value="noivo">Noivo</option>
                        <option value="noiva">Noiva</option>
                    </select>
                </div>
                <button type="submit" className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-emerald-700 transition-colors heavy-shadow">
                    <Plus size={18} /> Adicionar Convidado
                </button>
            </form>

            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-100 text-slate-600 text-sm font-semibold">
                            <th className="p-4">Nome</th>
                            <th className="p-4">Contato</th>
                            <th className="p-4">Vínculo</th>
                            <th className="p-4">Status Presença</th>
                            <th className="p-4 text-center">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                        {guests.map((guest) => (
                            <tr key={guest._id} className="hover:bg-slate-50">
                                <td className="p-4 font-medium">{guest.name}</td>
                                <td className="p-4">{guest.phone}</td>
                                <td className="p-4 capitalize">{guest.side}</td>
                                <td className="p-4">
                                    <button onClick={() => onToggleConfirm(guest._id, guest.confirmed)} className={`px-3 py-1 rounded-full text-xs font-semibold ${guest.confirmed ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                                        {guest.confirmed ? 'Confirmado' : 'Pendente'}
                                    </button>
                                </td>
                                <td className="p-4 flex items-center justify-center gap-3">
                                    <button onClick={() => sendWhatsappInvite(guest)} className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors">
                                        <Share2 size={18} />
                                    </button>
                                    <button onClick={() => onDeleteItem('guests', guest._id)} className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors">
                                        <Trash size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
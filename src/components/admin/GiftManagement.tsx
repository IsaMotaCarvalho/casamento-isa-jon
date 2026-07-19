'use client';

import React, { useState } from 'react';
import { Plus, Trash } from 'lucide-react';

interface GiftManagementProps {
    gifts: any[];
    onAddGift: (giftForm: { name: string; totalPrice: number; totalQuotas: number }) => Promise<void>;
    onDeleteItem: (route: 'guests' | 'gifts', id: string) => Promise<void>;
}

export default function GiftManagement({ gifts, onAddGift, onDeleteItem }: GiftManagementProps) {
    const [form, setForm] = useState({ name: '', totalPrice: 0, totalQuotas: 1 });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onAddGift(form);
        setForm({ name: '', totalPrice: 0, totalQuotas: 1 });
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-slate-800">Lista de Presentes (Cotas)</h1>

            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">Nome do Item/Cota</label>
                    <input type="text" required placeholder="Ex: Geladeira Frost Free" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-800" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">Valor Total (R$)</label>
                    <input type="number" required value={form.totalPrice || ''} onChange={e => setForm({ ...form, totalPrice: Number(e.target.value) })} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-800" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">Quantidade de Cotas</label>
                    <input type="number" required min="1" value={form.totalQuotas} onChange={e => setForm({ ...form, totalQuotas: Number(e.target.value) })} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-800" />
                </div>
                <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-indigo-700 transition-colors">
                    <Plus size={18} /> Adicionar Item
                </button>
            </form>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {gifts.map((gift) => {
                    const quotaValue = gift.totalPrice / gift.totalQuotas;
                    return (
                        <div key={gift._id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 relative flex flex-col justify-between gap-4">
                            <div>
                                <h4 className="text-lg font-bold text-slate-800 mb-2">{gift.name}</h4>
                                <p className="text-sm text-slate-500">Valor Total: <span className="font-semibold text-slate-800">R$ {gift.totalPrice.toFixed(2)}</span></p>
                                <p className="text-sm text-slate-500">Valor da cota: <span className="font-semibold text-indigo-600">R$ {quotaValue.toFixed(2)}</span></p>
                            </div>

                            <div className="bg-slate-50 p-3 rounded-lg">
                                <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1">
                                    <span>Progresso das Cotas</span>
                                    <span>{gift.claimedQuotas} / {gift.totalQuotas}</span>
                                </div>
                                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                                    <div className="bg-indigo-500 h-full transition-all" style={{ width: `${(gift.claimedQuotas / gift.totalQuotas) * 100}%` }}></div>
                                </div>
                            </div>

                            <button onClick={() => onDeleteItem('gifts', gift._id)} className="absolute top-4 right-4 text-slate-400 hover:text-rose-600 transition-colors">
                                <Trash size={16} />
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
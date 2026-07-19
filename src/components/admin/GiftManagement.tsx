'use client';

import React, { useState } from 'react';
import { Plus, Trash, Edit2, X, Save } from 'lucide-react';

interface GiftManagementProps {
    gifts: any[];
    onAddGift: (giftForm: { name: string; totalPrice: number; totalQuotas: number }) => Promise<void>;
    onDeleteItem: (route: 'gifts' | 'guests', id: string) => Promise<void>;
    onUpdateGift?: (id: string, updatedForm: { name: string; totalPrice: number; totalQuotas: number }) => Promise<void>;
}

export default function GiftManagement({ gifts, onAddGift, onDeleteItem, onUpdateGift }: GiftManagementProps) {
    const [form, setForm] = useState({ name: '', totalPrice: 0, totalQuotas: 1 });
    const [editingGift, setEditingGift] = useState<any | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onAddGift(form);
        setForm({ name: '', totalPrice: 0, totalQuotas: 1 });
    };

    const handleSaveEdit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (onUpdateGift && editingGift) {
            await onUpdateGift(editingGift._id, {
                name: editingGift.name,
                totalPrice: editingGift.totalPrice,
                totalQuotas: editingGift.totalQuotas
            });
            setEditingGift(null);
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-slate-800">Lista de Presentes (Cotas)</h1>

            {/* Form de Criação */}
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

            {/* Grid de Presentes */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {gifts.map((gift) => {
                    const quotaValue = gift.totalPrice / gift.totalQuotas;
                    return (
                        <div key={gift._id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 relative flex flex-col justify-between gap-4">
                            <div>
                                <h4 className="text-lg font-bold text-slate-800 mb-2 pr-12">{gift.name}</h4>
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

                            <div className="absolute top-4 right-4 flex items-center gap-1">
                                <button onClick={() => setEditingGift({ ...gift })} className="text-slate-400 hover:text-blue-600 p-1 rounded transition-colors" title="Editar">
                                    <Edit2 size={15} />
                                </button>
                                <button onClick={() => onDeleteItem('gifts', gift._id)} className="text-slate-400 hover:text-rose-600 p-1 rounded transition-colors" title="Excluir">
                                    <Trash size={15} />
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* MODAL SERVIÇO DE EDIÇÃO DE PRESENTE */}
            {editingGift && (
                <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl border border-slate-100 max-w-md w-full p-6 space-y-4 animate-in zoom-in-95 duration-150">
                        <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                            <h3 className="text-lg font-bold text-slate-800">Editar Presente / Cotas</h3>
                            <button onClick={() => setEditingGift(null)} className="text-slate-400 hover:text-slate-600">
                                <X size={18} />
                            </button>
                        </div>
                        <form onSubmit={handleSaveEdit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nome do Item</label>
                                <input type="text" required value={editingGift.name} onChange={e => setEditingGift({ ...editingGift, name: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800" />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Preço Total (R$)</label>
                                    <input type="number" required value={editingGift.totalPrice} onChange={e => setEditingGift({ ...editingGift, totalPrice: Number(e.target.value) })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Cotas Totais</label>
                                    <input type="number" required min={editingGift.claimedQuotas || 1} value={editingGift.totalQuotas} onChange={e => setEditingGift({ ...editingGift, totalQuotas: Number(e.target.value) })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800" />
                                </div>
                            </div>
                            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                                <button type="button" onClick={() => setEditingGift(null)} className="px-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50">Cancelar</button>
                                <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-lg flex items-center gap-1.5"><Save size={16} /> Salvar Presente</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
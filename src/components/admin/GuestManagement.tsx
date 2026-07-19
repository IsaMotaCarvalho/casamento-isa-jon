'use client';

import React, { useState } from 'react';
import { Plus, Share2, Trash, Edit2, X, Save, ShoppingBag } from 'lucide-react';

interface GuestManagementProps {
    guests: any[];
    orders: any[];
    onAddGuest: (guestForm: { name: string; phone: string; side: string }) => Promise<void>;
    onToggleConfirm: (id: string, currentStatus: boolean) => Promise<void>;
    onDeleteItem: (route: 'guests' | 'gifts', id: string) => Promise<void>;
    onUpdateGuest?: (id: string, updatedForm: { name: string; phone: string; side: string; confirmed: boolean }) => Promise<void>;
    onUpdateOrder?: (orderId: string, updatedFields: { quantity?: number; status?: string }) => Promise<void>;
    onDeleteOrder?: (orderId: string) => Promise<void>;
}

export default function GuestManagement({
    guests,
    orders,
    onAddGuest,
    onToggleConfirm,
    onDeleteItem,
    onUpdateGuest,
    onUpdateOrder,
    onDeleteOrder
}: GuestManagementProps) {
    const [form, setForm] = useState({ name: '', phone: '', side: 'noivo' });
    const [editingGuest, setEditingGuest] = useState<any | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onAddGuest(form);
        setForm({ name: '', phone: '', side: 'noivo' });
    };

    const handleSaveEdit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (onUpdateGuest && editingGuest) {
            await onUpdateGuest(editingGuest._id, {
                name: editingGuest.name,
                phone: editingGuest.phone,
                side: editingGuest.side,
                confirmed: editingGuest.confirmed
            });
            setEditingGuest(null);
        }
    };

    const sendWhatsappInvite = (guest: any) => {
        const guestLink = `${window.location.origin}/guest?id=${guest._id}`;
        const message = `Olá, *${guest.name}*! ✨\n\nEstamos muito felizes com o nosso casamento e sua presença é fundamental.\n\nPor favor, confirme sua presença e veja nossa lista de presentes acessando o seu link exclusivo abaixo:\n${guestLink}`;
        const cleanPhone = guest.phone.replace(/\D/g, '');
        const formattedPhone = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;
        window.open(`https://api.whatsapp.com/send?phone=${formattedPhone}&text=${encodeURIComponent(message)}`, '_blank');
    };

    // Filtra ordens do convidado atualmente aberto na modal de edição
    const editingGuestOrders = editingGuest ? (orders || []).filter(o => o.guestPhone === editingGuest.phone) : [];

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-slate-800">Controle de Convidados</h1>

            {/* Formulário de Cadastro */}
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

            {/* Listagem Corrigida para Rolagem Horizontal */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[700px]">
                    <thead>
                        <tr className="bg-slate-100 text-slate-600 text-sm font-semibold">
                            <th className="p-4">Nome</th>
                            <th className="p-4">Contato</th>
                            <th className="p-4">Vínculo</th>
                            <th className="p-4">Status Presença</th>
                            <th className="p-4">Cotas Compradas</th>
                            <th className="p-4 text-center">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                        {guests.map((guest) => {
                            const guestOrders = (orders || []).filter(o => o.guestPhone === guest.phone);
                            const totalContributed = guestOrders.reduce((acc, o) => acc + o.totalValue, 0);
                            const totalItemsCount = guestOrders.reduce((acc, o) => acc + o.quantity, 0);

                            return (
                                <tr key={guest._id} className="hover:bg-slate-50">
                                    <td className="p-4 font-medium">{guest.name}</td>
                                    <td className="p-4">{guest.phone}</td>
                                    <td className="p-4 capitalize">{guest.side}</td>
                                    <td className="p-4">
                                        <button onClick={() => onToggleConfirm(guest._id, guest.confirmed)} className={`px-3 py-1 rounded-full text-xs font-semibold ${guest.confirmed ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                                            {guest.confirmed ? 'Confirmado' : 'Pendente'}
                                        </button>
                                    </td>
                                    <td className="p-4">
                                        {guestOrders.length > 0 ? (
                                            <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-800 bg-amber-50 border border-amber-200 w-max px-2.5 py-1 rounded-xl">
                                                <ShoppingBag size={14} className="text-amber-600" />
                                                <span>{totalItemsCount}x cota(s) (R$ {totalContributed.toFixed(2)})</span>
                                            </div>
                                        ) : (
                                            <span className="text-xs text-slate-400">—</span>
                                        )}
                                    </td>
                                    <td className="p-4 flex items-center justify-center gap-2">
                                        <button onClick={() => sendWhatsappInvite(guest)} className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" title="Enviar Link">
                                            <Share2 size={16} />
                                        </button>
                                        <button onClick={() => setEditingGuest({ ...guest })} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Editar Convidado">
                                            <Edit2 size={16} />
                                        </button>
                                        <button onClick={() => onDeleteItem('guests', guest._id)} className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" title="Excluir Convidado">
                                            <Trash size={16} />
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* MODAL SERVIÇO DE EDIÇÃO DE CONVIDADO */}
            {editingGuest && (
                <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl border border-slate-100 max-w-md w-full p-6 space-y-4 animate-in zoom-in-95 duration-150">
                        <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                            <h3 className="text-lg font-bold text-slate-800">Editar Dados do Convidado</h3>
                            <button onClick={() => setEditingGuest(null)} className="text-slate-400 hover:text-slate-600">
                                <X size={18} />
                            </button>
                        </div>
                        <form onSubmit={handleSaveEdit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nome Completo</label>
                                <input type="text" required value={editingGuest.name} onChange={e => setEditingGuest({ ...editingGuest, name: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">WhatsApp</label>
                                <input type="text" required value={editingGuest.phone} onChange={e => setEditingGuest({ ...editingGuest, phone: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800" />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Vínculo</label>
                                    <select value={editingGuest.side} onChange={e => setEditingGuest({ ...editingGuest, side: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800">
                                        <option value="noivo">Noivo</option>
                                        <option value="noiva">Noiva</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Status Presença</label>
                                    <select value={editingGuest.confirmed ? 'true' : 'false'} onChange={e => setEditingGuest({ ...editingGuest, confirmed: e.target.value === 'true' })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800">
                                        <option value="false">Pendente</option>
                                        <option value="true">Confirmado</option>
                                    </select>
                                </div>
                            </div>

                            {/* SEÇÃO DINÂMICA: EDITAR COTAS DO CONVIDADO */}
                            <div className="border-t border-slate-100 pt-3 mt-3">
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Cotas Reservadas por Ele</label>
                                {editingGuestOrders.length === 0 ? (
                                    <p className="text-xs text-slate-400 italic">Nenhum presente escolhido por este convidado.</p>
                                ) : (
                                    <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                                        {editingGuestOrders.map((order) => (
                                            <div key={order._id} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                                                <div className="flex-1 min-w-0 pr-2">
                                                    <p className="font-semibold text-slate-800 truncate">{order.giftName}</p>
                                                    <p className="text-slate-500">Total: R$ {order.totalValue.toFixed(2)} ({order.status})</p>
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        value={order.quantity}
                                                        onChange={(e) => onUpdateOrder && onUpdateOrder(order._id, { quantity: Number(e.target.value) })}
                                                        className="w-12 px-1 py-0.5 border border-slate-300 rounded text-center font-bold text-slate-800 bg-white"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => onDeleteOrder && onDeleteOrder(order._id)}
                                                        className="p-1 text-rose-500 hover:bg-rose-50 rounded transition-colors"
                                                        title="Remover esta cota"
                                                    >
                                                        <Trash size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                                <button type="button" onClick={() => setEditingGuest(null)} className="px-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50">Cancelar</button>
                                <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-lg flex items-center gap-1.5"><Save size={16} /> Salvar Alterações</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
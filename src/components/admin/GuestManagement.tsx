'use client';

import React, { useState } from 'react';
import { Plus, Share2, Trash, Edit2, X, Save, ShoppingBag, UserPlus, CheckCircle2, HelpCircle } from 'lucide-react';

interface GuestManagementProps {
    guests: any[];
    orders: any[];
    onAddGuest: (guestForm: { name: string; phone: string; side: string; members: { name: string; confirmed: boolean }[] }) => Promise<void>;
    onToggleConfirm: (guestId: string, memberId: string, currentStatus: boolean) => Promise<void>;
    onDeleteItem: (route: 'guests' | 'gifts', id: string) => Promise<void>;
    onUpdateGuest?: (id: string, updatedForm: { name: string; phone: string; side: string; members: { name: string; confirmed: boolean }[] }) => Promise<void>;
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
    const [membersInputList, setMembersInputList] = useState<string[]>([]);
    const [memberField, setMemberField] = useState('');
    const [editingGuest, setEditingGuest] = useState<any | null>(null);
    const [editMemberField, setEditMemberField] = useState('');

    const handlePushMember = () => {
        if (!memberField.trim()) return;
        setMembersInputList([...membersInputList, memberField.trim()]);
        setMemberField('');
    };

    const handlePopMember = (index: number) => {
        setMembersInputList(membersInputList.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (membersInputList.length === 0) {
            alert('Adicione pelo menos um integrante para esta família.');
            return;
        }
        const parsedMembers = membersInputList.map(mName => ({ name: mName, confirmed: false }));
        await onAddGuest({ ...form, members: parsedMembers });
        setForm({ name: '', phone: '', side: 'noivo' });
        setMembersInputList([]);
    };

    const handleSaveEdit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (onUpdateGuest && editingGuest) {
            await onUpdateGuest(editingGuest._id, {
                name: editingGuest.name,
                phone: editingGuest.phone,
                side: editingGuest.side,
                members: editingGuest.members
            });
            setEditingGuest(null);
        }
    };

    const sendWhatsappInvite = (guest: any) => {
        const guestLink = `${window.location.origin}/guest?id=${guest._id}`;
        const message = `Olá, *${guest.name}*! ✨\n\nEstamos muito felizes com o nosso casamento e a presença de vocês é fundamental.\n\nPor favor, confirmem a presença de cada membro da família e vejam nossa lista de presentes acessando o link exclusivo da família abaixo:\n${guestLink}`;
        const cleanPhone = guest.phone.replace(/\D/g, '');
        const formattedPhone = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;
        window.open(`https://api.whatsapp.com/send?phone=${formattedPhone}&text=${encodeURIComponent(message)}`, '_blank');
    };

    const editingGuestOrders = editingGuest ? (orders || []).filter(o => o.guestPhone === editingGuest.phone) : [];

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-slate-800">Controle de Famílias</h1>

            {/* Formulário de Cadastro da Família */}
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1">Nome do Grupo Familiar</label>
                        <input type="text" required placeholder="Ex: Família Carvalho" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-800" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1">WhatsApp Responsável (com DDD)</label>
                        <input type="text" required placeholder="18999999999" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-800" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1">Vínculo</label>
                        <select value={form.side} onChange={e => setForm({ ...form, side: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-800">
                            <option value="noivo">Noivo</option>
                            <option value="noiva">Noiva</option>
                        </select>
                    </div>
                </div>

                {/* Sub-lista Dinâmica de Parentes */}
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-3">
                    <label className="block text-sm font-semibold text-slate-700">Adicionar Integrantes</label>
                    <div className="flex gap-2">
                        <input type="text" placeholder="Nome do integrante" value={memberField} onChange={e => setMemberField(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handlePushMember(); } }} className="flex-1 px-3 py-1.5 text-sm border border-slate-200 rounded-lg text-slate-800" />
                        <button type="button" onClick={handlePushMember} className="bg-slate-800 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-slate-700 flex items-center gap-1">
                            <UserPlus size={16} /> Incluir
                        </button>
                    </div>
                    <div className="flex flex-wrap gap-2 pt-1">
                        {membersInputList.map((m, idx) => (
                            <span key={idx} className="bg-white border border-slate-300 text-slate-700 px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1 shadow-sm">
                                {m}
                                <button type="button" onClick={() => handlePopMember(idx)} className="text-rose-500 hover:text-rose-700 font-bold ml-1">
                                    <X size={12} />
                                </button>
                            </span>
                        ))}
                        {membersInputList.length === 0 && <p className="text-xs text-slate-400 italic">Insira os nomes acima para compor a família.</p>}
                    </div>
                </div>

                <div className="flex justify-end">
                    <button type="submit" className="bg-emerald-600 text-white px-5 py-2 rounded-lg font-medium flex items-center gap-2 hover:bg-emerald-700 transition-colors">
                        <Plus size={18} /> Salvar Grupo Familiar
                    </button>
                </div>
            </form>

            {/* Listagem das Famílias */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[800px]">
                    <thead>
                        <tr className="bg-slate-100 text-slate-600 text-sm font-semibold">
                            <th className="p-4">Família</th>
                            <th className="p-4">Contato Principal</th>
                            <th className="p-4">Vínculo</th>
                            <th className="p-4">Status dos Integrantes</th>
                            <th className="p-4">Presentes Comprados</th>
                            <th className="p-4 text-center">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                        {guests.map((guest) => {
                            const guestOrders = (orders || []).filter(o => o.guestPhone === guest.phone);
                            const totalContributed = guestOrders.reduce((acc, o) => acc + o.totalValue, 0);
                            const totalItemsCount = guestOrders.reduce((acc, o) => acc + o.quantity, 0);

                            const totalM = guest.members?.length || 0;
                            const confirmedM = guest.members?.filter((m: any) => m.confirmed).length || 0;

                            return (
                                <tr key={guest._id} className="hover:bg-slate-50">
                                    <td className="p-4 font-bold text-slate-900">{guest.name}</td>
                                    <td className="p-4 font-mono text-sm">{guest.phone}</td>
                                    <td className="p-4 capitalize text-sm">{guest.side}</td>
                                    <td className="p-4">
                                        <div className="text-xs text-slate-500 mb-1.5 font-semibold">
                                            Confirmados: {confirmedM} de {totalM}
                                        </div>
                                        <div className="flex flex-wrap gap-1.5 max-w-xs">
                                            {guest.members?.map((member: any) => (
                                                <button
                                                    key={member._id}
                                                    type="button"
                                                    onClick={() => onToggleConfirm(guest._id, member._id, member.confirmed)}
                                                    className={`px-2 py-0.5 rounded text-xs font-medium flex items-center gap-1 transition-all border ${member.confirmed ? 'bg-emerald-50 border-emerald-300 text-emerald-800' : 'bg-amber-50 border-amber-300 text-amber-800'}`}
                                                >
                                                    {member.confirmed ? <CheckCircle2 size={12} className="text-emerald-600" /> : <HelpCircle size={12} className="text-amber-600" />}
                                                    {member.name}
                                                </button>
                                            ))}
                                        </div>
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
                                        <button onClick={() => sendWhatsappInvite(guest)} className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" title="Enviar Link da Família">
                                            <Share2 size={16} />
                                        </button>
                                        <button onClick={() => setEditingGuest(JSON.parse(JSON.stringify(guest)))} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Editar Estrutura">
                                            <Edit2 size={16} />
                                        </button>
                                        <button onClick={() => onDeleteItem('guests', guest._id)} className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" title="Excluir Família">
                                            <Trash size={16} />
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* MODAL DE EDIÇÃO DE FAMÍLIA E SEUS INTEGRANTES */}
            {editingGuest && (
                <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl border border-slate-100 max-w-md w-full p-6 space-y-4">
                        <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                            <h3 className="text-lg font-bold text-slate-800">Editar Grupo Familiar</h3>
                            <button onClick={() => setEditingGuest(null)} className="text-slate-400 hover:text-slate-600">
                                <X size={18} />
                            </button>
                        </div>
                        <form onSubmit={handleSaveEdit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nome da Família</label>
                                <input type="text" required value={editingGuest.name} onChange={e => setEditingGuest({ ...editingGuest, name: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">WhatsApp Principal</label>
                                <input type="text" required value={editingGuest.phone} onChange={e => setEditingGuest({ ...editingGuest, phone: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Vínculo</label>
                                <select value={editingGuest.side} onChange={e => setEditingGuest({ ...editingGuest, side: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800">
                                    <option value="noivo">Noivo</option>
                                    <option value="noiva">Noiva</option>
                                </select>
                            </div>

                            {/* Editar integrantes existentes no Modal */}
                            <div className="border-t border-slate-100 pt-3">
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Integrantes do Grupo</label>
                                <div className="flex gap-2 mb-2">
                                    <input type="text" placeholder="Incluir novo parente" value={editMemberField} onChange={e => setEditMemberField(e.target.value)} className="flex-1 px-2 py-1 text-xs border rounded text-slate-800" />
                                    <button type="button" onClick={() => { if (!editMemberField.trim()) return; editingGuest.members.push({ name: editMemberField.trim(), confirmed: false }); setEditMemberField(''); }} className="bg-slate-700 text-white px-3 py-1 rounded text-xs">Incluir</button>
                                </div>
                                <div className="space-y-2 max-h-36 overflow-y-auto bg-slate-50 p-2 rounded-lg border">
                                    {editingGuest.members.map((m: any, idx: number) => (
                                        <div key={idx} className="flex items-center justify-between bg-white p-1.5 rounded border text-xs shadow-sm">
                                            <span className="font-medium text-slate-800 truncate max-w-[150px]">{m.name}</span>
                                            <div className="flex items-center gap-2">
                                                <select value={m.confirmed ? 'true' : 'false'} onChange={e => { editingGuest.members[idx].confirmed = e.target.value === 'true'; setEditingGuest({ ...editingGuest }); }} className="border rounded text-[11px] p-0.5 bg-slate-50 text-slate-700">
                                                    <option value="false">Pendente</option>
                                                    <option value="true">Confirmado</option>
                                                </select>
                                                <button type="button" onClick={() => { editingGuest.members.splice(idx, 1); setEditingGuest({ ...editingGuest }); }} className="text-rose-500 hover:text-rose-700"><Trash size={12} /></button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Exibição de Cotas Compradas */}
                            <div className="border-t border-slate-100 pt-3">
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Cotas Reservadas pela Família</label>
                                {editingGuestOrders.length === 0 ? (
                                    <p className="text-xs text-slate-400 italic">Nenhum presente escolhido por esta família.</p>
                                ) : (
                                    <div className="space-y-2 max-h-32 overflow-y-auto pr-1">
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
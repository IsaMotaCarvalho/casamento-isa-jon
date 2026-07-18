'use client';

import { useState, useEffect } from 'react';
import { LayoutDashboard, Users, Gift, CheckCircle, Clock, Plus, Trash, Share2, MessageSquare } from 'lucide-react';

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState<'dash' | 'guests' | 'gifts'>('dash');
    const [guests, setGuests] = useState<any[]>([]);
    const [gifts, setGifts] = useState<any[]>([]);

    // Formulários de cadastro rápido
    const [guestForm, setGuestForm] = useState({ name: '', phone: '', side: 'noivo' });
    const [giftForm, setGiftForm] = useState({ name: '', totalPrice: 0, totalQuotas: 1 });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        const resGuests = await fetch('/api/guests');
        const dataGuests = await resGuests.json();
        setGuests(dataGuests);

        const resGifts = await fetch('/api/gifts');
        const dataGifts = await resGifts.json();
        setGifts(dataGifts);
    };

    const handleAddGuest = async (e: React.FormEvent) => {
        e.preventDefault();
        await fetch('/api/guests', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(guestForm),
        });
        setGuestForm({ name: '', phone: '', side: 'noivo' });
        fetchData();
    };

    const handleAddGift = async (e: React.FormEvent) => {
        e.preventDefault();
        await fetch('/api/gifts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(giftForm),
        });
        setGiftForm({ name: '', totalPrice: 0, totalQuotas: 1 });
        fetchData();
    };

    const toggleConfirmGuest = async (id: string, currentStatus: boolean) => {
        await fetch('/api/guests', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, confirmed: !currentStatus }),
        });
        fetchData();
    };

    const deleteItem = async (route: 'guests' | 'gifts', id: string) => {
        await fetch(`/api/${route}?id=${id}`, { method: 'DELETE' });
        fetchData();
    };

    const sendWhatsappInvite = (guest: any) => {
        // Gera o link dinâmico com o ID único do convidado para o RSVP
        const guestLink = `${window.location.origin}?id=${guest._id}`;

        // Monta a mensagem formatada com negritos (*) e quebras de linha (\n)
        const message = `Olá, *${guest.name}*! ✨\n\n` +
            `Estamos muito felizes com o nosso casamento e sua presença é fundamental.\n\n` +
            `Por favor, confirme sua presença e veja nossa lista de presentes acessando o seu link exclusivo abaixo:\n` +
            `${guestLink}`;

        // Trata o número de telefone removendo caracteres não numéricos
        const cleanPhone = guest.phone.replace(/\D/g, '');

        // Garante a inclusão do DDI 55 (Brasil) caso não exista
        const formattedPhone = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;

        const url = `https://api.whatsapp.com/send?phone=${formattedPhone}&text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
    };

    // Cálculos do Dashboard
    const confirmedCount = guests.filter(g => g.confirmed).length;
    const pendingCount = guests.length - confirmedCount;
    const totalQuotasMarked = gifts.reduce((acc, curr) => acc + curr.claimedQuotas, 0);

    return (
        <div className="min-h-screen bg-slate-50 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-slate-900 text-white p-6 flex flex-col gap-8">
                <h2 className="text-xl font-bold tracking-wider text-amber-400">💍 Noivos CRM</h2>
                <nav className="flex flex-col gap-2">
                    <button onClick={() => setActiveTab('dash')} className={`flex items-center gap-3 p-3 rounded-lg text-left ${activeTab === 'dash' ? 'bg-amber-500 text-slate-900 font-semibold' : 'hover:bg-slate-800'}`}>
                        <LayoutDashboard size={20} /> Dashboard
                    </button>
                    <button onClick={() => setActiveTab('guests')} className={`flex items-center gap-3 p-3 rounded-lg text-left ${activeTab === 'guests' ? 'bg-amber-500 text-slate-900 font-semibold' : 'hover:bg-slate-800'}`}>
                        <Users size={20} /> Gestão de Convidados
                    </button>
                    <button onClick={() => setActiveTab('gifts')} className={`flex items-center gap-3 p-3 rounded-lg text-left ${activeTab === 'gifts' ? 'bg-amber-500 text-slate-900 font-semibold' : 'hover:bg-slate-800'}`}>
                        <Gift size={20} /> Gestão de Presentes
                    </button>
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-10 overflow-y-auto">
                {activeTab === 'dash' && (
                    <div className="space-y-8">
                        <h1 className="text-3xl font-bold text-slate-800">Visão Geral do Evento</h1>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-slate-500 font-medium">Total Convidados</p>
                                    <p className="text-2xl font-bold text-slate-800">{guests.length}</p>
                                </div>
                                <Users className="text-blue-500" size={32} />
                            </div>
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-slate-500 font-medium">Confirmados</p>
                                    <p className="text-2xl font-bold text-emerald-600">{confirmedCount}</p>
                                </div>
                                <CheckCircle className="text-emerald-500" size={32} />
                            </div>
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-slate-500 font-medium">Pendentes</p>
                                    <p className="text-2xl font-bold text-amber-600">{pendingCount}</p>
                                </div>
                                <Clock className="text-amber-500" size={32} />
                            </div>
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-slate-500 font-medium">Cotas Reservadas</p>
                                    <p className="text-2xl font-bold text-indigo-600">{totalQuotasMarked}</p>
                                </div>
                                <Gift className="text-indigo-500" size={32} />
                            </div>
                        </div>

                        {/* Mural de Mensagens */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                                <MessageSquare size={18} /> Mensagens Deixadas aos Noivos
                            </h3>
                            <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto">
                                {guests.filter(g => g.message).map((g, i) => (
                                    <div key={i} className="py-3">
                                        <p className="text-sm font-semibold text-slate-700">{g.name} ({g.side === 'noivo' ? 'Noivo' : 'Noiva'}):</p>
                                        <p className="text-sm text-slate-600 italic">"{g.message}"</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'guests' && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h1 className="text-2xl font-bold text-slate-800">Controle de Convidados</h1>
                        </div>

                        {/* Cadastro Form */}
                        <form onSubmit={handleAddGuest} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                            <div>
                                <label className="block text-sm font-medium text-slate-600 mb-1">Nome Completo</label>
                                <input type="text" required value={guestForm.name} onChange={e => setGuestForm({ ...guestForm, name: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-800" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-600 mb-1">WhatsApp (com DDD)</label>
                                <input type="text" required placeholder="18999999999" value={guestForm.phone} onChange={e => setGuestForm({ ...guestForm, phone: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-800" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-600 mb-1">Convidado de quem?</label>
                                <select value={guestForm.side} onChange={e => setGuestForm({ ...guestForm, side: e.target.value as any })} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-800">
                                    <option value="noivo">Noivo</option>
                                    <option value="noiva">Noiva</option>
                                </select>
                            </div>
                            <button type="submit" className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-emerald-700 transition-colors">
                                <Plus size={18} /> Adicionar Convidado
                            </button>
                        </form>

                        {/* Tabela de Dados */}
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
                                                <button onClick={() => toggleConfirmGuest(guest._id, guest.confirmed)} className={`px-3 py-1 rounded-full text-xs font-semibold ${guest.confirmed ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                                                    {guest.confirmed ? 'Confirmado' : 'Pendente'}
                                                </button>
                                            </td>
                                            <td className="p-4 flex items-center justify-center gap-3">
                                                <button onClick={() => sendWhatsappInvite(guest)} className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" title="Enviar convite por WhatsApp">
                                                    <Share2 size={18} />
                                                </button>
                                                <button onClick={() => deleteItem('guests', guest._id)} className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" title="Excluir Convidado">
                                                    <Trash size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'gifts' && (
                    <div className="space-y-6">
                        <h1 className="text-2xl font-bold text-slate-800">Lista de Presentes (Cotas)</h1>

                        {/* Cadastro Presente */}
                        <form onSubmit={handleAddGift} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                            <div>
                                <label className="block text-sm font-medium text-slate-600 mb-1">Nome do Item/Cota</label>
                                <input type="text" required placeholder="Ex: Geladeira Frost Free" value={giftForm.name} onChange={e => setGiftForm({ ...giftForm, name: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-800" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-600 mb-1">Valor Total (R$)</label>
                                <input type="number" required value={giftForm.totalPrice || ''} onChange={e => setGiftForm({ ...giftForm, totalPrice: Number(e.target.value) })} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-800" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-600 mb-1">Quantidade de Cotas</label>
                                <input type="number" required min="1" value={giftForm.totalQuotas} onChange={e => setGiftForm({ ...giftForm, totalQuotas: Number(e.target.value) })} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-800" />
                            </div>
                            <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-indigo-700 transition-colors">
                                <Plus size={18} /> Adicionar Item
                            </button>
                        </form>

                        {/* Cards de Presentes */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {gifts.map((gift) => {
                                const quotaValue = gift.totalPrice / gift.totalQuotas;
                                return (
                                    <div key={gift._id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 relative flex flex-col justify-between gap-4">
                                        <div>
                                            <h4 className="text-lg font-bold text-slate-800 mb-2">{gift.name}</h4>
                                            <p className="text-sm text-slate-500">Valor Total: <span className="font-semibold text-slate-800">R$ {gift.totalPrice.toFixed(2)}</span></p>
                                            <p className="text-sm text-slate-500">Valor unitário da cota: <span className="font-semibold text-indigo-600">R$ {quotaValue.toFixed(2)}</span></p>
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

                                        <button onClick={() => deleteItem('gifts', gift._id)} className="absolute top-4 right-4 text-slate-400 hover:text-rose-600 transition-colors">
                                            <Trash size={16} />
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
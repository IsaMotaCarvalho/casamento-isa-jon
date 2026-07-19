'use client';

import React, { useState } from 'react';
import { Users, CheckCircle, Clock, Gift, MessageSquare, X, Search, DollarSign } from 'lucide-react';

interface DashboardOverviewProps {
    guests: any[];
    gifts: any[];
    totalQuotasMarked: number;
}

type DetailView = 'total' | 'confirmed' | 'pending' | 'quotas' | null;

export default function DashboardOverview({ guests, gifts, totalQuotasMarked }: DashboardOverviewProps) {
    const [view, setView] = useState<DetailView>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const confirmedGuests = guests.filter(g => g.confirmed);
    const pendingGuests = guests.filter(g => !g.confirmed);

    // Une as reservas de todas as cotas para o detalhamento
    const allQuotasDetails = gifts.flatMap(gift => {
        const quotaPrice = gift.totalPrice / gift.totalQuotas;
        const reservations = gift.reservations || [];
        return reservations.map((res: any) => ({
            guestName: res.guestName || 'Convidado Confirmado',
            giftName: gift.name,
            quantity: res.quantity,
            quotaValue: quotaPrice,
            totalValue: quotaPrice * res.quantity,
            date: res.createdAt ? new Date(res.createdAt).toLocaleDateString('pt-BR') : 'Recente'
        }));
    });

    const filteredGuests = guests.filter(g => g.name.toLowerCase().includes(searchTerm.toLowerCase()));
    const filteredConfirmed = confirmedGuests.filter(g => g.name.toLowerCase().includes(searchTerm.toLowerCase()));
    const filteredPending = pendingGuests.filter(g => g.name.toLowerCase().includes(searchTerm.toLowerCase()));
    const filteredQuotas = allQuotasDetails.filter(q => q.guestName.toLowerCase().includes(searchTerm.toLowerCase()) || q.giftName.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-slate-800">Visão Geral do Evento</h1>

            {/* Indicadores Clicáveis */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div
                    onClick={() => { setView('total'); setSearchTerm(''); }}
                    className={`p-6 rounded-xl shadow-sm border cursor-pointer transition-all flex items-center justify-between ${view === 'total' ? 'bg-blue-50 border-blue-300 ring-2 ring-blue-200' : 'bg-white border-slate-100 hover:border-blue-200 hover:shadow-md'}`}
                >
                    <div>
                        <p className="text-sm text-slate-500 font-medium">Total Convidados</p>
                        <p className="text-2xl font-bold text-slate-800">{guests.length}</p>
                    </div>
                    <Users className="text-blue-500" size={32} />
                </div>

                <div
                    onClick={() => { setView('confirmed'); setSearchTerm(''); }}
                    className={`p-6 rounded-xl shadow-sm border cursor-pointer transition-all flex items-center justify-between ${view === 'confirmed' ? 'bg-emerald-50 border-emerald-300 ring-2 ring-emerald-200' : 'bg-white border-slate-100 hover:border-emerald-200 hover:shadow-md'}`}
                >
                    <div>
                        <p className="text-sm text-slate-500 font-medium">Confirmados</p>
                        <p className="text-2xl font-bold text-emerald-600">{confirmedGuests.length}</p>
                    </div>
                    <CheckCircle className="text-emerald-500" size={32} />
                </div>

                <div
                    onClick={() => { setView('pending'); setSearchTerm(''); }}
                    className={`p-6 rounded-xl shadow-sm border cursor-pointer transition-all flex items-center justify-between ${view === 'pending' ? 'bg-amber-50 border-amber-300 ring-2 ring-amber-200' : 'bg-white border-slate-100 hover:border-amber-200 hover:shadow-md'}`}
                >
                    <div>
                        <p className="text-sm text-slate-500 font-medium">Pendentes</p>
                        <p className="text-2xl font-bold text-amber-600">{pendingGuests.length}</p>
                    </div>
                    <Clock className="text-amber-500" size={32} />
                </div>

                <div
                    onClick={() => { setView('quotas'); setSearchTerm(''); }}
                    className={`p-6 rounded-xl shadow-sm border cursor-pointer transition-all flex items-center justify-between ${view === 'quotas' ? 'bg-indigo-50 border-indigo-300 ring-2 ring-indigo-200' : 'bg-white border-slate-100 hover:border-indigo-200 hover:shadow-md'}`}
                >
                    <div>
                        <p className="text-sm text-slate-500 font-medium">Cotas Reservadas</p>
                        <p className="text-2xl font-bold text-indigo-600">{totalQuotasMarked}</p>
                    </div>
                    <Gift className="text-indigo-500" size={32} />
                </div>
            </div>

            {/* Micro-serviço Dinâmico de Exibição dos Registros Selecionados */}
            {view && (
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-4 animate-in fade-in duration-200">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                            {view === 'total' && <>Lista de Todos os Convidados ({guests.length})</>}
                            {view === 'confirmed' && <>Convidados Confirmados ({confirmedGuests.length})</>}
                            {view === 'pending' && <>Convidados Pendentes ({pendingGuests.length})</>}
                            {view === 'quotas' && <>Detalhamento de Cotas Escolhidas ({allQuotasDetails.length})</>}
                        </h3>
                        <button onClick={() => setView(null)} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-50">
                            <X size={18} />
                        </button>
                    </div>

                    {/* Barra de Busca de Registro Interno */}
                    <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 max-w-sm">
                        <Search size={16} className="text-slate-400" />
                        <input
                            type="text"
                            placeholder="Buscar nesta listagem..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-transparent text-sm text-slate-800 outline-none w-full"
                        />
                    </div>

                    <div className="overflow-x-auto max-h-80 overflow-y-auto border border-slate-100 rounded-lg">
                        <table className="w-full text-left border-collapse text-sm">
                            <thead>
                                <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-100">
                                    {view !== 'quotas' ? (
                                        <>
                                            <th className="p-3">Nome</th>
                                            <th className="p-3">Contato</th>
                                            <th className="p-3">Vínculo</th>
                                            <th className="p-3">Status</th>
                                        </>
                                    ) : (
                                        <>
                                            <th className="p-3">Quem Reservou</th>
                                            <th className="p-3">O que Reservou</th>
                                            <th className="p-3 text-center">Quantidade</th>
                                            <th className="p-3">Valor Cota</th>
                                            <th className="p-3">Valor Total</th>
                                        </>
                                    )}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-slate-700">
                                {view === 'total' && filteredGuests.map((g, i) => (
                                    <tr key={i} className="hover:bg-slate-50/80">
                                        <td className="p-3 font-medium text-slate-900">{g.name}</td>
                                        <td className="p-3">{g.phone}</td>
                                        <td className="p-3 capitalize">{g.side}</td>
                                        <td className="p-3">
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${g.confirmed ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                                                {g.confirmed ? 'Confirmado' : 'Pendente'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}

                                {view === 'confirmed' && filteredConfirmed.map((g, i) => (
                                    <tr key={i} className="hover:bg-slate-50/80">
                                        <td className="p-3 font-medium text-slate-900">{g.name}</td>
                                        <td className="p-3">{g.phone}</td>
                                        <td className="p-3 capitalize">{g.side}</td>
                                        <td className="p-3">
                                            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">Confirmado</span>
                                        </td>
                                    </tr>
                                ))}

                                {view === 'pending' && filteredPending.map((g, i) => (
                                    <tr key={i} className="hover:bg-slate-50/80">
                                        <td className="p-3 font-medium text-slate-900">{g.name}</td>
                                        <td className="p-3">{g.phone}</td>
                                        <td className="p-3 capitalize">{g.side}</td>
                                        <td className="p-3">
                                            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">Pendente</span>
                                        </td>
                                    </tr>
                                ))}

                                {view === 'quotas' && filteredQuotas.map((q, i) => (
                                    <tr key={i} className="hover:bg-slate-50/80">
                                        <td className="p-3 font-semibold text-slate-900">{q.guestName}</td>
                                        <td className="p-3 text-slate-600">{q.giftName}</td>
                                        <td className="p-3 text-center font-bold text-indigo-600">{q.quantity}x</td>
                                        <td className="p-3 text-slate-500">R$ {q.quotaValue.toFixed(2)}</td>
                                        <td className="p-3 font-bold text-emerald-600">R$ {q.totalValue.toFixed(2)}</td>
                                    </tr>
                                ))}

                                {((view === 'total' && filteredGuests.length === 0) ||
                                    (view === 'confirmed' && filteredConfirmed.length === 0) ||
                                    (view === 'pending' && filteredPending.length === 0) ||
                                    (view === 'quotas' && filteredQuotas.length === 0)) && (
                                        <tr>
                                            <td colSpan={5} className="p-4 text-center text-slate-400 italic">Nenhum registro encontrado correspondente aos critérios.</td>
                                        </tr>
                                    )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

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
                    {guests.filter(g => g.message).length === 0 && (
                        <p className="text-sm text-slate-400 py-2 italic">Nenhuma mensagem enviada ainda.</p>
                    )}
                </div>
            </div>
        </div>
    );
}
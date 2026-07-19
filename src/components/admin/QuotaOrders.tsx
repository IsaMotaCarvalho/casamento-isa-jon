'use client';

import React, { useState } from 'react';
import { DollarSign, ClipboardList, Filter, Search, CheckCircle2, AlertCircle } from 'lucide-react';

interface QuotaOrdersProps {
    gifts: any[];
    onUpdateOrderStatus?: (orderId: string, giftId: string, newStatus: 'pendente' | 'recebido') => Promise<void>;
}

export default function QuotaOrders({ gifts, onUpdateOrderStatus }: QuotaOrdersProps) {
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState<'todos' | 'pendente' | 'recebido'>('todos');

    // Mapeia e estrutura todas as transações para o modelo CRM Pipeline
    const allOrders = gifts.flatMap(gift => {
        const quotaPrice = gift.totalPrice / gift.totalQuotas;
        const reservations = gift.reservations || [];

        return reservations.map((res: any) => ({
            id: res._id || Math.random().toString(),
            giftId: gift._id,
            guestName: res.guestName || 'Convidado Confirmado',
            giftName: gift.name,
            quantity: res.quantity,
            quotaValue: quotaPrice,
            totalValue: quotaPrice * res.quantity,
            status: res.status || 'recebido', // Fallback caso não possua a propriedade estruturada ainda
            date: res.createdAt ? new Date(res.createdAt).toLocaleDateString('pt-BR') : 'Recente'
        }));
    });

    // Filtros dinâmicos de busca e pipeline do CRM
    const filteredOrders = allOrders.filter(order => {
        const matchesSearch = order.guestName.toLowerCase().includes(search.toLowerCase()) ||
            order.giftName.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = filterStatus === 'todos' || order.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    const totalRevenue = allOrders.reduce((acc, curr) => acc + curr.totalValue, 0);
    const totalReceived = allOrders.filter(o => o.status === 'recebido').reduce((acc, curr) => acc + curr.totalValue, 0);
    const totalPending = allOrders.filter(o => o.status === 'pendente').reduce((acc, curr) => acc + curr.totalValue, 0);

    const toggleStatus = async (order: any) => {
        if (onUpdateOrderStatus) {
            const targetStatus = order.status === 'recebido' ? 'pendente' : 'recebido';
            await onUpdateOrderStatus(order.id, order.giftId, targetStatus);
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-slate-800">Pipeline de Cotas Recebidas (CRM)</h1>

            {/* Painel Financeiro do CRM */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl flex items-center justify-between">
                    <div>
                        <span className="text-xs text-emerald-700 font-bold uppercase tracking-wider block">Confirmado / Recebido</span>
                        <strong className="text-xl font-bold text-emerald-800">R$ {totalReceived.toFixed(2)}</strong>
                    </div>
                    <CheckCircle2 className="text-emerald-600" size={24} />
                </div>
                <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-center justify-between">
                    <div>
                        <span className="text-xs text-amber-700 font-bold uppercase tracking-wider block">Aguardando Verificação</span>
                        <strong className="text-xl font-bold text-amber-800">R$ {totalPending.toFixed(2)}</strong>
                    </div>
                    <AlertCircle className="text-amber-600" size={24} />
                </div>
                <div className="bg-slate-100 border border-slate-200 p-4 rounded-xl flex items-center justify-between">
                    <div>
                        <span className="text-xs text-slate-600 font-bold uppercase tracking-wider block">Total Geral Intencionado</span>
                        <strong className="text-xl font-bold text-slate-800">R$ {totalRevenue.toFixed(2)}</strong>
                    </div>
                    <DollarSign className="text-slate-600" size={24} />
                </div>
            </div>

            {/* Controles de Funil e Busca do CRM */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 w-full md:max-w-sm">
                    <Search size={18} className="text-slate-400" />
                    <input
                        type="text"
                        placeholder="Buscar por convidado ou presente..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="bg-transparent text-sm text-slate-800 outline-none w-full"
                    />
                </div>

                <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
                    <Filter size={16} />
                    <span>Filtrar Funil:</span>
                    <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-50 text-xs">
                        <button onClick={() => setFilterStatus('todos')} className={`px-3 py-1.5 rounded-md font-semibold transition-all ${filterStatus === 'todos' ? 'bg-white shadow text-slate-800' : 'text-slate-500 hover:text-slate-800'}`}>Todos</button>
                        <button onClick={() => setFilterStatus('recebido')} className={`px-3 py-1.5 rounded-md font-semibold transition-all ${filterStatus === 'recebido' ? 'bg-emerald-600 text-white shadow' : 'text-slate-500 hover:text-slate-800'}`}>Recebidos</button>
                        <button onClick={() => setFilterStatus('pendente')} className={`px-3 py-1.5 rounded-md font-semibold transition-all ${filterStatus === 'pendente' ? 'bg-amber-500 text-slate-900 shadow' : 'text-slate-500 hover:text-slate-800'}`}>Pendentes</button>
                    </div>
                </div>
            </div>

            {/* Grid / Tabela CRM */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                {filteredOrders.length === 0 ? (
                    <div className="p-8 text-center text-slate-500 flex flex-col items-center justify-center gap-2">
                        <ClipboardList size={36} className="text-slate-300" />
                        <p className="italic text-sm">Nenhum registro de cota encontrado com esses filtros.</p>
                    </div>
                ) : (
                    <table className="w-full text-left border-collapse text-sm">
                        <thead>
                            <tr className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200">
                                <th className="p-4">Convidado</th>
                                <th className="p-4">Presente Escolhido</th>
                                <th className="p-4 text-center">Quantidade</th>
                                <th className="p-4">Valor Total</th>
                                <th className="p-4">Data Registro</th>
                                <th className="p-4 text-center">Estágio / Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-700">
                            {filteredOrders.map((order, idx) => (
                                <tr key={order.id + idx} className="hover:bg-slate-50/60 transition-colors">
                                    <td className="p-4 font-bold text-slate-800">{order.guestName}</td>
                                    <td className="p-4 text-slate-600">{order.giftName}</td>
                                    <td className="p-4 text-center font-bold text-indigo-600">{order.quantity}x</td>
                                    <td className="p-4 font-extrabold text-slate-900">R$ {order.totalValue.toFixed(2)}</td>
                                    <td className="p-4 text-xs text-slate-400">{order.date}</td>
                                    <td className="p-4 text-center">
                                        <button
                                            onClick={() => toggleStatus(order)}
                                            className={`px-3 py-1 rounded-full text-xs font-bold transition-all border ${order.status === 'recebido' ? 'bg-emerald-50 border-emerald-300 text-emerald-800 hover:bg-emerald-100' : 'bg-amber-50 border-amber-300 text-amber-800 hover:bg-amber-100'}`}
                                        >
                                            {order.status === 'recebido' ? '✓ Pago / Recebido' : '⏰ Pendente'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
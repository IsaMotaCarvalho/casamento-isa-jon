'use client';

import React, { useState } from 'react';
import { CheckCircle, AlertCircle, DollarSign, Search, ClipboardList } from 'lucide-react';

interface QuotaOrdersProps {
    orders: any[];
    onUpdateOrderStatus: (orderId: string, giftId: string, newStatus: 'pendente' | 'recebido') => void;
}

export default function QuotaOrders({ orders, onUpdateOrderStatus }: QuotaOrdersProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<'todos' | 'recebido' | 'pendente'>('todos');

    // Cálculos dinâmicos dos cards superiores baseados na lista de pedidos ativa
    const totalReceived = orders
        .filter(o => o.status === 'recebido')
        .reduce((acc, o) => acc + o.totalValue, 0);

    const totalPending = orders
        .filter(o => o.status === 'pendente')
        .reduce((acc, o) => acc + o.totalValue, 0);

    const totalIntended = totalReceived + totalPending;

    // Regras do funil de filtragem e busca por nome ou presente
    const filteredOrders = orders.filter(order => {
        const matchesSearch =
            (order.guestName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (order.giftName || '').toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus =
            statusFilter === 'todos' || order.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-slate-800">Pipeline de Cotas Recebidas (CRM)</h1>
            </div>

            {/* Cards de Métricas Reativas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-emerald-50/50 border border-emerald-200 p-6 rounded-2xl flex justify-between items-center shadow-sm">
                    <div className="space-y-1">
                        <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block">Confirmado / Recebido</span>
                        <span className="text-2xl font-bold text-emerald-700">R$ {totalReceived.toFixed(2)}</span>
                    </div>
                    <CheckCircle className="text-emerald-500 w-6 h-6" />
                </div>

                <div className="bg-amber-50/50 border border-amber-200 p-6 rounded-2xl flex justify-between items-center shadow-sm">
                    <div className="space-y-1">
                        <span className="text-xs font-bold text-amber-800 uppercase tracking-wider block">Aguardando Verificação</span>
                        <span className="text-2xl font-bold text-amber-700">R$ {totalPending.toFixed(2)}</span>
                    </div>
                    <AlertCircle className="text-amber-500 w-6 h-6" />
                </div>

                <div className="bg-slate-50 border border-slate-200 p-6 rounded-2xl flex justify-between items-center shadow-sm">
                    <div className="space-y-1">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Total Geral Intencionado</span>
                        <span className="text-2xl font-bold text-slate-800">R$ {totalIntended.toFixed(2)}</span>
                    </div>
                    <DollarSign className="text-slate-400 w-6 h-6" />
                </div>
            </div>

            {/* Barra de Filtros e Busca */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="relative w-full sm:max-w-md">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Buscar por convidado ou presente..."
                        className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-slate-700"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                    <span className="text-xs font-medium text-slate-500 whitespace-nowrap">Filtrar Funil:</span>
                    <div className="bg-slate-100 p-1 rounded-xl flex gap-1">
                        <button
                            onClick={() => setStatusFilter('todos')}
                            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${statusFilter === 'todos' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                        >
                            Todos
                        </button>
                        <button
                            onClick={() => setStatusFilter('recebido')}
                            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${statusFilter === 'recebido' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                        >
                            Recebidos
                        </button>
                        <button
                            onClick={() => setStatusFilter('pendente')}
                            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${statusFilter === 'pendente' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                        >
                            Pendentes
                        </button>
                    </div>
                </div>
            </div>

            {/* Lista ou Estado Vazio */}
            {filteredOrders.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-sm">
                    <div className="max-w-sm mx-auto space-y-3">
                        <ClipboardList className="w-12 h-12 text-slate-300 mx-auto" />
                        <p className="text-sm font-medium text-slate-500">
                            Nenhum registro de cota encontrado com esses filtros.
                        </p>
                    </div>
                </div>
            ) : (
                <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                    <th className="p-4">Convidado</th>
                                    <th className="p-4">Presente / Cota</th>
                                    <th className="p-4 text-center">Qtd. Cotas</th>
                                    <th className="p-4">Valor Total</th>
                                    <th className="p-4">Status</th>
                                    <th className="p-4 text-center">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                                {filteredOrders.map((order) => (
                                    <tr key={order._id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="p-4">
                                            <div className="font-semibold text-slate-900">{order.guestName}</div>
                                            <div className="text-xs text-slate-400">{order.guestPhone}</div>
                                        </td>
                                        <td className="p-4 font-medium text-slate-800">{order.giftName}</td>
                                        <td className="p-4 text-center font-bold text-slate-600">{order.quantity}</td>
                                        <td className="p-4 font-semibold text-slate-900">R$ {order.totalValue.toFixed(2)}</td>
                                        <td className="p-4">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${order.status === 'recebido' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                                                {order.status === 'recebido' ? 'Recebido' : 'Pendente'}
                                            </span>
                                        </td>
                                        <td className="p-4 text-center">
                                            <button
                                                onClick={() => onUpdateOrderStatus(
                                                    order._id,
                                                    order.giftId,
                                                    order.status === 'recebido' ? 'pendente' : 'recebido'
                                                )}
                                                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${order.status === 'recebido' ? 'bg-white border-amber-200 text-amber-700 hover:bg-amber-50' : 'bg-emerald-600 border-emerald-600 text-white hover:bg-emerald-700 shadow-sm'}`}
                                            >
                                                {order.status === 'recebido' ? 'Marcar como Pendente' : 'Aprovar Recebimento'}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
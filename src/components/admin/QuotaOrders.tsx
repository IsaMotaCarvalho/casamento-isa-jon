'use client';

import React from 'react';
import { DollarSign, ClipboardList } from 'lucide-react';

interface QuotaOrdersProps {
    gifts: any[];
}

export default function QuotaOrders({ gifts }: QuotaOrdersProps) {
    // Une as reservas de todos os presentes em um único array plano para exibição gerencial
    const allOrders = gifts.flatMap(gift => {
        const quotaPrice = gift.totalPrice / gift.totalQuotas;
        const reservations = gift.reservations || [];

        return reservations.map((res: any) => ({
            id: res._id || Math.random().toString(),
            guestName: res.guestName || 'Convidado Anônimo',
            giftName: gift.name,
            quantity: res.quantity,
            quotaValue: quotaPrice,
            totalValue: quotaPrice * res.quantity,
            date: res.createdAt ? new Date(res.createdAt).toLocaleDateString('pt-BR') : 'Pendente'
        }));
    });

    const totalRevenue = allOrders.reduce((acc, curr) => acc + curr.totalValue, 0);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-slate-800">Relatório de Cotas Escolhidas</h1>
                <div className="bg-emerald-50 border border-emerald-200 px-4 py-2 rounded-xl flex items-center gap-2">
                    <DollarSign className="text-emerald-600" size={20} />
                    <span className="text-sm text-emerald-800 font-medium">Total Intencionado: <strong>R$ {totalRevenue.toFixed(2)}</strong></span>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                {allOrders.length === 0 ? (
                    <div className="p-8 text-center text-slate-500 flex flex-col items-center justify-center gap-2">
                        <ClipboardList size={36} className="text-slate-300" />
                        <p className="italic text-sm">Nenhuma cota foi selecionada pelos convidados até o momento.</p>
                    </div>
                ) : (
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-100 text-slate-600 text-sm font-semibold">
                                <th className="p-4">Convidado</th>
                                <th className="p-4">Presente Escolhido</th>
                                <th className="p-4 text-center">Quantidade</th>
                                <th className="p-4">Valor Unitário</th>
                                <th className="p-4">Valor Total</th>
                                <th className="p-4">Data Escolha</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-700">
                            {allOrders.map((order, index) => (
                                <tr key={order.id + index} className="hover:bg-slate-50">
                                    <td className="p-4 font-semibold text-slate-800">{order.guestName}</td>
                                    <td className="p-4 text-slate-600">{order.giftName}</td>
                                    <td className="p-4 text-center font-bold text-indigo-600">{order.quantity}x</td>
                                    <td className="p-4 text-slate-500">R$ {order.quotaValue.toFixed(2)}</td>
                                    <td className="p-4 font-bold text-emerald-600">R$ {order.totalValue.toFixed(2)}</td>
                                    <td className="p-4 text-xs text-slate-400">{order.date}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
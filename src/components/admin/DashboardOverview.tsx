'use client';

import React from 'react';
import { Users, CheckCircle, Clock, Gift, MessageSquare } from 'lucide-react';

interface DashboardOverviewProps {
    guests: any[];
    gifts: any[];
    totalQuotasMarked: number;
}

export default function DashboardOverview({ guests, gifts, totalQuotasMarked }: DashboardOverviewProps) {
    const confirmedCount = guests.filter(g => g.confirmed).length;
    const pendingCount = guests.length - confirmedCount;

    return (
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
                    {guests.filter(g => g.message).length === 0 && (
                        <p className="text-sm text-slate-400 py-2 italic">Nenhuma mensagem enviada ainda.</p>
                    )}
                </div>
            </div>
        </div>
    );
}
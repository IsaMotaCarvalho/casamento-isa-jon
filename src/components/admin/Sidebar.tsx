'use client';

import React from 'react';
import { LayoutDashboard, Users, Gift, DollarSign } from 'lucide-react';

interface SidebarProps {
    activeTab: 'dash' | 'guests' | 'gifts' | 'orders';
    setActiveTab: (tab: 'dash' | 'guests' | 'gifts' | 'orders') => void;
}

export default function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
    return (
        <aside className="w-64 bg-slate-900 text-white p-6 flex flex-col gap-8 shrink-0 min-h-screen">
            <h2 className="text-xl font-bold tracking-wider text-amber-400">💍 Noivos CRM</h2>
            <nav className="flex flex-col gap-2">
                <button onClick={() => setActiveTab('dash')} className={`flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${activeTab === 'dash' ? 'bg-amber-500 text-slate-900 font-semibold' : 'hover:bg-slate-800'}`}>
                    <LayoutDashboard size={20} /> Dashboard
                </button>
                <button onClick={() => setActiveTab('guests')} className={`flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${activeTab === 'guests' ? 'bg-amber-500 text-slate-900 font-semibold' : 'hover:bg-slate-800'}`}>
                    <Users size={20} /> Gestão de Convidados
                </button>
                <button onClick={() => setActiveTab('gifts')} className={`flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${activeTab === 'gifts' ? 'bg-amber-500 text-slate-900 font-semibold' : 'hover:bg-slate-800'}`}>
                    <Gift size={20} /> Gestão de Presentes
                </button>
                <button onClick={() => setActiveTab('orders')} className={`flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${activeTab === 'orders' ? 'bg-amber-500 text-slate-900 font-semibold' : 'hover:bg-slate-800'}`}>
                    <DollarSign size={20} /> Cotas Recebidas
                </button>
            </nav>
        </aside>
    );
}
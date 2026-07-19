'use client';

import React from 'react';
import { LayoutDashboard, Users, Gift, DollarSign, X } from 'lucide-react';

interface SidebarProps {
    activeTab: 'dash' | 'guests' | 'gifts' | 'orders';
    setActiveTab: (tab: 'dash' | 'guests' | 'gifts' | 'orders') => void;
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
}

export default function Sidebar({ activeTab, setActiveTab, isOpen, setIsOpen }: SidebarProps) {
    return (
        <>
            {/* Backdrop escuro de fundo (apenas para Mobile) */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm z-40 md:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Menu Lateral Responsivo */}
            <aside className={`fixed md:relative z-50 md:z-auto inset-y-0 left-0 w-64 bg-slate-900 text-white p-6 flex flex-col gap-8 shrink-0 min-h-screen transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform duration-300 ease-in-out`}>
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold tracking-wider text-amber-400">💍 Noivos CRM</h2>
                    {/* Botão fechar (apenas visível em mobile) */}
                    <button
                        onClick={() => setIsOpen(false)}
                        className="text-white hover:text-amber-400 md:hidden p-1 rounded-lg transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <nav className="flex flex-col gap-2">
                    <button
                        onClick={() => { setActiveTab('dash'); setIsOpen(false); }}
                        className={`flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${activeTab === 'dash' ? 'bg-amber-500 text-slate-900 font-semibold shadow-md' : 'hover:bg-slate-800'}`}
                    >
                        <LayoutDashboard size={20} /> Dashboard
                    </button>
                    <button
                        onClick={() => { setActiveTab('guests'); setIsOpen(false); }}
                        className={`flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${activeTab === 'guests' ? 'bg-amber-500 text-slate-900 font-semibold shadow-md' : 'hover:bg-slate-800'}`}
                    >
                        <Users size={20} /> Gestão de Convidados
                    </button>
                    <button
                        onClick={() => { setActiveTab('gifts'); setIsOpen(false); }}
                        className={`flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${activeTab === 'gifts' ? 'bg-amber-500 text-slate-900 font-semibold shadow-md' : 'hover:bg-slate-800'}`}
                    >
                        <Gift size={20} /> Gestão de Presentes
                    </button>
                    <button
                        onClick={() => { setActiveTab('orders'); setIsOpen(false); }}
                        className={`flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${activeTab === 'orders' ? 'bg-amber-500 text-slate-900 font-semibold shadow-md' : 'hover:bg-slate-800'}`}
                    >
                        <DollarSign size={20} /> Cotas Recebidas
                    </button>
                </nav>
            </aside>
        </>
    );
}
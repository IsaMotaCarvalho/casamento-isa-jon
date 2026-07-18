'use client';

import React from 'react';

interface HeroHeaderProps {
    rsvpName: string;
    isLoadingGuest: boolean;
}

export default function HeroHeader({ rsvpName, isLoadingGuest }: HeroHeaderProps) {
    return (
        <header className="relative h-[75vh] flex flex-col items-center justify-center text-center px-4 overflow-hidden">
            {/* Imagem de Fundo Fina e Discreta de Casamento */}
            <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-105 transition-transform duration-1000"
                style={{
                    backgroundImage: `url('https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1920&auto=format&fit=crop')`
                }}
            />
            {/* Overlay sutil para dar o tom stone-50 e suavizar o contraste da foto */}
            <div className="absolute inset-0 bg-stone-100/80 backdrop-blur-[1px]" />

            {/* Conteúdo Principal */}
            <div className="relative z-10 space-y-4 max-w-xl">
                <span className="text-sm font-semibold tracking-widest text-amber-800 uppercase bg-white/60 px-4 py-1.5 rounded-full backdrop-blur-sm inline-block shadow-sm">
                    {rsvpName && !isLoadingGuest ? `Olá, ${rsvpName}! Convidamos Você Para Nosso Casamento` : 'Convidamos Você Para Nosso Casamento'}
                </span>
                <h1 className="text-5xl md:text-7xl font-serif text-stone-900 my-2 italic drop-shadow-sm font-bold">
                    Isabella & Jonathan
                </h1>
                <p className="text-stone-700 font-medium tracking-wide">"O amor é paciente, o amor é bondoso..."</p>
                <div className="inline-block bg-white/90 backdrop-blur-sm border border-stone-200 px-6 py-3 rounded-full shadow-md text-sm font-semibold text-stone-800 mt-6">
                    18 de Julho de 2026 • 17:00h
                </div>
            </div>
        </header>
    );
}
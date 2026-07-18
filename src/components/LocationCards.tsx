'use client';

import React from 'react';
import { Heart, Calendar, MapPin } from 'lucide-react';

export default function LocationCards() {
    return (
        <section className="max-w-4xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Religioso */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-stone-100 flex flex-col gap-4 text-center items-center hover:shadow-md transition-shadow">
                <div className="p-3 bg-amber-50 rounded-full text-amber-700"><Heart size={24} /></div>
                <h3 className="text-xl font-bold font-serif text-stone-900">Cerimônia Religiosa</h3>
                <p className="text-stone-600 text-sm leading-relaxed">
                    Igreja do Evangelho Quadrangular<br />
                    Rua Minas Gerais, 14-50 - Jd. Campo Grande<br />
                    Presidente Epitácio - SP
                </p>
                <a
                    href="https://maps.app.goo.gl/DGABhkJE1xNufLD26"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-bold text-amber-700 underline tracking-wider uppercase flex items-center gap-1 mt-2 hover:text-amber-600 transition-colors"
                >
                    <MapPin size={14} /> Ver no Mapa
                </a>
            </div>

            {/* Recepção */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-stone-100 flex flex-col gap-4 text-center items-center hover:shadow-md transition-shadow">
                <div className="p-3 bg-amber-50 rounded-full text-amber-700"><Calendar size={24} /></div>
                <h3 className="text-xl font-bold font-serif text-stone-900">Recepção / Festa</h3>
                <p className="text-stone-600 text-sm leading-relaxed">
                    Espaço Planet Kids<br />
                    Av. Pres. Vargas, 2707<br />
                    Presidente Epitácio - SP
                </p>
                <a
                    href="https://maps.app.goo.gl/RiEN3Umf89XqdvmM7"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-bold text-amber-700 underline tracking-wider uppercase flex items-center gap-1 mt-2 hover:text-amber-600 transition-colors"
                >
                    <MapPin size={14} /> Ver no Mapa
                </a>
            </div>
        </section>
    );
}
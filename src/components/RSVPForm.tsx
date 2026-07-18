'use client';

import React from 'react';
import { CheckCircle2 } from 'lucide-react';

interface RSVPFormProps {
    rsvpName: string;
    setRsvpName: (v: string) => void;
    rsvpPhone: string;
    setRsvpPhone: (v: string) => void;
    rsvpSide: 'noivo' | 'noiva';
    setRsvpSide: (v: 'noivo' | 'noiva') => void;
    rsvpMessage: string;
    setRsvpMessage: (v: string) => void;
    rsvpSuccess: boolean;
    isLoadingGuest: boolean;
    onSubmit: (e: React.FormEvent) => void;
}

export default function RSVPForm({
    rsvpName, setRsvpName,
    rsvpPhone, setRsvpPhone,
    rsvpSide, setRsvpSide,
    rsvpMessage, setRsvpMessage,
    rsvpSuccess, isLoadingGuest,
    onSubmit
}: RSVPFormProps) {
    return (
        <section className="bg-stone-900 text-white py-16 px-6">
            <div className="max-w-md mx-auto">
                <div className="text-center space-y-2 mb-8">
                    <h2 className="text-3xl font-serif italic text-amber-400">Confirmar Presença</h2>
                    <p className="text-stone-400 text-sm">Por favor, confirme sua presença até o dia 30/06/2026.</p>
                </div>

                {rsvpSuccess ? (
                    <div className="bg-stone-800 p-6 rounded-xl text-center space-y-3 border border-amber-500/30">
                        <CheckCircle2 className="text-amber-400 mx-auto" size={40} />
                        <p className="text-lg font-medium">Sua presença foi confirmada!</p>
                        <p className="text-sm text-stone-400">Obrigado por compartilhar este momento tão especial conosco.</p>
                    </div>
                ) : (
                    <form onSubmit={onSubmit} className="space-y-4">
                        <div>
                            <input
                                type="text"
                                placeholder="Seu Nome Completo"
                                required
                                value={rsvpName}
                                onChange={e => setRsvpName(e.target.value)}
                                className="w-full p-3 bg-stone-800 border border-stone-700 rounded-lg text-white focus:outline-none focus:border-amber-400 text-sm disabled:opacity-60"
                                disabled={isLoadingGuest}
                            />
                        </div>
                        <div>
                            <input
                                type="text"
                                placeholder="Seu Telefone / WhatsApp"
                                required
                                value={rsvpPhone}
                                onChange={e => setRsvpPhone(e.target.value)}
                                className="w-full p-3 bg-stone-800 border border-stone-700 rounded-lg text-white focus:outline-none focus:border-amber-400 text-sm"
                            />
                        </div>
                        <div>
                            <select
                                value={rsvpSide}
                                onChange={e => setRsvpSide(e.target.value as any)}
                                className="w-full p-3 bg-stone-800 border border-stone-700 rounded-lg text-white focus:outline-none focus:border-amber-400 text-sm"
                            >
                                <option value="noivo">Convidado do Noivo</option>
                                <option value="noiva">Convidado da Nova</option>
                            </select>
                        </div>
                        <div>
                            <textarea
                                rows={3}
                                placeholder="Deixe uma mensagem carinhosa aos noivos (opcional)"
                                value={rsvpMessage}
                                onChange={e => setRsvpMessage(e.target.value)}
                                className="w-full p-3 bg-stone-800 border border-stone-700 rounded-lg text-white focus:outline-none focus:border-amber-400 text-sm"
                            ></textarea>
                        </div>
                        <button
                            type="submit"
                            className="w-full py-3 bg-amber-500 text-stone-950 font-bold rounded-lg hover:bg-amber-400 transition-colors text-sm tracking-wider uppercase shadow-md disabled:opacity-50"
                            disabled={isLoadingGuest}
                        >
                            {isLoadingGuest ? 'Carregando Dados...' : 'Confirmar Presença Presencial'}
                        </button>
                    </form>
                )}
            </div>
        </section>
    );
}
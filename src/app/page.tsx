'use client';

import { useState, useEffect } from 'react';
import { Calendar, MapPin, Heart, CheckCircle2 } from 'lucide-react';

export default function GuestPage() {
    const [gifts, setGifts] = useState<any[]>([]);
    const [selectedGift, setSelectedGift] = useState<any>(null);
    const [isPixModalOpen, setIsPixModalOpen] = useState(false);
    const [guestId, setGuestId] = useState<string | null>(null);

    // Estados de confirmação
    const [rsvpName, setRsvpName] = useState('');
    const [rsvpPhone, setRsvpPhone] = useState('');
    const [rsvpSide, setRsvpSide] = useState<'noivo' | 'noiva'>('noivo');
    const [rsvpMessage, setRsvpMessage] = useState('');
    const [rsvpSuccess, setRsvpSuccess] = useState(false);
    const [isLoadingGuest, setIsLoadingGuest] = useState(false);

    useEffect(() => {
        // 1. Busca a lista de presentes
        fetch('/api/gifts')
            .then(res => res.json())
            .then(data => setGifts(data))
            .catch(err => console.error('Erro ao buscar presentes:', err));

        // 2. Captura a hash/ID da URL de forma segura no lado do cliente
        const params = new URLSearchParams(window.location.search);
        const id = params.get('id');

        if (id) {
            setGuestId(id);
            setIsLoadingGuest(true);

            // Busca os dados do convidado específico usando a rota de API existente
            fetch(`/api/guests?id=${id}`)
                .then(res => res.json())
                .then(data => {
                    if (data && !data.error) {
                        setRsvpName(data.name || '');
                        setRsvpPhone(data.phone || '');
                        setRsvpSide(data.side || 'noivo');
                        setRsvpMessage(data.message || '');
                        // Se o convidado já tiver confirmado antes, você pode optar por setar o rsvpSuccess como true
                        if (data.confirmed) {
                            setRsvpSuccess(true);
                        }
                    }
                })
                .catch(err => console.error('Erro ao buscar dados do convidado:', err))
                .finally(() => setIsLoadingGuest(false));
        }
    }, []);

    const handleRSVP = async (e: React.FormEvent) => {
        e.preventDefault();

        // Se houver guestId, enviamos ele no corpo para atualizar o registro existente em vez de duplicar
        await fetch('/api/guests', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id: guestId, // Enviando o ID para a API identificar se é atualização
                name: rsvpName,
                phone: rsvpPhone,
                side: rsvpSide,
                message: rsvpMessage,
                confirmed: true
            })
        });
        setRsvpSuccess(true);
    };

    const handleSelectGiftQuota = async (gift: any) => {
        setSelectedGift(gift);
        setIsPixModalOpen(true);

        // Incrementar a cota escolhida no Banco
        await fetch('/api/gifts', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id: gift._id,
                claimedQuotas: gift.claimedQuotas + 1
            })
        });

        // Atualiza interface local
        fetch('/api/gifts').then(res => res.json()).then(data => setGifts(data));
    };

    return (
        <div className="min-h-screen bg-stone-50 text-stone-800 font-sans selection:bg-amber-100">

            {/* Hero Header */}
            <header className="relative h-[70vh] flex flex-col items-center justify-center text-center bg-gradient-to-b from-stone-200 to-stone-50 px-4">
                <div className="space-y-4 max-w-xl">
                    <span className="text-sm font-semibold tracking-widest text-amber-700 uppercase">
                        {rsvpName && !isLoadingGuest ? `Olá, ${rsvpName}! Convidamos Você Para Nosso Casamento` : 'Convidamos Você Para Nosso Casamento'}
                    </span>
                    <h1 className="text-5xl md:text-7xl font-serif text-stone-900 my-2 italic">Isabella & Jonathan</h1>
                    <p className="text-stone-600 font-medium tracking-wide">"O amor é paciente, o amor é bondoso..."</p>
                    <div className="inline-block bg-white/80 backdrop-blur-sm border border-stone-200 px-6 py-3 rounded-full shadow-sm text-sm font-semibold text-stone-700 mt-6">
                        18 de Julho de 2026 • 17:00h
                    </div>
                </div>
            </header>

            {/* Seção de Locais e Mapas */}
            <section className="max-w-4xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-stone-100 flex flex-col gap-4 text-center items-center">
                    <div className="p-3 bg-amber-50 rounded-full text-amber-700"><Heart size={24} /></div>
                    <h3 className="text-xl font-bold font-serif text-stone-900">Cerimônia Religiosa</h3>
                    <p className="text-stone-600 text-sm">Igreja Matriz de Presidente Epitácio<br />Av. Presidente Vargas, Centro</p>
                    <a href="https://maps.google.com" target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-amber-700 underline tracking-wider uppercase flex items-center gap-1 mt-2">
                        <MapPin size={14} /> Ver no Mapa
                    </a>
                </div>
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-stone-100 flex flex-col gap-4 text-center items-center">
                    <div className="p-3 bg-amber-50 rounded-full text-amber-700"><Calendar size={24} /></div>
                    <h3 className="text-xl font-bold font-serif text-stone-900">Recepção / Festa</h3>
                    <p className="text-stone-600 text-sm">Espaço Prime Eventos<br />Orla da Cidade, Beira Rio</p>
                    <a href="https://maps.google.com" target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-amber-700 underline tracking-wider uppercase flex items-center gap-1 mt-2">
                        <MapPin size={14} /> Ver no Mapa
                    </a>
                </div>
            </section>

            {/* Confirmação de Presença (RSVP) */}
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
                        <form onSubmit={handleRSVP} className="space-y-4">
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
                                    <option value="noiva">Convidado da Noiva</option>
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

            {/* Lista de Presentes */}
            <section className="max-w-5xl mx-auto px-6 py-20">
                <div className="text-center max-w-xl mx-auto space-y-3 mb-12">
                    <h2 className="text-3xl font-serif italic text-stone-900">Lista de Presentes por Cota</h2>
                    <p className="text-stone-600 text-sm">Criamos um modelo prático de cotas onde você pode nos presentear de forma direta, contribuindo para a nossa lua de mel e montagem do nosso novo lar.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {gifts.map((gift) => {
                        const quotaValue = gift.totalPrice / gift.totalQuotas;
                        const isSoldOut = gift.claimedQuotas >= gift.totalQuotas;

                        return (
                            <div key={gift._id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-stone-200 flex flex-col justify-between">
                                <div className="p-6 space-y-4">
                                    <h4 className="text-lg font-bold text-stone-900">{gift.name}</h4>
                                    <div className="flex justify-between items-baseline">
                                        <span className="text-xs text-stone-500 uppercase tracking-wider font-semibold">Valor da Cota:</span>
                                        <span className="text-2xl font-serif font-bold text-amber-800">R$ {quotaValue.toFixed(2)}</span>
                                    </div>
                                </div>

                                <div className="px-6 pb-6">
                                    {isSoldOut ? (
                                        <div className="w-full text-center py-2 bg-stone-100 text-stone-500 font-semibold rounded-lg text-sm">
                                            Todas as cotas preenchidas! ❤️
                                        </div>
                                    ) : (
                                        <button onClick={() => handleSelectGiftQuota(gift)} className="w-full py-2.5 bg-stone-900 text-white font-medium rounded-lg text-sm hover:bg-stone-800 transition-colors">
                                            Presentear com 1 Cota
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* Modal PIX */}
            {isPixModalOpen && selectedGift && (
                <div className="fixed inset-0 bg-stone-950/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white max-w-sm w-full rounded-2xl p-6 shadow-xl space-y-6 text-center relative border border-stone-100 animate-in fade-in zoom-in-95 duration-150">
                        <div>
                            <h3 className="text-xl font-serif font-bold text-stone-900">Muito obrigado!</h3>
                            <p className="text-stone-600 text-sm mt-1">Você escolheu presentear com uma cota de: <strong>{selectedGift.name}</strong></p>
                        </div>

                        <div className="bg-amber-50 p-4 rounded-xl flex flex-col items-center gap-2">
                            <span className="text-xs font-bold text-amber-800 uppercase tracking-widest">Valor da Transferência</span>
                            <span className="text-3xl font-serif font-bold text-amber-900">R$ {(selectedGift.totalPrice / selectedGift.totalQuotas).toFixed(2)}</span>
                        </div>

                        <div className="space-y-2">
                            <p className="text-xs text-stone-500 font-semibold uppercase tracking-wider">Chave PIX dos Noivos (Copia e Cola)</p>
                            <div className="bg-stone-50 p-3 rounded-lg text-xs font-mono select-all border border-stone-200 text-stone-700 break-all">
                                {process.env.NEXT_PUBLIC_PIX_KEY}
                            </div>
                            <p className="text-[11px] text-stone-400">Abra o aplicativo do seu banco, escolha transferir por PIX e cole a chave numérica acima.</p>
                        </div>

                        <button onClick={() => setIsPixModalOpen(false)} className="w-full py-2.5 bg-stone-900 text-white font-semibold rounded-lg text-sm hover:bg-stone-800 transition-colors">
                            Concluí o Pagamento / Fechar
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
'use client';

import { useState, useEffect } from 'react';
import { Gift, QrCode, AlertCircle, CheckCircle, X, CheckSquare, Square } from 'lucide-react';
import HeroHeader from '@/src/components/HeroHeader';
import LocationCards from '@/src/components/LocationCards';
import GiftList from '@/src/components/GiftList';
import PixModal from '@/src/components/PixModal';

export default function GuestPage() {
    const [gifts, setGifts] = useState<any[]>([]);
    const [isPixModalOpen, setIsPixModalOpen] = useState(false);
    const [guestId, setGuestId] = useState<string | null>(null);

    const [giftListKey, setGiftListKey] = useState(0);
    const [pendingCartItems, setPendingCartItems] = useState<any[] | null>(null);
    const [activeCartSummary, setActiveCartSummary] = useState<{ items: any[]; totalValue: number } | null>(null);

    // Estados de Controle da Família e RSVP
    const [familyName, setFamilyName] = useState('');
    const [familyPhone, setFamilyPhone] = useState('');
    const [familySide, setFamilySide] = useState<'noivo' | 'noiva'>('noivo');
    const [familyMembers, setFamilyMembers] = useState<any[]>([]);
    const [rsvpMessage, setRsvpMessage] = useState('');
    const [rsvpSuccess, setRsvpSuccess] = useState(false);
    const [isLoadingGuest, setIsLoadingGuest] = useState(false);
    const [isSavingRsvp, setIsSavingRsvp] = useState(false);

    useEffect(() => {
        fetch('/api/gifts')
            .then(res => res.json())
            .then(data => setGifts(data))
            .catch(err => console.error('Erro ao buscar presentes:', err));

        const savedCart = localStorage.getItem('casamento_multicotas_cart');
        if (savedCart) {
            try {
                setActiveCartSummary(JSON.parse(savedCart));
            } catch (e) {
                console.error('Erro ao ler carrinho local:', e);
            }
        }

        const params = new URLSearchParams(window.location.search);
        const id = params.get('id');

        if (id) {
            setGuestId(id);
            setIsLoadingGuest(true);

            fetch(`/api/guests?id=${id}`)
                .then(res => res.json())
                .then(async (data) => {
                    if (data && !data.error) {
                        setFamilyName(data.name || '');
                        setFamilyPhone(data.phone || '');
                        setFamilySide(data.side || 'noivo');
                        setFamilyMembers(data.members || []);
                        setRsvpMessage(data.message || '');

                        if (data.members?.length > 0 && data.members.every((m: any) => m.confirmed)) {
                            setRsvpSuccess(true);
                        }

                        try {
                            const resOrders = await fetch('/api/orders');
                            const allOrders = await resOrders.json();
                            const activeOrders = allOrders.filter((o: any) => o.guestPhone === data.phone);

                            if (activeOrders.length === 0) {
                                localStorage.removeItem('casamento_multicotas_cart');
                                setActiveCartSummary(null);
                            } else {
                                const grandTotal = activeOrders.reduce((acc: number, curr: any) => acc + curr.totalValue, 0);
                                const structuredItems = activeOrders.map((o: any) => ({
                                    giftId: o.giftId,
                                    name: o.giftName,
                                    quantity: o.quantity,
                                    quotaValue: o.quotaValue,
                                    totalItemPrice: o.totalValue
                                }));

                                const structureSummary = { items: structuredItems, totalValue: grandTotal };
                                setActiveCartSummary(structureSummary);
                                localStorage.setItem('casamento_multicotas_cart', JSON.stringify(structureSummary));
                            }
                        } catch (orderErr) {
                            console.error('Erro ao validar integridade das cotas com o banco:', orderErr);
                        }
                    }
                })
                .catch(err => console.error('Erro ao buscar dados do convidado:', err))
                .finally(() => setIsLoadingGuest(false));
        }
    }, []);

    const toggleLocalMemberConfirmation = (memberId: string) => {
        setFamilyMembers(prev => prev.map(m =>
            m._id === memberId ? { ...m, confirmed: !m.confirmed } : m
        ));
    };

    const handleFamilyRSVP = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSavingRsvp(true);
        setRsvpSuccess(false);

        try {
            await fetch('/api/guests', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: guestId,
                    members: familyMembers,
                    message: rsvpMessage
                })
            });
            setRsvpSuccess(true);
        } catch (err) {
            console.error('Erro ao salvar presença da família:', err);
        } finally {
            setIsSavingRsvp(false);
        }
    };

    const handleReviewSelections = (selectedCart: any[]) => {
        setPendingCartItems(selectedCart);
    };

    const handleConfirmAllQuotas = async () => {
        if (!pendingCartItems || pendingCartItems.length === 0) return;

        const grandTotal = pendingCartItems.reduce((acc, curr) => acc + curr.totalItemPrice, 0);
        const structureSummary = { items: pendingCartItems, totalValue: grandTotal };

        setActiveCartSummary(structureSummary);
        localStorage.setItem('casamento_multicotas_cart', JSON.stringify(structureSummary));

        const orderPromises = pendingCartItems.map(item =>
            fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    guestName: familyName || 'Família Concretizada',
                    guestPhone: familyPhone || '',
                    giftId: item.giftId,
                    giftName: item.name,
                    quantity: item.quantity,
                    quotaValue: item.quotaValue,
                    totalValue: item.totalItemPrice
                })
            })
        );

        await Promise.all(orderPromises);
        setGiftListKey(prev => prev + 1);
        setPendingCartItems(null);
        setIsPixModalOpen(true);

        fetch('/api/gifts').then(res => res.json()).then(data => setGifts(data));
    };

    const handleClearCart = () => {
        localStorage.removeItem('casamento_multicotas_cart');
        setActiveCartSummary(null);
        setGiftListKey(prev => prev + 1);
    };

    return (
        <div className="min-h-screen bg-stone-50 text-stone-800 font-sans selection:bg-amber-100 relative pt-12">

            {/* Lembrete Fixo Superior para Carrinho Ativo */}
            {activeCartSummary && (
                <div className="fixed top-0 inset-x-0 bg-stone-900 text-stone-100 px-4 py-2.5 text-xs md:text-sm z-50 shadow-md border-b border-amber-500/20 flex items-center justify-between animate-in slide-in-from-top duration-300">
                    <div className="flex items-center gap-2 max-w-[70%]">
                        <Gift className="text-amber-400 shrink-0" size={16} />
                        <p className="truncate">
                            Você escolheu presentear com <span className="font-semibold text-amber-400">{activeCartSummary.items.length} presente(s)</span> no valor total de <span className="font-bold text-amber-400">R$ {activeCartSummary.totalValue.toFixed(2)}</span>.
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setIsPixModalOpen(true)}
                            className="bg-amber-500 hover:bg-amber-400 text-stone-950 px-3 py-1 rounded-full font-bold text-[11px] uppercase tracking-wider flex items-center gap-1 transition-colors"
                        >
                            <QrCode size={12} /> Ver PIX
                        </button>
                        <button onClick={handleClearCart} className="text-stone-400 hover:text-stone-200 text-[11px] underline">
                            Remover
                        </button>
                    </div>
                </div>
            )}

            {/* BANNER COM A IMAGEM DE FUNDO LIMPA E INTEGRADA */}
            <div className="relative bg-[url('/fundoCasamentoIsa.jpeg')] bg-cover bg-center min-h-[45vh] md:min-h-[50vh] flex items-center justify-center border-b border-stone-200 overflow-hidden shadow-md">
                {/* Película protetora clara: suaviza a foto de fundo para destacar as letras sem escondê-la */}
                <div className="absolute inset-0 bg-white/40 backdrop-blur-[1px]" />

                {/* Conteúdo limpo do cabeçalho */}
                <div className="relative z-10 w-full wrapper">
                    <HeroHeader rsvpName={familyName} isLoadingGuest={isLoadingGuest} />
                </div>
            </div>

            <LocationCards />

            {/* SEÇÃO CUSTOMIZADA DE RSVP E GERENCIAMENTO DOS MEMBROS DA FAMÍLIA */}
            <section className="max-w-2xl mx-auto my-12 px-4">
                <div className="bg-white rounded-2xl p-6 shadow-md border border-stone-100 space-y-6">
                    <div className="text-center space-y-1">
                        <h2 className="text-2xl font-serif font-bold text-stone-900">Confirmação de Presença</h2>
                        <p className="text-sm text-stone-500">Selecione individualmente a presença de cada membro abaixo</p>
                    </div>

                    {isLoadingGuest ? (
                        <div className="text-center py-6 text-stone-400 italic">Buscando convite da família...</div>
                    ) : (
                        <form onSubmit={handleFamilyRSVP} className="space-y-6">
                            <div className="space-y-3 bg-stone-50 p-4 rounded-xl border border-stone-200/60">
                                <label className="block text-xs font-bold uppercase tracking-wider text-stone-500">Membros da {familyName}</label>

                                <div className="divide-y divide-stone-200/60">
                                    {familyMembers.map((member) => (
                                        <div
                                            key={member._id}
                                            onClick={() => !isSavingRsvp && toggleLocalMemberConfirmation(member._id)}
                                            className={`py-3 flex items-center justify-between group select-none ${isSavingRsvp ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}
                                        >
                                            <span className="font-medium text-stone-800 group-hover:text-stone-950 text-sm transition-colors">{member.name}</span>
                                            <div className="flex items-center gap-2">
                                                <span className={`text-xs font-semibold ${member.confirmed ? 'text-emerald-600' : 'text-stone-400'}`}>
                                                    {member.confirmed ? 'Confirmado' : 'Confirmar Presença👉'}
                                                </span>
                                                {member.confirmed ? (
                                                    <CheckSquare size={20} className="text-emerald-600 shrink-0" />
                                                ) : (
                                                    <Square size={20} className="text-stone-300 shrink-0 group-hover:text-stone-400" />
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1">Deixe uma mensagem para os noivos (Opcional)</label>
                                <textarea
                                    value={rsvpMessage}
                                    disabled={isSavingRsvp}
                                    onChange={e => setRsvpMessage(e.target.value)}
                                    rows={3}
                                    placeholder="Escreva aqui seus votos ou carinho aos noivos..."
                                    className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-stone-800 disabled:opacity-60"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isSavingRsvp}
                                className={`w-full font-bold py-3 rounded-xl shadow transition-all text-xs uppercase tracking-widest flex items-center justify-center gap-2 ${isSavingRsvp
                                        ? 'bg-stone-400 text-stone-200 cursor-not-allowed'
                                        : 'bg-stone-900 hover:bg-stone-800 text-white cursor-pointer'
                                    }`}
                            >
                                {isSavingRsvp ? (
                                    <>
                                        <span className="animate-spin rounded-full h-3 w-3 border-2 border-stone-200 border-t-transparent" />
                                        Salvando Status...
                                    </>
                                ) : (
                                    'Salvar Status da Família'
                                )}
                            </button>

                            {rsvpSuccess && (
                                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl p-3 flex items-center gap-2 text-sm justify-center animate-in fade-in zoom-in-95 duration-200">
                                    <CheckCircle size={18} className="text-emerald-600" />
                                    <span>Presenças e alterações atualizadas com sucesso! Obrigado!</span>
                                </div>
                            )}
                        </form>
                    )}
                </div>
            </section>

            <GiftList
                key={giftListKey}
                gifts={gifts}
                onReviewSelections={handleReviewSelections}
            />

            {/* MODAL DE CONFIRMAÇÃO DO CARRINHO */}
            {pendingCartItems && (
                <div className="fixed inset-0 bg-stone-950/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                    <div className="bg-white max-w-md w-full rounded-2xl p-6 shadow-2xl space-y-6 border border-stone-100">
                        <div className="flex justify-between items-center pb-2 border-b border-stone-100">
                            <div className="flex items-center gap-2 text-stone-800 font-serif font-bold text-lg">
                                <AlertCircle size={20} className="text-amber-600" />
                                <h3>Confirmar suas Escolhas?</h3>
                            </div>
                            <button onClick={() => setPendingCartItems(null)} className="text-stone-400 hover:text-stone-600">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="space-y-3">
                            <p className="text-sm text-stone-600">
                                Você gostaria de confirmar a intenção de presentear os noivos com as seguintes cotas selecionadas?
                            </p>

                            <div className="bg-stone-50 rounded-xl p-4 border border-stone-200/60 divide-y divide-stone-200/40 max-h-48 overflow-y-auto">
                                {pendingCartItems.map((item, idx) => (
                                    <div key={item.giftId + idx} className="py-2 flex justify-between text-sm first:pt-0 last:pb-0">
                                        <div>
                                            <span className="font-semibold text-stone-900">{item.name}</span>
                                            <span className="text-xs text-stone-500 block">{item.quantity}x cota de R$ {item.quotaValue.toFixed(2)}</span>
                                        </div>
                                        <span className="font-medium text-stone-800 align-middle my-auto">
                                            R$ {item.totalItemPrice.toFixed(2)}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl flex justify-between items-center text-sm">
                                <span className="font-bold text-stone-800">Valor Total do Presente:</span>
                                <span className="text-base font-bold text-amber-900">
                                    R$ {pendingCartItems.reduce((acc, curr) => acc + curr.totalItemPrice, 0).toFixed(2)}
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => setPendingCartItems(null)}
                                className="w-full py-3 border border-stone-200 text-stone-600 font-medium rounded-xl text-xs hover:bg-stone-50 transition-colors uppercase tracking-wider"
                            >
                                Não, Voltar
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirmAllQuotas}
                                className="w-full py-3 bg-stone-900 hover:bg-stone-800 text-white font-bold rounded-xl text-xs transition-colors shadow-md uppercase tracking-wider flex items-center justify-center gap-2"
                            >
                                <CheckCircle size={16} /> Sim, Confirmar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <PixModal
                isOpen={isPixModalOpen}
                onClose={() => setIsPixModalOpen(false)}
                cartData={activeCartSummary}
                pixKey={process.env.NEXT_PUBLIC_PIX_KEY}
            />
        </div>
    );
}
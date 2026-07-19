'use client';

import { useState, useEffect } from 'react';
import { Gift, QrCode, AlertCircle, CheckCircle, X } from 'lucide-react';
import HeroHeader from '@/src/components/HeroHeader';
import LocationCards from '@/src/components/LocationCards';
import RSVPForm from '@/src/components/RSVPForm';
import GiftList from '@/src/components/GiftList';
import PixModal from '@/src/components/PixModal';

export default function GuestPage() {
    const [gifts, setGifts] = useState<any[]>([]);
    const [isPixModalOpen, setIsPixModalOpen] = useState(false);
    const [guestId, setGuestId] = useState<string | null>(null);

    // Estado que guarda a lista temporária de cotas para exibição no modal de confirmação (Sim/Não)
    const [pendingCartItems, setPendingCartItems] = useState<any[] | null>(null);

    // Estado definitivo salvo para o topo da página e reabertura do PIX
    const [activeCartSummary, setActiveCartSummary] = useState<{ items: any[]; totalValue: number } | null>(null);

    // Estados de confirmação do RSVP
    const [rsvpName, setRsvpName] = useState('');
    const [rsvpPhone, setRsvpPhone] = useState('');
    const [rsvpSide, setRsvpSide] = useState<'noivo' | 'noiva'>('noivo');
    const [rsvpMessage, setRsvpMessage] = useState('');
    const [rsvpSuccess, setRsvpSuccess] = useState(false);
    const [isLoadingGuest, setIsLoadingGuest] = useState(false);

    useEffect(() => {
        // Busca a lista de presentes atualizada do Banco de Dados
        fetch('/api/gifts')
            .then(res => res.json())
            .then(data => setGifts(data))
            .catch(err => console.error('Erro ao buscar presentes:', err));

        // Recupera o carrinho fixado caso o convidado já tenha gerado o PIX antes
        const savedCart = localStorage.getItem('casamento_multicotas_cart');
        if (savedCart) {
            try {
                setActiveCartSummary(JSON.parse(savedCart));
            } catch (e) {
                console.error('Erro ao ler carrinho local:', e);
            }
        }

        // Captura o ID único do link do WhatsApp
        const params = new URLSearchParams(window.location.search);
        const id = params.get('id');

        if (id) {
            setGuestId(id);
            setIsLoadingGuest(true);

            fetch(`/api/guests?id=${id}`)
                .then(res => res.json())
                .then(async (data) => {
                    if (data && !data.error) {
                        setRsvpName(data.name || '');
                        setRsvpPhone(data.phone || '');
                        setRsvpSide(data.side || 'noivo');
                        setRsvpMessage(data.message || '');
                        if (data.confirmed) setRsvpSuccess(true);

                        // =================================================================
                        // VALIDAÇÃO ANTI-FANTASMA: Crucial para quando o Convidado é Recriado
                        // =================================================================
                        try {
                            const resOrders = await fetch('/api/orders');
                            const allOrders = await resOrders.json();

                            // Filtra os pedidos reais que constam no banco para o fone do convidado
                            const activeOrders = allOrders.filter((o: any) => o.guestPhone === data.phone);

                            if (activeOrders.length === 0) {
                                // Se no banco de dados não há nenhum pedido, limpamos o cache local do navegador
                                localStorage.removeItem('casamento_multicotas_cart');
                                setActiveCartSummary(null);
                            } else {
                                // Se há pedidos válidos, remontamos o resumo para garantir sincronia com o banco
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

    const handleRSVP = async (e: React.FormEvent) => {
        e.preventDefault();
        await fetch('/api/guests', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id: guestId,
                name: rsvpName,
                phone: rsvpPhone,
                side: rsvpSide,
                message: rsvpMessage,
                confirmed: true
            })
        });
        setRsvpSuccess(true);
    };

    // Estágio 1: Usuário avançou na barra de resumo, abrimos a caixa de Confirmação Direta (Sim/Não)
    const handleReviewSelections = (selectedCart: any[]) => {
        setPendingCartItems(selectedCart);
    };

    // Estágio 2: Resposta "SIM, CONFIRMAR" -> Salva as cotas, cria os registros de histórico e abre o PIX
    const handleConfirmAllQuotas = async () => {
        if (!pendingCartItems || pendingCartItems.length === 0) return;

        const grandTotal = pendingCartItems.reduce((acc, curr) => acc + curr.totalItemPrice, 0);
        const structureSummary = { items: pendingCartItems, totalValue: grandTotal };

        setActiveCartSummary(structureSummary);
        localStorage.setItem('casamento_multicotas_cart', JSON.stringify(structureSummary));

        // Cria os registros individuais na tabela de Pedidos/Ordens para o Detalhamento do Dashboard.
        // O próprio backend de /api/orders se encarrega de incrementar e gerenciar as cotas de forma unificada.
        const orderPromises = pendingCartItems.map(item =>
            fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    guestName: rsvpName || 'Convidado Concretizado',
                    guestPhone: rsvpPhone || '',
                    giftId: item.giftId,
                    giftName: item.name,
                    quantity: item.quantity,
                    quotaValue: item.quotaValue,
                    totalValue: item.totalItemPrice
                })
            })
        );

        // Executa a criação das ordens de forma segura no banco de dados
        await Promise.all(orderPromises);

        // Fecha a caixa Sim/Não e abre o fluxo final do PIX
        setPendingCartItems(null);
        setIsPixModalOpen(true);

        // Recarrega as cotas atualizadas na tela do usuário para refletir as alterações processadas pelo back
        fetch('/api/gifts').then(res => res.json()).then(data => setGifts(data));
    };

    const handleClearCart = () => {
        localStorage.removeItem('casamento_multicotas_cart');
        setActiveCartSummary(null);
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

            <HeroHeader rsvpName={rsvpName} isLoadingGuest={isLoadingGuest} />
            <LocationCards />

            <RSVPForm
                rsvpName={rsvpName} setRsvpName={setRsvpName}
                rsvpPhone={rsvpPhone} setRsvpPhone={setRsvpPhone}
                rsvpSide={rsvpSide} setRsvpSide={setRsvpSide}
                rsvpMessage={rsvpMessage} setRsvpMessage={setRsvpMessage}
                rsvpSuccess={rsvpSuccess} isLoadingGuest={isLoadingGuest}
                onSubmit={handleRSVP}
            />

            {/* 
              * A propriedade 'key' dinâmica força o GiftList a resetar completamente o seu estado interno
              * de cotas selecionadas (zerando a sacola) assim que um carrinho se torna ativo ou é limpo.
              * Isso faz a barra flutuante inferior desaparecer instantaneamente após a confirmação.
            */}
            <GiftList
                key={activeCartSummary ? 'cart-active' : 'cart-empty'}
                gifts={gifts}
                onReviewSelections={handleReviewSelections}
            />

            {/* MODAL DE CONFIRMAÇÃO DIRETA: "Deseja realmente aquelas cotas? (Sim / Não)" */}
            {pendingCartItems && (
                <div className="fixed inset-0 bg-stone-950/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                    <div className="bg-white max-w-md w-full rounded-2xl p-6 shadow-2xl space-y-6 border border-stone-100 animate-in zoom-in-95 duration-200">
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

                            {/* Lista Interna dos Itens Escolhidos */}
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

                        {/* Botões de Decisão Sim / Não */}
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => setPendingCartItems(null)}
                                className="w-full py-3 border border-stone-200 text-stone-600 font-medium rounded-xl text-sm hover:bg-stone-50 transition-colors uppercase tracking-wider text-xs"
                            >
                                Não, Voltar
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirmAllQuotas}
                                className="w-full py-3 bg-stone-900 hover:bg-stone-800 text-white font-bold rounded-xl text-sm transition-colors shadow-md uppercase tracking-wider text-xs flex items-center justify-center gap-2"
                            >
                                <CheckCircle size={16} /> Sim, Confirmar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal do QR Code Final */}
            <PixModal
                isOpen={isPixModalOpen}
                onClose={() => setIsPixModalOpen(false)}
                cartData={activeCartSummary}
                pixKey={process.env.NEXT_PUBLIC_PIX_KEY}
            />
        </div>
    );
}
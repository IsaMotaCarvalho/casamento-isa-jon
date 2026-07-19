'use client';

import { useState, useEffect } from 'react';
import { Gift, QrCode } from 'lucide-react';
import HeroHeader from '../components/HeroHeader';
import LocationCards from '../components/LocationCards';
import RSVPForm from '../components/RSVPForm';
import GiftList from '../components/GiftList';
import PixModal from '../components/PixModal';


export default function GuestPage() {
    const [gifts, setGifts] = useState<any[]>([]);
    const [selectedGift, setSelectedGift] = useState<any>(null);
    const [selectedQuantity, setSelectedQuantity] = useState<number>(1);
    const [isPixModalOpen, setIsPixModalOpen] = useState(false);
    const [guestId, setGuestId] = useState<string | null>(null);

    // Estado para o lembrete elegante fixo no topo
    const [activeReservation, setActiveReservation] = useState<{ gift: any, quantity: number } | null>(null);

    // Estados de confirmação
    const [rsvpName, setRsvpName] = useState('');
    const [rsvpPhone, setRsvpPhone] = useState('');
    const [rsvpSide, setRsvpSide] = useState<'noivo' | 'noiva'>('noivo');
    const [rsvpMessage, setRsvpMessage] = useState('');
    const [rsvpSuccess, setRsvpSuccess] = useState(false);
    const [isLoadingGuest, setIsLoadingGuest] = useState(false);

    useEffect(() => {
        // Busca a lista de presentes
        fetch('/api/gifts')
            .then(res => res.json())
            .then(data => setGifts(data))
            .catch(err => console.error('Erro ao buscar presentes:', err));

        // Recupera o lembrete salvo caso o convidado tenha fechado o modal para pagar depois
        const savedReservation = localStorage.getItem('casamento_isa_jon_pix');
        if (savedReservation) {
            try {
                setActiveReservation(JSON.parse(savedReservation));
            } catch (e) {
                console.error('Erro ao ler reserva local:', e);
            }
        }

        // Captura a hash/ID da URL
        const params = new URLSearchParams(window.location.search);
        const id = params.get('id');

        if (id) {
            setGuestId(id);
            setIsLoadingGuest(true);

            fetch(`/api/guests?id=${id}`)
                .then(res => res.json())
                .then(data => {
                    if (data && !data.error) {
                        setRsvpName(data.name || '');
                        setRsvpPhone(data.phone || '');
                        setRsvpSide(data.side || 'noivo');
                        setRsvpMessage(data.message || '');
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

    const handleSelectGiftQuota = async (gift: any, quantity: number) => {
        setSelectedGift(gift);
        setSelectedQuantity(quantity);
        setIsPixModalOpen(true);

        // Salva a intenção de presente localmente para o aviso elegante posterior
        const reservationData = { gift, quantity };
        setActiveReservation(reservationData);
        localStorage.setItem('casamento_isa_jon_pix', JSON.stringify(reservationData));

        // Atualiza a quantidade de cotas escolhidas no banco de dados
        await fetch('/api/gifts', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id: gift._id,
                claimedQuotas: gift.claimedQuotas + quantity
            })
        });

        // Revalida a lista de dados na tela
        fetch('/api/gifts').then(res => res.json()).then(data => setGifts(data));
    };

    const handleReopenPix = () => {
        if (activeReservation) {
            setSelectedGift(activeReservation.gift);
            setSelectedQuantity(activeReservation.quantity);
            setIsPixModalOpen(true);
        }
    };

    const handleClearReservation = () => {
        localStorage.removeItem('casamento_isa_jon_pix');
        setActiveReservation(null);
    };

    return (
        <div className="min-h-screen bg-stone-50 text-stone-800 font-sans selection:bg-amber-100 relative pt-12">

            {/* Banner Informativo Elegante Fixo no Topo */}
            {activeReservation && (
                <div className="fixed top-0 inset-x-0 bg-stone-900 text-stone-100 px-4 py-2.5 text-xs md:text-sm z-40 shadow-md border-b border-amber-500/20 flex items-center justify-between animate-in slide-in-from-top duration-300">
                    <div className="flex items-center gap-2 max-w-[70%]">
                        <Gift className="text-amber-400 shrink-0 hidden sm:inline" size={16} />
                        <p className="truncate">
                            Você escolheu presentear com <span className="font-semibold text-amber-400">{activeReservation.quantity}x cota(s)</span> de <span className="italic">"{activeReservation.gift.name}"</span> (Total: R$ {((activeReservation.gift.totalPrice / activeReservation.gift.totalQuotas) * activeReservation.quantity).toFixed(2)}).
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleReopenPix}
                            className="bg-amber-500 hover:bg-amber-400 text-stone-950 px-3 py-1 rounded-full font-bold text-[11px] uppercase tracking-wider flex items-center gap-1 transition-colors shadow-sm"
                        >
                            <QrCode size={12} /> Ver QR Code / PIX
                        </button>
                        <button
                            onClick={handleClearReservation}
                            className="text-stone-400 hover:text-stone-200 font-medium text-[11px] underline"
                            title="Desfazer seleção"
                        >
                            Remover
                        </button>
                    </div>
                </div>
            )}

            {/* Componente Hero com Imagem */}
            <HeroHeader rsvpName={rsvpName} isLoadingGuest={isLoadingGuest} />

            {/* Componente de Locais Atualizados */}
            <LocationCards />

            {/* Componente de Formulário RSVP */}
            <RSVPForm
                rsvpName={rsvpName} setRsvpName={setRsvpName}
                rsvpPhone={rsvpPhone} setRsvpPhone={setRsvpPhone}
                rsvpSide={rsvpSide} setRsvpSide={setRsvpSide}
                rsvpMessage={rsvpMessage} setRsvpMessage={setRsvpMessage}
                rsvpSuccess={rsvpSuccess} isLoadingGuest={isLoadingGuest}
                onSubmit={handleRSVP}
            />

            {/* Componente de Listagem das Cotas */}
            <GiftList gifts={gifts} onSelectGiftQuota={handleSelectGiftQuota} />

            {/* Componente Modal de Pagamento PIX com o parâmetro 'quantity' obrigatório */}
            <PixModal
                isOpen={isPixModalOpen}
                onClose={() => setIsPixModalOpen(false)}
                selectedGift={selectedGift}
                quantity={selectedQuantity}
                pixKey={process.env.NEXT_PUBLIC_PIX_KEY}
            />
        </div>
    );
}
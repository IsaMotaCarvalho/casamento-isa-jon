'use client';

import GiftList from '@/src/components/GiftList';
import HeroHeader from '@/src/components/HeroHeader';
import LocationCards from '@/src/components/LocationCards';
import PixModal from '@/src/components/PixModal';
import RSVPForm from '@/src/components/RSVPForm';
import { useState, useEffect } from 'react';


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
        // Busca a lista de presentes
        fetch('/api/gifts')
            .then(res => res.json())
            .then(data => setGifts(data))
            .catch(err => console.error('Erro ao buscar presentes:', err));

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

    const handleSelectGiftQuota = async (gift: any) => {
        setSelectedGift(gift);
        setIsPixModalOpen(true);

        await fetch('/api/gifts', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id: gift._id,
                claimedQuotas: gift.claimedQuotas + 1
            })
        });

        // Revalida a lista de dados na tela
        fetch('/api/gifts').then(res => res.json()).then(data => setGifts(data));
    };

    return (
        <div className="min-h-screen bg-stone-50 text-stone-800 font-sans selection:bg-amber-100">
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

            {/* Componente Modal de Pagamento PIX */}
            <PixModal
                isOpen={isPixModalOpen}
                onClose={() => setIsPixModalOpen(false)}
                selectedGift={selectedGift}
                pixKey={process.env.NEXT_PUBLIC_PIX_KEY}
            />
        </div>
    );
}
'use client';

import { useState, useEffect } from 'react';
import Sidebar from '../../components/admin/Sidebar';
import DashboardOverview from '../../components/admin/DashboardOverview';
import GuestManagement from '../../components/admin/GuestManagement';
import GiftManagement from '../../components/admin/GiftManagement';
import QuotaOrders from '../../components/admin/QuotaOrders';

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState<'dash' | 'guests' | 'gifts' | 'orders'>('dash');
    const [guests, setGuests] = useState<any[]>([]);
    const [gifts, setGifts] = useState<any[]>([]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const resGuests = await fetch('/api/guests');
            const dataGuests = await resGuests.json();
            setGuests(dataGuests);

            const resGifts = await fetch('/api/gifts');
            const dataGifts = await resGifts.json();
            setGifts(dataGifts);
        } catch (err) {
            console.error('Erro ao buscar informações do banco:', err);
        }
    };

    const handleAddGuest = async (guestForm: { name: string; phone: string; side: string }) => {
        await fetch('/api/guests', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(guestForm),
        });
        fetchData();
    };

    const handleAddGift = async (giftForm: { name: string; totalPrice: number; totalQuotas: number }) => {
        await fetch('/api/gifts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(giftForm),
        });
        fetchData();
    };

    const toggleConfirmGuest = async (id: string, currentStatus: boolean) => {
        await fetch('/api/guests', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, confirmed: !currentStatus }),
        });
        fetchData();
    };

    // NOVA FUNÇÃO: Trata a edição completa do Convidado vinda do Modal
    const handleUpdateGuest = async (id: string, updatedForm: { name: string; phone: string; side: string; confirmed: boolean }) => {
        await fetch('/api/guests', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, ...updatedForm }),
        });
        fetchData();
    };

    // NOVA FUNÇÃO: Trata a edição completa do Presente vinda do Modal
    const handleUpdateGift = async (id: string, updatedForm: { name: string; totalPrice: number; totalQuotas: number }) => {
        await fetch('/api/gifts', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, ...updatedForm }),
        });
        fetchData();
    };

    // NOVA FUNÇÃO: Altera o status de pagamento de uma cota específica no CRM
    const handleUpdateOrderStatus = async (orderId: string, giftId: string, newStatus: 'pendente' | 'recebido') => {
        await fetch('/api/gifts', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: giftId, orderId, status: newStatus, isOrderStatusUpdate: true }),
        });
        fetchData();
    };

    const deleteItem = async (route: 'guests' | 'gifts', id: string) => {
        await fetch(`/api/${route}?id=${id}`, { method: 'DELETE' });
        fetchData();
    };

    const totalQuotasMarked = gifts.reduce((acc, curr) => acc + (curr.claimedQuotas || 0), 0);

    return (
        <div className="min-h-screen bg-slate-50 flex">
            {/* Sidebar de navegação modular */}
            <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

            {/* Renderização condicional do conteúdo principal */}
            <main className="flex-1 p-10 overflow-y-auto">
                {activeTab === 'dash' && (
                    <DashboardOverview
                        guests={guests}
                        gifts={gifts}
                        totalQuotasMarked={totalQuotasMarked}
                    />
                )}

                {activeTab === 'guests' && (
                    <GuestManagement
                        guests={guests}
                        onAddGuest={handleAddGuest}
                        onToggleConfirm={toggleConfirmGuest}
                        onDeleteItem={deleteItem}
                        onUpdateGuest={handleUpdateGuest} // Injeção da prop de atualização
                    />
                )}

                {activeTab === 'gifts' && (
                    <GiftManagement
                        gifts={gifts}
                        onAddGift={handleAddGift}
                        onDeleteItem={deleteItem}
                        onUpdateGift={handleUpdateGift} // Injeção da prop de atualização
                    />
                )}

                {activeTab === 'orders' && (
                    <QuotaOrders
                        gifts={gifts}
                        onUpdateOrderStatus={handleUpdateOrderStatus} // Injeção do controle de status do CRM
                    />
                )}
            </main>
        </div>
    );
}
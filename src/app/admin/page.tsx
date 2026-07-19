'use client';

import { useState, useEffect } from 'react';
import { Menu } from 'lucide-react';
import Sidebar from '../../components/admin/Sidebar';
import DashboardOverview from '../../components/admin/DashboardOverview';
import GuestManagement from '../../components/admin/GuestManagement';
import GiftManagement from '../../components/admin/GiftManagement';
import QuotaOrders from '../../components/admin/QuotaOrders';

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState<'dash' | 'guests' | 'gifts' | 'orders'>('dash');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [guests, setGuests] = useState<any[]>([]); // Armazena os grupos familiares
    const [gifts, setGifts] = useState<any[]>([]);
    const [orders, setOrders] = useState<any[]>([]);

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

            const resOrders = await fetch('/api/orders');
            const dataOrders = await resOrders.json();
            setOrders(dataOrders);
        } catch (err) {
            console.error('Erro ao buscar informações do banco:', err);
        }
    };

    const handleAddGuest = async (guestForm: { name: string; phone: string; side: string; members: { name: string; confirmed: boolean }[] }) => {
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

    const toggleConfirmMember = async (guestId: string, memberId: string, currentStatus: boolean) => {
        const targetFamily = guests.find(g => g._id === guestId);
        if (!targetFamily) return;

        const updatedMembers = targetFamily.members.map((m: any) =>
            m._id === memberId ? { ...m, confirmed: !currentStatus } : m
        );

        await fetch('/api/guests', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: guestId, members: updatedMembers }),
        });
        fetchData();
    };

    const handleUpdateGuest = async (id: string, updatedForm: { name: string; phone: string; side: string; members: { name: string; confirmed: boolean }[] }) => {
        await fetch('/api/guests', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, ...updatedForm }),
        });
        fetchData();
    };

    const handleUpdateGift = async (id: string, updatedForm: { name: string; totalPrice: number; totalQuotas: number }) => {
        await fetch('/api/gifts', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, ...updatedForm }),
        });
        fetchData();
    };

    const handleUpdateOrder = async (orderId: string, updatedFields: { quantity?: number; status?: string }) => {
        await fetch('/api/orders', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: orderId, ...updatedFields }),
        });
        fetchData();
    };

    const handleDeleteOrder = async (orderId: string) => {
        await fetch(`/api/orders?id=${orderId}`, { method: 'DELETE' });
        fetchData();
    };

    const handleUpdateOrderStatus = async (orderId: string, giftId: string, newStatus: 'pendente' | 'recebido') => {
        await fetch('/api/orders', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: orderId, status: newStatus }),
        });
        fetchData();
    };

    const deleteItem = async (route: 'guests' | 'gifts', id: string) => {
        await fetch(`/api/${route}?id=${id}`, { method: 'DELETE' });
        fetchData();
    };

    const totalQuotasMarked = gifts.reduce((acc, curr) => acc + (curr.claimedQuotas || 0), 0);

    // Adaptação dos convidados para manter compatibilidade com contadores do Dashboard Overview
    const flattenedGuestsForDash = guests.flatMap(g =>
        (g.members || []).map((m: any) => ({
            ...m,
            side: g.side,
            phone: g.phone
        }))
    );

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
            <header className="bg-slate-900 text-white p-4 flex items-center justify-between md:hidden shadow-md z-30">
                <h2 className="text-lg font-bold tracking-wider text-amber-400">💍 Noivos CRM</h2>
                <button
                    onClick={() => setIsSidebarOpen(true)}
                    className="text-white hover:text-amber-400 p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
                >
                    <Menu size={24} />
                </button>
            </header>

            <Sidebar
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                isOpen={isSidebarOpen}
                setIsOpen={setIsSidebarOpen}
            />

            <main className="flex-1 p-4 sm:p-6 md:p-10 overflow-y-auto">
                {activeTab === 'dash' && (
                    <DashboardOverview
                        guests={flattenedGuestsForDash}
                        gifts={gifts}
                        orders={orders}
                        totalQuotasMarked={totalQuotasMarked}
                    />
                )}

                {activeTab === 'guests' && (
                    <GuestManagement
                        guests={guests}
                        orders={orders}
                        onAddGuest={handleAddGuest}
                        onToggleConfirm={toggleConfirmMember}
                        onDeleteItem={deleteItem}
                        onUpdateGuest={handleUpdateGuest}
                        onUpdateOrder={handleUpdateOrder}
                        onDeleteOrder={handleDeleteOrder}
                    />
                )}

                {activeTab === 'gifts' && (
                    <GiftManagement
                        gifts={gifts}
                        orders={orders}
                        onAddGift={handleAddGift}
                        onDeleteItem={deleteItem}
                        onUpdateGift={handleUpdateGift}
                        onUpdateOrder={handleUpdateOrder}
                        onDeleteOrder={handleDeleteOrder}
                    />
                )}

                {activeTab === 'orders' && (
                    <QuotaOrders
                        orders={orders}
                        onUpdateOrderStatus={handleUpdateOrderStatus}
                    />
                )}
            </main>
        </div>
    );
}
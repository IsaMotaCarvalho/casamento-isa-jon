'use client';

import React, { useState } from 'react';
import { Gift, Plus, Minus, ShoppingBag } from 'lucide-react';

interface GiftListProps {
    gifts: any[];
    onReviewSelections: (selectedCart: any[]) => void;
}

export default function GiftList({ gifts, onReviewSelections }: GiftListProps) {
    // Estado do carrinho: { [giftId]: quantidade_escolhida }
    const [cart, setCart] = useState<Record<string, number>>({});

    const updateQuantity = (giftId: string, delta: number, maxAvailable: number) => {
        setCart(prev => {
            const current = prev[giftId] || 0;
            const next = current + delta;

            if (next <= 0) {
                const updated = { ...prev };
                delete updated[giftId];
                return updated;
            }

            if (next > maxAvailable) return prev; // Não deixa ultrapassar o limite disponível

            return { ...prev, [giftId]: next };
        });
    };

    // Formata os dados selecionados para enviar ao componente pai
    const handleAdvance = () => {
        const selectedItems = gifts
            .filter(gift => cart[gift._id] > 0)
            .map(gift => ({
                giftId: gift._id,
                name: gift.name,
                quantity: cart[gift._id],
                quotaValue: gift.totalPrice / gift.totalQuotas,
                totalItemPrice: (gift.totalPrice / gift.totalQuotas) * cart[gift._id]
            }));

        if (selectedItems.length > 0) {
            onReviewSelections(selectedItems);
        }
    };

    // Cálculos da barra de resumo flutuante
    const totalItemsInCart = Object.values(cart).reduce((acc, curr) => acc + curr, 0);
    const totalCartValue = gifts.reduce((acc, gift) => {
        const qty = cart[gift._id] || 0;
        const quotaValue = gift.totalPrice / gift.totalQuotas;
        return acc + (qty * quotaValue);
    }, 0);

    return (
        <section className="max-w-5xl mx-auto px-6 py-20 pb-32 relative">
            <div className="text-center max-w-xl mx-auto space-y-3 mb-12">
                <h2 className="text-3xl font-serif italic text-stone-900">Lista de Presentes por Cota</h2>
                <p className="text-stone-600 text-sm">
                    Fique à vontade para escolher uma ou mais cotas de diferentes presentes. Monte sua combinação abaixo e nos ajude na realização desse sonho!
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {gifts.map((gift) => {
                    const quotaValue = gift.totalPrice / gift.totalQuotas;
                    const availableQuotas = gift.totalQuotas - (gift.claimedQuotas || 0);
                    const isSoldOut = availableQuotas <= 0;
                    const currentQty = cart[gift._id] || 0;

                    return (
                        <div key={gift._id} className={`bg-white rounded-2xl overflow-hidden shadow-sm border transition-all flex flex-col justify-between ${currentQty > 0 ? 'border-amber-500 ring-1 ring-amber-500/30 bg-amber-50/10' : 'border-stone-200 hover:shadow-md'}`}>
                            <div className="p-6 space-y-4">
                                <div className="flex justify-between items-start gap-2">
                                    <h4 className="text-lg font-bold text-stone-900">{gift.name}</h4>
                                    {currentQty > 0 && (
                                        <span className="bg-amber-500 text-stone-950 text-xs font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
                                            {currentQty} {currentQty === 1 ? 'selecionada' : 'selecionadas'}
                                        </span>
                                    )}
                                </div>
                                <div className="flex justify-between items-baseline">
                                    <span className="text-xs text-stone-500 uppercase tracking-wider font-semibold">Valor da Cota:</span>
                                    <span className="text-2xl font-serif font-bold text-amber-800">R$ {quotaValue.toFixed(2)}</span>
                                </div>
                                {!isSoldOut && (
                                    <div className="text-xs text-stone-500 font-medium">
                                        Cotas ainda livres: <span className="font-bold text-stone-700">{availableQuotas}</span>
                                    </div>
                                )}
                            </div>

                            <div className="px-6 pb-6 pt-2 border-t border-stone-100 bg-stone-50/50">
                                {isSoldOut ? (
                                    <div className="w-full text-center py-2 bg-stone-100 text-stone-500 font-semibold rounded-lg text-sm">
                                        Todas as cotas preenchidas! ❤️
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-between gap-4">
                                        <span className="text-xs font-semibold text-stone-600 uppercase tracking-wider">Escolher Cotas:</span>
                                        <div className="flex items-center bg-white border border-stone-200 rounded-lg shadow-sm">
                                            <button
                                                type="button"
                                                onClick={() => updateQuantity(gift._id, -1, availableQuotas)}
                                                className="p-2 text-stone-600 hover:text-stone-900 transition-colors disabled:opacity-30"
                                                disabled={currentQty === 0}
                                            >
                                                <Minus size={16} />
                                            </button>
                                            <span className="w-8 text-center font-bold text-stone-800 text-sm select-none">
                                                {currentQty}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => updateQuantity(gift._id, 1, availableQuotas)}
                                                className="p-2 text-stone-600 hover:text-stone-900 transition-colors disabled:opacity-30"
                                                disabled={currentQty >= availableQuotas}
                                            >
                                                <Plus size={16} />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* BARRA FIXA FLUTUANTE DE RESUMO (Aparece se houver itens selecionados) */}
            {totalItemsInCart > 0 && (
                <div className="fixed bottom-6 inset-x-4 max-w-xl mx-auto bg-stone-900 text-stone-100 p-4 rounded-2xl shadow-2xl border border-amber-500/30 z-40 flex items-center justify-between gap-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-amber-500 rounded-xl text-stone-950">
                            <ShoppingBag size={20} />
                        </div>
                        <div>
                            <p className="text-xs text-stone-400 font-medium">Seu Presente Coletivo</p>
                            <p className="text-sm font-bold">
                                {totalItemsInCart} {totalItemsInCart === 1 ? 'Cota selecionada' : 'Cotas selecionadas'}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-right hidden sm:block">
                            <p className="text-xs text-stone-400">Total a presentear</p>
                            <p className="text-base font-serif font-bold text-amber-400">R$ {totalCartValue.toFixed(2)}</p>
                        </div>
                        <button
                            onClick={handleAdvance}
                            className="bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold px-5 py-2.5 rounded-xl text-xs uppercase tracking-wider transition-colors shadow-md"
                        >
                            Confirmar Opções
                        </button>
                    </div>
                </div>
            )}
        </section>
    );
}
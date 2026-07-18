'use client';

import React from 'react';

interface GiftListProps {
    gifts: any[];
    onSelectGiftQuota: (gift: any) => void;
}

export default function GiftList({ gifts, onSelectGiftQuota }: GiftListProps) {
    return (
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
                        <div key={gift._id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-stone-200 flex flex-col justify-between hover:shadow-md transition-shadow">
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
                                    <button onClick={() => onSelectGiftQuota(gift)} className="w-full py-2.5 bg-stone-900 text-white font-medium rounded-lg text-sm hover:bg-stone-800 transition-colors">
                                        Presentear com 1 Cota
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}
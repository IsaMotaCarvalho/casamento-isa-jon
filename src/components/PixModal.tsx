'use client';

import React from 'react';

interface PixModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectedGift: any;
    pixKey?: string;
}

export default function PixModal({ isOpen, onClose, selectedGift, pixKey }: PixModalProps) {
    if (!isOpen || !selectedGift) return null;

    return (
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
                        {pixKey}
                    </div>
                    <p className="text-[11px] text-stone-400">Abra o aplicativo do seu banco, escolha transferir por PIX e cole a chave numérica acima.</p>
                </div>

                <button onClick={onClose} className="w-full py-2.5 bg-stone-900 text-white font-semibold rounded-lg text-sm hover:bg-stone-800 transition-colors">
                    Concluí o Pagamento / Fechar
                </button>
            </div>
        </div>
    );
}
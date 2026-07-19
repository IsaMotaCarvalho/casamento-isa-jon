'use client';

import React, { useState, useEffect } from 'react';
import { Copy, Check } from 'lucide-react';

interface PixModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectedGift: any;
    quantity: number;
    pixKey?: string;
}

// Algoritmo CRC16 CCITT-FALSE validado para o padrão de transações Pix (BACEN)
function calculateCRC16(str: string): string {
    let crc = 0xFFFF;
    for (let i = 0; i < str.length; i++) {
        const code = str.charCodeAt(i);
        crc ^= (code << 8);
        for (let j = 0; j < 8; j++) {
            if ((crc & 0x8000) !== 0) {
                crc = ((crc << 1) ^ 0x1021) & 0xFFFF;
            } else {
                crc = (crc << 1) & 0xFFFF;
            }
        }
    }
    return crc.toString(16).toUpperCase().padStart(4, '0');
}

export default function PixModal({ isOpen, onClose, selectedGift, quantity, pixKey }: PixModalProps) {
    const [copied, setCopied] = useState(false);
    const [pixPayload, setPixPayload] = useState('');

    useEffect(() => {
        if (isOpen && selectedGift && pixKey) {
            const quotaValue = selectedGift.totalPrice / selectedGift.totalQuotas;
            const totalValue = quotaValue * quantity;
            const cleanKey = pixKey.replace(/\s/g, '');
            const formattedAmount = totalValue.toFixed(2);

            // Configuração dos subcampos internos da Tag 26 (Identificador da Conta)
            const gui = "0014br.gov.bcb.pix";
            const keySubfield = `01${cleanKey.length.toString().padStart(2, '0')}${cleanKey}`;
            const merchantAccountInfo = `${gui}${keySubfield}`; // Apenas os dados puros aqui

            const payloadParts: Record<string, string> = {
                '00': '01',
                '26': merchantAccountInfo,
                '52': '0000',
                '53': '986', // ISO Moeda Real Brasil
                '54': formattedAmount,
                '58': 'BR',
                '59': 'Jonathan e Isabella'.substring(0, 25).normalize("NFD").replace(/[\u0300-\u036f]/g, ""),
                '60': 'PRES EPITACIO'.substring(0, 15).normalize("NFD").replace(/[\u0300-\u036f]/g, ""),
                '62': '0503***' // TxID estático padrão
            };

            let basePayload = '000201';
            const keysOrder = ['26', '52', '53', '54', '58', '59', '60', '62'];
            keysOrder.forEach(k => {
                const val = payloadParts[k];
                if (val) {
                    basePayload += `${k}${val.length.toString().padStart(2, '0')}${val}`;
                }
            });

            basePayload += '6304';
            const crc = calculateCRC16(basePayload);
            setPixPayload(basePayload + crc);
        }
    }, [isOpen, selectedGift, quantity, pixKey]);

    if (!isOpen || !selectedGift) return null;

    const totalValue = (selectedGift.totalPrice / selectedGift.totalQuotas) * quantity;

    const handleCopy = () => {
        navigator.clipboard.writeText(pixPayload);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&qzone=1&data=${encodeURIComponent(pixPayload)}`;

    return (
        <div className="fixed inset-0 bg-stone-950/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white max-w-sm w-full rounded-2xl p-6 shadow-xl space-y-5 text-center relative border border-stone-100 animate-in fade-in zoom-in-95 duration-150">
                <div>
                    <h3 className="text-xl font-serif font-bold text-stone-900">Muito obrigado!</h3>
                    <p className="text-stone-600 text-xs mt-1">Você escolheu presentear com <span className="font-bold text-stone-800">{quantity}x</span> cota(s) de: <br /><strong className="text-stone-800">{selectedGift.name}</strong></p>
                </div>

                <div className="bg-amber-50 py-3 px-4 rounded-xl flex flex-col items-center justify-center gap-0.5">
                    <span className="text-[10px] font-bold text-amber-800 uppercase tracking-widest">Valor Total do PIX</span>
                    <span className="text-2xl font-serif font-bold text-amber-900">R$ {totalValue.toFixed(2)}</span>
                </div>

                <div className="flex justify-center my-2">
                    <div className="p-2 bg-white border border-stone-200 rounded-xl shadow-inner">
                        <img src={qrCodeUrl} alt="QR Code PIX" className="w-48 h-48" />
                    </div>
                </div>

                <div className="space-y-1.5 text-left">
                    <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">Código PIX Cópia e Cola</label>
                    <div className="flex gap-2">
                        <div className="bg-stone-50 p-2.5 rounded-lg text-[11px] font-mono border border-stone-200 text-stone-600 break-all flex-1 max-h-16 overflow-y-auto select-all">
                            {pixPayload}
                        </div>
                        <button
                            onClick={handleCopy}
                            className={`p-2.5 rounded-lg border transition-colors flex items-center justify-center ${copied ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-stone-900 text-white border-stone-900 hover:bg-stone-800'}`}
                            title="Copiar código"
                        >
                            {copied ? <Check size={16} /> : <Copy size={16} />}
                        </button>
                    </div>
                </div>

                <button onClick={onClose} className="w-full py-2.5 bg-stone-900 text-white font-semibold rounded-lg text-sm hover:bg-stone-800 transition-colors shadow-sm">
                    Pagar depois / Fechar Janela
                </button>
            </div>
        </div>
    );
}
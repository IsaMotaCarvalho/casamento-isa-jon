'use client';

import React, { useState, useEffect } from 'react';
import { X, Copy, Check, Info } from 'lucide-react';

interface CartItem {
    giftId: string;
    name: string;
    quantity: number;
    quotaValue: number;
    totalItemPrice: number;
}

interface PixModalProps {
    isOpen: boolean;
    onClose: () => void;
    cartData: {
        items: CartItem[];
        totalValue: number;
    } | null;
    pixKey: string | undefined;
}

// Função para calcular o Checksum CRC16 exigido no padrão PIX do Banco Central
function calculateCRC16(str: string): string {
    let crc = 0xFFFF;
    for (let i = 0; i < str.length; i++) {
        crc ^= str.charCodeAt(i) << 8;
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

// Função que monta a String oficial do PIX Copia e Cola (Padrão EMV)
function generatePixCopyPaste(key: string, amount: number): string {
    const cleanKey = key.replace(/\s+/g, '');

    // Identificador do formato do payload (Tag 00)
    const tag00 = "000201";

    // Informações da conta do comerciante / Chave PIX (Tag 26)
    const gui = "0014br.gov.bcb.pix";
    const keySubtag = `01${cleanKey.length.toString().padStart(2, '0')}${cleanKey}`;
    const merchantAccountInfo = `${gui}${keySubtag}`;
    const tag26 = `26${merchantAccountInfo.length.toString().padStart(2, '0')}${merchantAccountInfo}`;

    // Categoria do Merchant (Tag 52)
    const tag52 = "52040000";

    // Moeda Real Brasileiro ISO 4217 (Tag 53)
    const tag53 = "5303986";

    // Valor da Transação (Tag 54)
    const formattedAmount = amount.toFixed(2);
    const tag54 = `54${formattedAmount.length.toString().padStart(2, '0')}${formattedAmount}`;

    // Código do País BR (Tag 58)
    const tag58 = "5802BR";

    // Nome do Beneficiário - Ajustado para o padrão sem acentos (Tag 59)
    const name = "ISABELLA E JONATHAN";
    const tag59 = `59${name.length.toString().padStart(2, '0')}${name}`;

    // Cidade do Beneficiário (Tag 60)
    const city = "SAO PAULO";
    const tag60 = `60${city.length.toString().padStart(2, '0')}${city}`;

    // Identificador da transação TXID (Tag 62) -> Usando o padrão genérico '***' para PIX estático
    const tag62 = "62070503***";

    // Indicador do início do CRC16 (Tag 63)
    const payloadBeforeCRC = `${tag00}${tag26}${tag52}${tag53}${tag54}${tag58}${tag59}${tag60}${tag62}6304`;

    const crc = calculateCRC16(payloadBeforeCRC);
    return `${payloadBeforeCRC}${crc}`;
}

export default function PixModal({ isOpen, onClose, cartData, pixKey }: PixModalProps) {
    const [copied, setCopied] = useState(false);
    const [pixString, setPixString] = useState('');

    // Chave PIX padrão caso não encontre nas variáveis de ambiente
    const activePixKey = pixKey || "47538062866";

    useEffect(() => {
        if (isOpen && cartData) {
            // Toda vez que abrir com um valor, gera o payload oficial do Banco Central
            const generatedString = generatePixCopyPaste(activePixKey, cartData.totalValue);
            setPixString(generatedString);
        }
    }, [isOpen, cartData, activePixKey]);

    if (!isOpen || !cartData) return null;

    const handleCopyPix = () => {
        navigator.clipboard.writeText(pixString);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // Gera a imagem do QR Code a partir da String oficial estruturada do PIX
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(pixString)}`;

    return (
        <div className="fixed inset-0 bg-stone-950/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <div className="bg-white max-w-md w-full rounded-2xl p-6 shadow-2xl space-y-5 border border-stone-100 relative animate-in zoom-in-95 duration-200 text-stone-800">

                {/* Botão de Fechar */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-stone-400 hover:text-stone-600 transition-colors"
                >
                    <X size={20} />
                </button>

                {/* Cabeçalho */}
                <div className="text-center space-y-1">
                    <h3 className="text-xl font-serif font-bold text-stone-900">Quase lá! 🎁</h3>
                    <p className="text-stone-500 text-xs">
                        Finalize o seu presente enviando o PIX direto para os noivos.
                    </p>
                </div>

                {/* Resumo do Pedido */}
                <div className="bg-stone-50 rounded-xl p-4 border border-stone-200/60 space-y-2.5">
                    <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block">
                        Resumo do Presente Coletivo
                    </span>
                    <div className="divide-y divide-stone-200/40 max-h-28 overflow-y-auto pr-1">
                        {cartData.items.map((item, idx) => (
                            <div key={item.giftId + idx} className="py-1.5 flex justify-between text-xs first:pt-0 last:pb-0">
                                <span className="text-stone-700 font-medium">
                                    {item.quantity}x {item.name}
                                </span>
                                <span className="font-semibold text-stone-900">
                                    R$ {item.totalItemPrice.toFixed(2)}
                                </span>
                            </div>
                        ))}
                    </div>
                    <div className="pt-2 border-t border-stone-200/60 flex justify-between items-center text-sm font-bold">
                        <span className="text-stone-800">Total Geral:</span>
                        <span className="text-base text-amber-900">R$ {cartData.totalValue.toFixed(2)}</span>
                    </div>
                </div>

                {/* Área do PIX Real */}
                <div className="flex flex-col items-center justify-center space-y-4">

                    {/* QR Code Real escaneável por aplicativos bancários */}
                    <div className="w-48 h-48 bg-white rounded-xl border border-stone-200 flex items-center justify-center p-2 shadow-inner">
                        {pixString ? (
                            <img
                                src={qrCodeUrl}
                                alt="QR Code PIX Real"
                                className="w-44 h-44 object-contain rounded-lg animate-in fade-in duration-300"
                            />
                        ) : (
                            <div className="w-full h-full bg-stone-100 rounded-lg animate-pulse" />
                        )}
                    </div>

                    {/* Copia e Cola */}
                    <div className="w-full space-y-1.5">
                        <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider text-center">
                            Código PIX Copia e Cola
                        </label>
                        <div className="flex items-center bg-stone-50 border border-stone-200 rounded-xl overflow-hidden p-1 pl-3 shadow-sm">
                            <span className="text-xs text-stone-500 truncate flex-1 font-mono select-all pr-2">
                                {pixString || "Gerando código..."}
                            </span>
                            <button
                                type="button"
                                onClick={handleCopyPix}
                                disabled={!pixString}
                                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${copied ? 'bg-emerald-600 text-white' : 'bg-stone-900 text-white hover:bg-stone-800 disabled:opacity-50'}`}
                            >
                                {copied ? (
                                    <>
                                        <Check size={14} /> Copiado!
                                    </>
                                ) : (
                                    <>
                                        <Copy size={14} /> Copiar Código
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Aviso Importante */}
                <div className="bg-amber-50/50 border border-amber-500/10 rounded-xl p-3 flex gap-2.5 items-start">
                    <Info size={16} className="text-amber-700 shrink-0 mt-0.5" />
                    <p className="text-[11px] text-stone-600 leading-normal">
                        <strong>Nota importante:</strong> Abra o aplicativo do seu banco, escolha a opção "Pagar via PIX" e selecione "Copia e Cola" ou aponte a câmera para o QR Code acima. O valor de <strong>R$ {cartData.totalValue.toFixed(2)}</strong> e os dados dos noivos aparecerão automaticamente.
                    </p>
                </div>

            </div>
        </div>
    );
}
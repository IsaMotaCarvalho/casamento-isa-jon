'use client';

interface HeroHeaderProps {
    rsvpName: string;
    isLoadingGuest: boolean;
}

export default function HeroHeader({ rsvpName, isLoadingGuest }: HeroHeaderProps) {
    return (
        <div className="w-full text-center px-4 py-8 flex flex-col items-center justify-center space-y-6 bg-transparent">
            {/* Badge de Boas-Vindas */}
            {rsvpName && !isLoadingGuest && (
                <div className="bg-white/90 backdrop-blur-sm border border-stone-200/80 px-6 py-2 rounded-full shadow-sm max-w-xl animate-in fade-in zoom-in-95 duration-500">
                    <p className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-amber-800 text-center">
                        Olá, {rsvpName}! Convidamos você para nosso casamento
                    </p>
                </div>
            )}

            {/* Nomes dos Noivos com sombra leve para garantir legibilidade */}
            <div className="space-y-2 select-none">
                <h1 className="text-4xl md:text-6xl font-serif font-black text-stone-900 drop-shadow-[0_2px_4px_rgba(255,255,255,0.8)] tracking-wide">
                    Isabella & Jonathan
                </h1>
                <p className="text-xs md:text-sm italic font-medium text-stone-800 drop-shadow-[0_1px_2px_rgba(255,255,255,0.8)]">
                    "O amor é paciente, o amor é bondoso..."
                </p>
            </div>

            {/* Badge da Data */}
            <div className="bg-stone-900/95 backdrop-blur-sm text-white px-5 py-2 rounded-full shadow-md text-xs font-semibold tracking-wider border border-stone-800 animate-in fade-in slide-in-from-bottom-3 duration-700">
                18 de Julho de 2026 • 17:00h
            </div>
        </div>
    );
}
import dbConnect from '@/src/lib/mongodb';
import Gift from '@/src/models/Gift';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    await dbConnect();
    try {
        const { guestName, guestPhone, message, cart } = await request.json();

        if (!cart || !Array.isArray(cart) || cart.length === 0) {
            return NextResponse.json({ error: 'O carrinho está vazio ou é inválido.' }, { status: 400 });
        }

        // Executa a inserção paralela em cada presente contido no carrinho do convidado
        const updatePromises = cart.map((item: any) => {
            const { giftId, quantity, totalItemPrice } = item;

            return Gift.findByIdAndUpdate(
                giftId,
                {
                    $inc: { claimedQuotas: Number(quantity) }, // Incrementa as cotas ocupadas
                    $push: {
                        reservations: {
                            guestName,
                            guestPhone,
                            quantity: Number(quantity),
                            totalValue: Number(totalItemPrice),
                            status: 'pendente', // Todo pedido nasce pendente até o Admin confirmar
                            message: message || ''
                        }
                    }
                },
                { new: true }
            );
        });

        await Promise.all(updatePromises);

        return NextResponse.json({ success: true, message: 'Cotas reservadas com sucesso!' }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
import dbConnect from '@/src/lib/mongodb';
import Order from '@/src/models/Order';
import Gift from '@/src/models/Gift';
import { NextResponse } from 'next/server';

export async function GET() {
    await dbConnect();
    try {
        const orders = await Order.find({}).sort({ createdAt: -1 });
        return NextResponse.json(orders, {
            headers: { 'Cache-Control': 'no-store, max-age=0' }
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    await dbConnect();
    try {
        const data = await request.json();
        const order = await Order.create(data);

        await Gift.findByIdAndUpdate(data.giftId, {
            $inc: { claimedQuotas: Number(data.quantity) }
        });

        return NextResponse.json(order, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}

export async function PUT(request: Request) {
    await dbConnect();
    try {
        const data = await request.json();
        const { id, status, quantity } = data;

        const oldOrder = await Order.findById(id);
        if (!oldOrder) {
            return NextResponse.json({ error: 'Pedido não encontrado' }, { status: 404 });
        }

        const updateFields: any = {};
        if (status !== undefined) updateFields.status = status;

        // Se houver alteração manual na quantidade de cotas
        if (quantity !== undefined) {
            const newQty = Number(quantity);
            if (newQty !== oldOrder.quantity) {
                const diff = newQty - oldOrder.quantity;
                updateFields.quantity = newQty;
                updateFields.totalValue = newQty * oldOrder.quotaValue;

                // Atualiza o contador absoluto de cotas compradas do presente
                await Gift.findByIdAndUpdate(oldOrder.giftId, {
                    $inc: { claimedQuotas: diff }
                });

                // Sincroniza o array interno de reservas do presente correspondente
                await Gift.findOneAndUpdate(
                    { _id: oldOrder.giftId, "reservations.guestPhone": oldOrder.guestPhone },
                    {
                        $set: {
                            "reservations.$.quantity": newQty,
                            "reservations.$.totalValue": newQty * oldOrder.quotaValue
                        }
                    }
                );
            }
        }

        const order = await Order.findByIdAndUpdate(id, updateFields, { new: true });
        return NextResponse.json(order);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}

export async function DELETE(request: Request) {
    await dbConnect();
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        const order = await Order.findById(id);
        if (order) {
            // Estorna as cotas e remove do histórico embarcado do presente
            await Gift.findByIdAndUpdate(order.giftId, {
                $inc: { claimedQuotas: -Number(order.quantity) },
                $pull: { reservations: { guestPhone: order.guestPhone } }
            });
            await Order.findByIdAndDelete(id);
        }

        return NextResponse.json({ message: 'Pedido removido com sucesso e cotas recalculadas.' });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}
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

        // Atualiza as cotas ocupadas no respectivo presente de forma automática
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
        const { id, status } = data;

        const order = await Order.findByIdAndUpdate(id, { status }, { new: true });
        if (!order) {
            return NextResponse.json({ error: 'Pedido não encontrado' }, { status: 404 });
        }

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
            // Estorna a quantidade de cotas liberadas no presente
            await Gift.findByIdAndUpdate(order.giftId, {
                $inc: { claimedQuotas: -Number(order.quantity) }
            });
            await Order.findByIdAndDelete(id);
        }

        return NextResponse.json({ message: 'Pedido removido com sucesso' });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}
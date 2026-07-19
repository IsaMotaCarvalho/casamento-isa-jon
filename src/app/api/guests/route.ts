import dbConnect from '@/src/lib/mongodb';
import Guest from '@/src/models/Guest';
import Order from '@/src/models/Order';
import Gift from '@/src/models/Gift';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    try {
        if (id) {
            const guest = await Guest.findById(id);
            if (!guest) {
                return NextResponse.json({ error: 'Convidado não encontrado' }, { status: 404 });
            }
            return NextResponse.json(guest);
        }

        const guests = await Guest.find({});
        return NextResponse.json(guests);
    } catch (error) {
        return NextResponse.json({ error: 'Erro ao buscar dados no banco' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    await dbConnect();
    const data = await request.json();
    const { id, ...updateData } = data;

    try {
        if (id) {
            const guest = await Guest.findByIdAndUpdate(id, updateData, { new: true });
            if (!guest) {
                return NextResponse.json({ error: 'Convidado não encontrado para atualização' }, { status: 404 });
            }
            return NextResponse.json(guest);
        }

        const guest = await Guest.create(data);
        return NextResponse.json(guest, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: 'Erro ao processar a requisição' }, { status: 400 });
    }
}

export async function PUT(request: Request) {
    await dbConnect();
    try {
        const data = await request.json();
        const { id, ...updateData } = data;
        const guest = await Guest.findByIdAndUpdate(id, updateData, { new: true });
        if (!guest) {
            return NextResponse.json({ error: 'Convidado não encontrado' }, { status: 404 });
        }
        return NextResponse.json(guest);
    } catch (error) {
        return NextResponse.json({ error: 'Erro ao atualizar convidado' }, { status: 400 });
    }
}

export async function DELETE(request: Request) {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    try {
        const guest = await Guest.findById(id);
        if (!guest) {
            return NextResponse.json({ error: 'Convidado não encontrado' }, { status: 404 });
        }

        // 1. Busca todos os pedidos associados ao telefone deste convidado
        const guestOrders = await Order.find({ guestPhone: guest.phone });

        // 2. Desfaz as operações de quantidades e limpa os históricos em todas as tabelas
        for (const order of guestOrders) {
            await Gift.findByIdAndUpdate(order.giftId, {
                $inc: { claimedQuotas: -Number(order.quantity) },
                $pull: { reservations: { guestPhone: guest.phone } }
            });
        }

        // 3. Remove os pedidos e o convidado definitivamente
        await Order.deleteMany({ guestPhone: guest.phone });
        await Guest.findByIdAndDelete(id);

        return NextResponse.json({ message: 'Convidado e todas as suas cotas correspondentes foram removidos com sucesso!' });
    } catch (error) {
        return NextResponse.json({ error: 'Erro ao processar a remoção em cascata do convidado' }, { status: 400 });
    }
}
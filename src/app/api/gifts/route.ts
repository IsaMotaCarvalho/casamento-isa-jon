import dbConnect from '@/src/lib/mongodb';
import Gift from '@/src/models/Gift';
import { NextResponse } from 'next/server';

export async function GET() {
    await dbConnect();
    const gifts = await Gift.find({});
    return NextResponse.json(gifts, {
        headers: { 'Cache-Control': 'no-store, max-age=0' }
    });
}

export async function POST(request: Request) {
    await dbConnect();
    const data = await request.json();
    const gift = await Gift.create(data);
    return NextResponse.json(gift, { status: 201 });
}

export async function PUT(request: Request) {
    await dbConnect();
    try {
        const data = await request.json();
        const { id, claimedQuotas, orderId, status, isOrderStatusUpdate, ...updateData } = data;

        // CENÁRIO A: Admin alterando status da cota (Pendente / Recebido) via CRM
        if (isOrderStatusUpdate && orderId) {
            const gift = await Gift.findOneAndUpdate(
                { _id: id, "reservations._id": orderId },
                { $set: { "reservations.$.status": status } },
                { new: true }
            );

            if (!gift) {
                return NextResponse.json({ error: 'Pedido ou Presente não encontrado' }, { status: 404 });
            }
            return NextResponse.json(gift);
        }

        // CENÁRIO B: Edição cadastral padrão do Presente
        const updateQuery: any = { $set: updateData };

        if (claimedQuotas !== undefined) {
            updateQuery.$inc = { claimedQuotas: Number(claimedQuotas) };
        }

        const gift = await Gift.findByIdAndUpdate(id, updateQuery, { new: true, runValidators: true });

        if (!gift) {
            return NextResponse.json({ error: 'Presente não encontrado' }, { status: 404 });
        }

        return NextResponse.json(gift);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    await Gift.findByIdAndDelete(id);
    return NextResponse.json({ message: 'Presente removido' });
}
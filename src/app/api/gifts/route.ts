import dbConnect from '@/src/lib/mongodb';
import Gift from '@/src/models/Gift';
import { NextResponse } from 'next/server';

export async function GET() {
    await dbConnect();
    // Desativa o cache na resposta da API para garantir dados sempre novos
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
        const { id, claimedQuotas, ...updateData } = data;

        // Montamos o objeto de atualização dinamicamente
        const updateQuery: any = { $set: updateData };

        // Se o frontend enviou a quantidade de cotas preenchidas, incrementamos ($inc) no MongoDB
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
import dbConnect from '@/src/lib/mongodb';
import Guest from '@/src/models/Guest';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    await dbConnect();

    // Captura os parâmetros da URL (ex: /api/guests?id=65f1a2b3...)
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    try {
        if (id) {
            // Se houver ID, busca e retorna apenas este convidado específico
            const guest = await Guest.findById(id);
            if (!guest) {
                return NextResponse.json({ error: 'Convidado não encontrado' }, { status: 404 });
            }
            return NextResponse.json(guest);
        }

        // Se não houver ID, retorna a lista completa (usado no painel Admin)
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
            // Se o ID foi enviado, o convidado já existe e está apenas confirmando presença (RSVP)
            const guest = await Guest.findByIdAndUpdate(id, updateData, { new: true });
            if (!guest) {
                return NextResponse.json({ error: 'Convidado não encontrado para atualização' }, { status: 404 });
            }
            return NextResponse.json(guest);
        }

        // Se não houver ID no corpo, é uma criação de um novo convidado (usado no painel Admin)
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
        await Guest.findByIdAndDelete(id);
        return NextResponse.json({ message: 'Convidado removido' });
    } catch (error) {
        return NextResponse.json({ error: 'Erro ao remover convidado' }, { status: 400 });
    }
}
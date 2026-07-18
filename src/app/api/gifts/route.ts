import dbConnect from '@/src/lib/mongodb';
import Gift from '@/src/models/Gift';
import { NextResponse } from 'next/server';


export async function GET() {
    await dbConnect();
    const gifts = await Gift.find({});
    return NextResponse.json(gifts);
}

export async function POST(request: Request) {
    await dbConnect();
    const data = await request.json();
    const gift = await Gift.create(data);
    return NextResponse.json(gift, { status: 201 });
}

export async function PUT(request: Request) {
    await dbConnect();
    const data = await request.json();
    const { id, ...updateData } = data;
    const gift = await Gift.findByIdAndUpdate(id, updateData, { new: true });
    return NextResponse.json(gift);
}

export async function DELETE(request: Request) {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    await Gift.findByIdAndDelete(id);
    return NextResponse.json({ message: 'Presente removido' });
}
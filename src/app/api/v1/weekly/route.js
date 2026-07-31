import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const body = await req.json();
    return NextResponse.json({ id: `w_demo_${Date.now()}`, ...body, completed: false });
  } catch (e) {
    return NextResponse.json({ success: true, localOnly: true });
  }
}

export async function PUT(req) {
  try {
    const body = await req.json();
    return NextResponse.json({ success: true, ...body });
  } catch (e) {
    return NextResponse.json({ success: true, localOnly: true });
  }
}

export async function DELETE() {
  return NextResponse.json({ success: true });
}

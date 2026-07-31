import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const body = await req.json();
    return NextResponse.json({ success: true, ...body });
  } catch (e) {
    return NextResponse.json({ success: true });
  }
}

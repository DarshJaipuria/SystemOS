import { NextResponse } from 'next/server';

const defaultRewards = [
  { id: 'r1', name: 'Cheat meal (sweet treat or fast food)' },
  { id: 'r2', name: 'Sleep in / extra hour of rest' },
  { id: 'r3', name: 'Watch a favorite movie / show episode' },
  { id: 'r4', name: 'Buy something nice (small budget item)' },
  { id: 'r5', name: 'Play video games / hobby time for 1 hour' }
];

const defaultClaims = [
  { id: 'c1', rewardId: 'r1', date: '2026-07-01' },
  { id: 'c2', rewardId: 'r2', date: '2026-07-05' },
  { id: 'c3', rewardId: 'r3', date: '2026-07-10' },
  { id: 'c4', rewardId: 'r4', date: '2026-07-15' },
  { id: 'c5', rewardId: 'r5', date: '2026-07-20' },
  { id: 'c6', rewardId: 'r1', date: '2026-07-25' },
  { id: 'c7', rewardId: 'r2', date: '2026-07-31' }
];

export async function GET(req) {
  try {
    return NextResponse.json({ rewards: defaultRewards, claimedRewards: defaultClaims });
  } catch (e) {
    return NextResponse.json({ rewards: defaultRewards, claimedRewards: defaultClaims });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { rewards: newNames } = body;
    const updated = (newNames || []).map((name, i) => ({ id: `r${i+1}`, name }));
    return NextResponse.json({ success: true, rewards: updated });
  } catch (e) {
    return NextResponse.json({ success: true, rewards: defaultRewards });
  }
}

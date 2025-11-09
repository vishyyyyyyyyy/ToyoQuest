import { NextResponse } from 'next/server';

export async function GET() {
 
  const winners = [
    { position: 1, name: '' },
    { position: 2, name: '' },
    { position: 3, name: '' },
  ];

  return NextResponse.json({ winners });
}

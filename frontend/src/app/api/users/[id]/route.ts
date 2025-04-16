import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000';

export async function DELETE(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const userId = context.params.id;
    
    const response = await fetch(`${BACKEND_URL}/api/users/${userId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Backend API hatası:', error);
    return NextResponse.json(
      { detail: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const userId = context.params.id;
    
    const response = await fetch(`${BACKEND_URL}/api/users/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Backend API hatası:', error);
    return NextResponse.json(
      { detail: 'Sunucu hatası' },
      { status: 500 }
    );
  }
} 
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    // İstek verilerini al
    const requestData = await req.json()
    const token = req.headers.get('Authorization')

    if (!token) {
      return NextResponse.json(
        { error: 'Yetkilendirme başarısız' },
        { status: 401 }
      )
    }

    console.log("Chat API isteği gönderiliyor:", {
      url: 'http://localhost:8000/api/chat/chat',
      method: 'POST',
      data: requestData
    })

    // Backend API endpoint'i
    const apiUrl = 'http://localhost:8000/api/chat/chat'

    // Backend'e isteği ilet
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token
      },
      body: JSON.stringify(requestData)
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Ayrıştırılamayan hata' }))
      console.error("Chat API hatası:", {
        status: response.status,
        statusText: response.statusText,
        data: errorData
      })
      return NextResponse.json(
        { error: errorData.detail || 'API hatası' },
        { status: response.status }
      )
    }

    const data = await response.json()
    console.log("Chat API yanıtı:", data)
    return NextResponse.json(data)
  } catch (error) {
    console.error('Chat API hatası:', error)
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    )
  }
} 
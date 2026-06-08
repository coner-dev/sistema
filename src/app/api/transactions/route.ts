import { db } from '@/lib/db'
import { NextResponse } from 'next/server'
import { telegramService } from '@/lib/telegram'

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization')
    const token = authHeader?.replace('Bearer ', '')

    if (!token) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const user = await db.user.findFirst({ where: { sessionToken: token } })
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    let transactions
    if (user.role === 'admin') {
      transactions = await db.transaction.findMany({
        include: { user: { select: { id: true, name: true, email: true } } },
        orderBy: { createdAt: 'desc' },
      })
    } else {
      transactions = await db.transaction.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
      })
    }

    return NextResponse.json({ transactions })
  } catch (error) {
    console.error('Get transactions error:', error)
    return NextResponse.json({ error: 'Error al obtener transacciones' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization')
    const token = authHeader?.replace('Bearer ', '')

    if (!token) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const user = await db.user.findFirst({ where: { sessionToken: token } })
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { amount, reference, receiptUrl, notes } = body

    if (!amount || amount < 350) {
      return NextResponse.json({ error: 'La recarga mínima es de $350.00' }, { status: 400 })
    }

    if (!reference) {
      return NextResponse.json({ error: 'La referencia es obligatoria' }, { status: 400 })
    }

    const transaction = await db.transaction.create({
      data: {
        userId: user.id,
        type: 'deposit',
        amount,
        reference,
        receiptUrl: receiptUrl || null,
        notes: notes || null,
        status: 'pending',
      },
    })

    await telegramService.notifyNewDeposit(
      transaction.id,
      user.name,
      user.email,
      amount,
      reference
    )

    return NextResponse.json({ transaction })
  } catch (error) {
    console.error('Create transaction error:', error)
    await telegramService.notifyError(
      'Error al crear transacción',
      error instanceof Error ? error.message : 'Error desconocido',
      'POST /api/transactions'
    )
    return NextResponse.json({ error: 'Error al crear transacción' }, { status: 500 })
  }
}

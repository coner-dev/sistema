import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization')
    const token = authHeader?.replace('Bearer ', '')

    if (!token) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const admin = await db.user.findFirst({ where: { sessionToken: token } })
    if (!admin || admin.role !== 'admin') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }

    const users = await db.user.findMany({
      where: { role: 'user' },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        balance: true,
        isActive: true,
        createdAt: true,
        _count: {
          select: { orders: true, transactions: true },
        },
      },
    })

    return NextResponse.json({ users })
  } catch (error) {
    console.error('Get users error:', error)
    return NextResponse.json({ error: 'Error al obtener usuarios' }, { status: 500 })
  }
}

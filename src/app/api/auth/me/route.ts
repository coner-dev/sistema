import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization')
    const token = authHeader?.replace('Bearer ', '')

    if (!token) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const user = await db.user.findFirst({ where: { sessionToken: token } })
    if (!user) {
      return NextResponse.json({ error: 'Sesión inválida' }, { status: 401 })
    }

    if (!user.isActive) {
      return NextResponse.json({ error: 'Cuenta desactivada' }, { status: 403 })
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        role: user.role,
        balance: user.balance,
      },
    })
  } catch (error) {
    console.error('Auth me error:', error)
    return NextResponse.json({ error: 'Error de autenticación' }, { status: 500 })
  }
}

import { db } from '@/lib/db'
import { NextResponse } from 'next/server'
import { randomUUID } from 'crypto'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json({ error: 'Correo y contraseña son obligatorios' }, { status: 400 })
    }

    const user = await db.user.findUnique({ where: { email } })
    if (!user) {
      return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 })
    }

    if (user.password !== password) {
      return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 })
    }

    if (!user.isActive) {
      return NextResponse.json({ error: 'Tu cuenta ha sido desactivada' }, { status: 403 })
    }

    const sessionToken = randomUUID()
    await db.user.update({
      where: { id: user.id },
      data: { sessionToken },
    })

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        role: user.role,
        balance: user.balance,
      },
      token: sessionToken,
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ error: 'Error al iniciar sesión' }, { status: 500 })
  }
}

import { db } from '@/lib/db'
import { NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { telegramService } from '@/lib/telegram'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password, name, phone } = body

    if (!email || !password || !name) {
      return NextResponse.json({ error: 'Todos los campos son obligatorios' }, { status: 400 })
    }

    const existingUser = await db.user.findUnique({ where: { email } })
    if (existingUser) {
      return NextResponse.json({ error: 'El correo electrónico ya está registrado' }, { status: 400 })
    }

    const sessionToken = randomUUID()
    const user = await db.user.create({
      data: {
        email,
        password,
        name,
        phone: phone || null,
        sessionToken,
      },
    })

    await telegramService.notifyNewUser(email, name, phone)

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
    console.error('Register error:', error)
    await telegramService.notifyError(
      'Error al registrar usuario',
      error instanceof Error ? error.message : 'Error desconocido',
      'POST /api/auth/register'
    )
    return NextResponse.json({ error: 'Error al registrar usuario' }, { status: 500 })
  }
}

import { NextResponse } from 'next/server'
import { randomUUID } from 'crypto'

// En Vercel/Railway el filesystem es de solo lectura.
// Esta ruta convierte el archivo a base64 y devuelve un data URL,
// o puedes integrar un servicio externo como Cloudinary/S3.
// Por ahora devuelve un data URL para que el flujo no se rompa.
export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization')
    const token = authHeader?.replace('Bearer ', '')

    if (!token) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No se encontró archivo' }, { status: 400 })
    }

    // Validar tamaño (máx 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'El archivo no debe superar 5MB' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = buffer.toString('base64')
    const mimeType = file.type || 'image/png'
    const dataUrl = `data:${mimeType};base64,${base64}`

    // Generamos un ID único para referencia
    const fileId = randomUUID()

    return NextResponse.json({
      url: dataUrl,
      fileId,
      filename: file.name,
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Error al subir archivo' }, { status: 500 })
  }
}

# 🚀 Guía de Despliegue en Vercel + Dominio daxserdig.site

## Opción recomendada: Vercel + Neon (PostgreSQL gratis)

---

## PASO 1 — Crear base de datos PostgreSQL en Neon (GRATIS)

1. Ve a **https://neon.tech** y crea una cuenta gratuita
2. Crea un nuevo proyecto → ponle nombre: `dax-sistem`
3. Copia el **Connection String** que tiene este formato:
   ```
   postgresql://user:password@ep-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require
   ```
4. Guarda ese string, lo necesitarás en el Paso 3

---

## PASO 2 — Subir código a GitHub

```bash
git add .
git commit -m "fix: configuración para despliegue en Vercel"
git push origin main
```

---

## PASO 3 — Desplegar en Vercel

1. Ve a **https://vercel.com** → inicia sesión con GitHub
2. Clic en **"Add New Project"**
3. Selecciona el repositorio `dax` (o como se llame)
4. En la sección **"Environment Variables"** agrega estas 3 variables:

   | Variable | Valor |
   |---|---|
   | `DATABASE_URL` | `postgresql://user:pass@host/db?sslmode=require` (el de Neon) |
   | `NEXTAUTH_SECRET` | Genera uno en: https://generate-secret.vercel.app/32 |
   | `NEXTAUTH_URL` | `https://daxserdig.site` |

5. Clic en **"Deploy"** → espera ~3 minutos

---

## PASO 4 — Inicializar la base de datos (seed)

Una vez desplegado, llama al endpoint de seed para crear el admin y los servicios:

```bash
curl -X POST https://daxserdig.site/api/seed
```

O desde el navegador: abre **https://daxserdig.site/api/seed** con método POST (usa Postman o Thunder Client).

**Credenciales del admin creadas:**
- Email: `admin@dax.com`
- Password: `admin123`

> ⚠️ **IMPORTANTE:** Cambia la contraseña del admin después del primer login.

---

## PASO 5 — Configurar dominio daxserdig.site en Vercel

1. En Vercel → tu proyecto → **Settings → Domains**
2. Clic en **"Add Domain"**
3. Escribe: `daxserdig.site`
4. Vercel te dará registros DNS para configurar en tu proveedor de dominio:

   **Si tu dominio está en Namecheap / GoDaddy / Cloudflare:**
   
   Agrega estos registros DNS:
   ```
   Tipo: A
   Nombre: @
   Valor: 76.76.21.21
   
   Tipo: CNAME
   Nombre: www
   Valor: cname.vercel-dns.com
   ```

5. Espera 5-30 minutos para que propague el DNS
6. Vercel asignará SSL automáticamente ✅

---

## PASO 6 — Actualizar NEXTAUTH_URL con el dominio final

1. En Vercel → Settings → Environment Variables
2. Edita `NEXTAUTH_URL` → cambia a `https://daxserdig.site`
3. Haz un **Redeploy** (Deployments → clic en los 3 puntos → Redeploy)

---

## ✅ Resumen de archivos de configuración

| Archivo | Propósito |
|---|---|
| `vercel.json` | Comandos de build para Vercel |
| `railway.json` | Configuración para Railway (alternativa) |
| `nixpacks.toml` | Config de build para Railway |
| `.env.example` | Referencia de variables de entorno |
| `prisma/schema.prisma` | Esquema de base de datos |

---

## 🔧 Solución de problemas comunes

### Error: "PrismaClientInitializationError"
→ Verifica que `DATABASE_URL` esté correctamente configurada en Vercel

### Error: "NEXTAUTH_SECRET is not set"
→ Agrega la variable `NEXTAUTH_SECRET` en Vercel Environment Variables

### Error en build: "Module not found"
→ Ejecuta `npm install` localmente y haz push del `package-lock.json`

### La app carga pero no conecta a la BD
→ Asegúrate que el string de Neon tenga `?sslmode=require` al final

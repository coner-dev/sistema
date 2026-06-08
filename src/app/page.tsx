'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Home, FileText, Wallet, ShoppingCart, User, Users, Settings, LogOut, Menu, X,
  Search, Plus, Check, Ban, Clock, DollarSign, TrendingUp, Package, AlertCircle,
  ChevronRight, RefreshCw, Upload, Eye, Edit, Trash2, ArrowLeft, CreditCard,
  Banknote, Phone, Mail, Shield, ChevronDown, MessageCircle, Download, FileCheck, Loader2
} from 'lucide-react'

// ==================== TYPES ====================
interface Service {
  id: string
  name: string
  description?: string
  estimatedTime: string
  price: number
  category: string
  isActive: boolean
  sortOrder: number
  requiredFields?: string
}

interface UserInfo {
  id: string
  email: string
  name: string
  phone?: string
  role: string
  balance: number
}

interface Transaction {
  id: string
  userId: string
  type: string
  amount: number
  status: string
  reference?: string
  receiptUrl?: string
  notes?: string
  adminNotes?: string
  createdAt: string
  user?: { id: string; name: string; email: string }
}

interface Order {
  id: string
  userId: string
  serviceId: string
  status: string
  totalPrice: number
  notes?: string
  fieldValues?: string
  adminNotes?: string
  resultData?: string
  createdAt: string
  user?: { id: string; name: string; email: string }
  service?: { id: string; name: string; category: string; estimatedTime?: string }
}

interface AdminUser {
  id: string
  email: string
  name: string
  phone?: string
  balance: number
  isActive: boolean
  createdAt: string
  _count: { orders: number; transactions: number }
}

// ==================== API HELPERS ====================
const API_BASE = '/api'

async function apiFetch(path: string, options?: RequestInit) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('dax_token') : null
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Error en la solicitud')
  return data
}

async function apiUpload(file: File) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('dax_token') : null
  const formData = new FormData()
  formData.append('file', file)
  const res = await fetch(`${API_BASE}/upload`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Error al subir archivo')
  return data
}

// ==================== CATEGORY HELPERS ====================
const CATEGORY_LABELS: Record<string, string> = {
  actas: 'Actas',
  rfc: 'RFC',
  sat: 'SAT',
  credito: 'Burós de Crédito',
  imss: 'IMSS',
  infonavit: 'Infonavit',
  servicios: 'Servicios',
  general: 'General',
}

const CATEGORY_COLORS: Record<string, string> = {
  actas: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  rfc: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  sat: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  credito: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  imss: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  infonavit: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
  servicios: 'bg-teal-500/20 text-teal-400 border-teal-500/30',
  general: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  approved: 'bg-green-500/20 text-green-400 border-green-500/30',
  in_progress: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  completed: 'bg-green-500/20 text-green-400 border-green-500/30',
  rejected: 'bg-red-500/20 text-red-400 border-red-500/30',
  cancelled: 'bg-red-500/20 text-red-400 border-red-500/30',
}

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pendiente',
  approved: 'Aprobado',
  in_progress: 'En Proceso',
  completed: 'Exitoso',
  rejected: 'Rechazado',
  cancelled: 'Cancelado / Reembolso',
}

// ==================== SERVICE FIELDS ====================
interface FieldDef {
  key: string
  label: string
  type: 'text' | 'date' | 'email' | 'tel'
  required: boolean
  placeholder: string
}

const SERVICE_FIELDS: Record<string, FieldDef[]> = {
  'Acta de Nacimiento': [
    { key: 'curp', label: 'CURP', type: 'text', required: true, placeholder: 'Ej: ABCD123456HDFRF A09' },
  ],
  'Acta de Matrimonio': [
    { key: 'curp', label: 'CURP', type: 'text', required: true, placeholder: 'Ej: ABCD123456HDFRF A09' },
  ],
  'Acta de Divorcio': [
    { key: 'curp', label: 'CURP', type: 'text', required: true, placeholder: 'Ej: ABCD123456HDFRF A09' },
  ],
  'Acta de Defunción': [
    { key: 'curp', label: 'CURP', type: 'text', required: true, placeholder: 'Ej: ABCD123456HDFRF A09' },
  ],
  'RFC con IdCIF': [
    { key: 'curp', label: 'CURP', type: 'text', required: true, placeholder: 'Ej: ABCD123456HDFRF A09' },
    { key: 'nombreCompleto', label: 'Nombre completo', type: 'text', required: true, placeholder: 'Ej: Juan Pérez García' },
    { key: 'fechaNacimiento', label: 'Fecha de nacimiento', type: 'date', required: true, placeholder: '' },
  ],
  'RFC con CURP': [
    { key: 'curp', label: 'CURP', type: 'text', required: true, placeholder: 'Ej: ABCD123456HDFRF A09' },
  ],
  'Localización de IdCIF CURP': [
    { key: 'nombreCompleto', label: 'Nombre completo', type: 'text', required: true, placeholder: 'Ej: Juan Pérez García' },
    { key: 'fechaNacimiento', label: 'Fecha de nacimiento', type: 'date', required: true, placeholder: '' },
    { key: 'entidadFederativa', label: 'Entidad federativa de nacimiento', type: 'text', required: true, placeholder: 'Ej: Chiapas' },
  ],
  'Cita al SAT Primera Vez': [
    { key: 'curp', label: 'CURP', type: 'text', required: true, placeholder: 'Ej: ABCD123456HDFRF A09' },
    { key: 'email', label: 'Email', type: 'email', required: true, placeholder: 'Ej: correo@ejemplo.com' },
    { key: 'telefono', label: 'Teléfono', type: 'tel', required: true, placeholder: 'Ej: 5512345678' },
  ],
  'Cita al SAT Primera Vez Express': [
    { key: 'curp', label: 'CURP', type: 'text', required: true, placeholder: 'Ej: ABCD123456HDFRF A09' },
    { key: 'email', label: 'Email', type: 'email', required: true, placeholder: 'Ej: correo@ejemplo.com' },
    { key: 'telefono', label: 'Teléfono', type: 'tel', required: true, placeholder: 'Ej: 5512345678' },
  ],
  'Cita para la e.firma': [
    { key: 'rfc', label: 'RFC', type: 'text', required: true, placeholder: 'Ej: ABCD123456' },
    { key: 'curp', label: 'CURP', type: 'text', required: true, placeholder: 'Ej: ABCD123456HDFRF A09' },
    { key: 'email', label: 'Email', type: 'email', required: true, placeholder: 'Ej: correo@ejemplo.com' },
  ],
  'Cambio de Lugar y Fecha de Emisión': [
    { key: 'rfc', label: 'RFC', type: 'text', required: true, placeholder: 'Ej: ABCD123456' },
    { key: 'curp', label: 'CURP', type: 'text', required: true, placeholder: 'Ej: ABCD123456HDFRF A09' },
  ],
  'Cita para Cambio de Domicilio': [
    { key: 'rfc', label: 'RFC', type: 'text', required: true, placeholder: 'Ej: ABCD123456' },
    { key: 'curp', label: 'CURP', type: 'text', required: true, placeholder: 'Ej: ABCD123456HDFRF A09' },
  ],
  'Corrección de Datos': [
    { key: 'rfc', label: 'RFC', type: 'text', required: true, placeholder: 'Ej: ABCD123456' },
    { key: 'curp', label: 'CURP', type: 'text', required: true, placeholder: 'Ej: ABCD123456HDFRF A09' },
  ],
  'Burós de Crédito': [
    { key: 'nombreCompleto', label: 'Nombre completo', type: 'text', required: true, placeholder: 'Ej: Juan Pérez García' },
    { key: 'fechaNacimiento', label: 'Fecha de nacimiento', type: 'date', required: true, placeholder: '' },
    { key: 'rfcOCurp', label: 'RFC o CURP', type: 'text', required: true, placeholder: 'Ej: ABCD123456 o ABCD123456HDFRF A09' },
  ],
  'Burós de Crédito con Score': [
    { key: 'nombreCompleto', label: 'Nombre completo', type: 'text', required: true, placeholder: 'Ej: Juan Pérez García' },
    { key: 'fechaNacimiento', label: 'Fecha de nacimiento', type: 'date', required: true, placeholder: '' },
    { key: 'rfcOCurp', label: 'RFC o CURP', type: 'text', required: true, placeholder: 'Ej: ABCD123456 o ABCD123456HDFRF A09' },
  ],
  'Semanas Cotizadas': [
    { key: 'nssOCurp', label: 'NSS o CURP', type: 'text', required: true, placeholder: 'Ej: 12345678901 o ABCD123456HDFRF A09' },
  ],
  'Semanas Cotizadas Detalladas': [
    { key: 'nssOCurp', label: 'NSS o CURP', type: 'text', required: true, placeholder: 'Ej: 12345678901 o ABCD123456HDFRF A09' },
  ],
  'NSS': [
    { key: 'curp', label: 'CURP', type: 'text', required: true, placeholder: 'Ej: ABCD123456HDFRF A09' },
  ],
  'Constancia de Asignación de NSS': [
    { key: 'curp', label: 'CURP', type: 'text', required: true, placeholder: 'Ej: ABCD123456HDFRF A09' },
  ],
  'Certificado de Vigencia de Derechos': [
    { key: 'nss', label: 'NSS', type: 'text', required: true, placeholder: 'Ej: 12345678901' },
  ],
  'Constancia de Descuento': [
    { key: 'nss', label: 'NSS', type: 'text', required: true, placeholder: 'Ej: 12345678901' },
  ],
  'Estatus de Crédito': [
    { key: 'nss', label: 'NSS', type: 'text', required: true, placeholder: 'Ej: 12345678901' },
  ],
  'Estado de Cuenta Infonavit': [
    { key: 'nss', label: 'NSS', type: 'text', required: true, placeholder: 'Ej: 12345678901' },
  ],
  'Solicitud de Crédito Infonavit': [
    { key: 'nss', label: 'NSS', type: 'text', required: true, placeholder: 'Ej: 12345678901' },
  ],
}

// ==================== ANIMATION VARIANTS ====================
const staggerContainer = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
}

const staggerItem = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5 } },
}

// ==================== MAIN APP ====================
export default function App() {
  const [user, setUser] = useState<UserInfo | null>(null)
  const [services, setServices] = useState<Service[]>([])
  const [currentView, setCurrentView] = useState<'landing' | 'login' | 'register' | 'dashboard'>('landing')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const token = localStorage.getItem('dax_token')
    if (token) {
      apiFetch('/user/me')
        .then(setUser)
        .catch(() => localStorage.removeItem('dax_token'))
    }
    apiFetch('/services').then(setServices).catch(err => console.error(err))
  }, [])

  return (
    <div className="min-h-screen bg-black text-white">
      {currentView === 'landing' && (
        <LandingView
          onLogin={() => setCurrentView('login')}
          onRegister={() => setCurrentView('register')}
          services={services}
        />
      )}
      {currentView === 'login' && (
        <LoginView
          onLogin={(userData) => {
            setUser(userData)
            setCurrentView('dashboard')
          }}
          onBack={() => setCurrentView('landing')}
          onRegister={() => setCurrentView('register')}
        />
      )}
      {currentView === 'register' && (
        <RegisterView
          onRegister={(userData) => {
            setUser(userData)
            setCurrentView('dashboard')
          }}
          onBack={() => setCurrentView('landing')}
          onLogin={() => setCurrentView('login')}
        />
      )}
      {currentView === 'dashboard' && user && (
        <DashboardView
          user={user}
          services={services}
          onLogout={() => {
            localStorage.removeItem('dax_token')
            setUser(null)
            setCurrentView('landing')
          }}
          onRefreshUser={() => apiFetch('/user/me').then(setUser).catch(() => {})}
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
        />
      )}
    </div>
  )
}

type UserTab = 'inicio' | 'ordenes' | 'transacciones' | 'recargar'

function LandingView({ onLogin, onRegister, services }: { onLogin: () => void; onRegister: () => void; services: Service[] }) {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="fixed top-0 z-50 w-full border-b border-gray-800 bg-black/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image src="/logo.png" alt="DAX" width={32} height={32} />
            <span className="text-xl font-bold">DAX</span>
          </div>
          <div className="hidden md:flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={onLogin}>
              Iniciar sesión
            </Button>
            <Button size="sm" onClick={onRegister}>
              Crear cuenta
            </Button>
          </div>
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="w-6 h-6" />
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-600/10 to-transparent" />
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            className="text-center space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
              Tus trámites digitales,
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                simples y rápidos
              </span>
            </h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Realiza tus trámites de actas, RFC, SAT, IMSS e Infonavit desde la comodidad de tu hogar. 
              Sin filas, sin estrés, 100% en línea.
            </p>
            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center pt-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Button size="lg" onClick={onRegister} className="bg-blue-600 hover:bg-blue-700">
                Empezar ahora
              </Button>
              <Button size="lg" variant="outline" onClick={onLogin}>
                Ya tengo cuenta
              </Button>
            </motion.div>

            {/* Trust indicators */}
            <motion.div
              className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              {[
                { icon: Shield, label: 'Trámites seguros' },
                { icon: Clock, label: 'Respuesta rápida' },
                { icon: MessageCircle, label: 'Soporte por WhatsApp' },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2 text-gray-400">
                  <Icon className="w-4 h-4 text-blue-400" />
                  <span className="text-sm">{label}</span>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Stats */}
          <motion.div
            className="mt-16 grid grid-cols-3 gap-4 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            {[
              { value: '27+', label: 'Servicios' },
              { value: '8', label: 'Categorías' },
              { value: '24/7', label: 'Disponible' },
            ].map(stat => (
              <div key={stat.label} className="text-center rounded-xl border border-gray-800 bg-gray-900/50 backdrop-blur-sm py-5">
                <p className="text-2xl sm:text-3xl font-bold text-white">{stat.value}</p>
                <p className="text-gray-500 text-sm mt-1">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-4">¿Por qué elegir DAX?</h2>
          <p className="text-gray-400 max-w-xl mx-auto">Hacemos tus trámites simples, rápidos y confiables</p>
        </div>
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-3 gap-6"
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: '-80px' }}
        >
          {[
            { icon: Clock, title: 'Rápido y eficiente', desc: 'Procesamos tus solicitudes en el menor tiempo posible para que no esperes de más.' },
            { icon: Shield, title: 'Seguro y confiable', desc: 'Tus datos están protegidos. Manejamos tu información con la máxima confidencialidad.' },
            { icon: Wallet, title: 'Saldo a tu favor', desc: 'Recarga tu saldo y úsalo cuando quieras en cualquiera de nuestros servicios.' },
          ].map(({ icon: Icon, title, desc }) => (
            <motion.div key={title} variants={staggerItem}>
              <Card className="h-full bg-gray-900/80 backdrop-blur-sm border-gray-800 hover:border-blue-500/50 transition-all duration-300">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-blue-400" />
                  </div>
                  <h3 className="text-white font-semibold text-lg mb-2">{title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Services */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-4">Nuestros Servicios</h2>
          <p className="text-gray-400">Contamos con 27+ servicios en 8 categorías diferentes</p>
        </div>
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: '-80px' }}
        >
          {services.slice(0, 9).map((service) => (
            <motion.div key={service.id} variants={staggerItem}>
              <Card className="h-full bg-gray-900/80 backdrop-blur-sm border-gray-800 hover:border-blue-500/50 transition-all duration-300">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-white">{service.name}</CardTitle>
                      <Badge className={`mt-2 ${CATEGORY_COLORS[service.category] || CATEGORY_COLORS.general}`}>
                        {CATEGORY_LABELS[service.category] || service.category}
                      </Badge>
                    </div>
                    <Package className="w-5 h-5 text-blue-400" />
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-400">{service.description}</p>
                  <div className="flex items-center gap-2 mt-4 text-sm">
                    <Clock className="w-4 h-4 text-blue-400" />
                    <span className="text-gray-400">{service.estimatedTime}</span>
                  </div>
                </CardContent>
                <CardFooter>
                  <p className="text-lg font-bold text-blue-400">${service.price}</p>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-950 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Brand */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <Image src="/logo.png" alt="DAX" width={36} height={36} />
                <span className="text-xl font-bold text-white">DAX</span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed max-w-sm">
                Tu plataforma de trámites digitales. Realizamos tus gestiones de actas, RFC, SAT, IMSS e Infonavit de forma rápida y segura.
              </p>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-5">
                {[
                  { icon: Shield, label: 'Trámites seguros' },
                  { icon: Clock, label: 'Respuesta rápida' },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-2 text-gray-500 text-xs">
                    <Icon className="w-3.5 h-3.5 text-blue-400" />
                    <span>{label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick actions */}
            <div>
              <h4 className="text-white font-semibold text-sm mb-4">Plataforma</h4>
              <ul className="space-y-3">
                <li>
                  <button onClick={onRegister} className="text-gray-400 hover:text-blue-400 text-sm transition-colors">
                    Crear cuenta
                  </button>
                </li>
                <li>
                  <button onClick={onLogin} className="text-gray-400 hover:text-blue-400 text-sm transition-colors">
                    Iniciar sesión
                  </button>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-blue-400 text-sm transition-colors">
                    Nuestros servicios
                  </a>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-white font-semibold text-sm mb-4">Contacto</h4>
              <ul className="space-y-3">
                <li>
                  <a
                    href="https://wa.me/529613142550"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-gray-400 hover:text-green-400 text-sm transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Soporte por WhatsApp
                  </a>
                </li>
                <li className="flex items-center gap-2 text-gray-400 text-sm">
                  <Phone className="w-4 h-4" />
                  961 314 2550
                </li>
              </ul>
            </div>
          </div>

          <Separator className="my-8 bg-gray-800" />

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-gray-500 text-sm">© 2026 DAX Servicios Digitales. Todos los derechos reservados.</span>
            <div className="flex flex-wrap items-center gap-6 justify-center">
              <a
                href="https://politica.synkdata.online/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-blue-400 text-sm transition-colors"
              >
                Política de Privacidad
              </a>
              <a
                href="https://synkdata.online"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-300 transition-colors"
              >
                <span>Powered by</span>
                <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600 group-hover:from-blue-300 group-hover:to-blue-500 transition-all">
                  Synkdata.online
                </span>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

function LoginView({ onLogin, onBack, onRegister }: { onLogin: (user: UserInfo) => void; onBack: () => void; onRegister: () => void }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const data = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      })
      localStorage.setItem('dax_token', data.token)
      onLogin(data.user)
      toast({ title: 'Bienvenido', description: 'Has iniciado sesión correctamente' })
    } catch (err) {
      toast({ title: 'Error', description: (err as Error).message, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-black via-gray-900 to-black"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="w-full max-w-md">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="bg-gray-900/80 backdrop-blur-sm border-gray-800">
            <CardHeader className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Image src="/logo.png" alt="DAX" width={32} height={32} />
                  <span className="text-xl font-bold text-white">DAX</span>
                </div>
                <button onClick={onBack} className="p-1 hover:bg-gray-800 rounded">
                  <ArrowLeft className="w-5 h-5" />
                </button>
              </div>
              <CardTitle className="text-white">Iniciar sesión</CardTitle>
              <CardDescription>Accede a tu cuenta DAX</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="email" className="text-gray-200">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="tu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-gray-800 border-gray-700 text-white placeholder-gray-500"
                  />
                </div>
                <div>
                  <Label htmlFor="password" className="text-gray-200">Contraseña</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="bg-gray-800 border-gray-700 text-white placeholder-gray-500"
                  />
                </div>
                <Button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  {loading ? 'Iniciando...' : 'Iniciar sesión'}
                </Button>
              </form>
            </CardContent>
            <CardFooter className="flex flex-col space-y-2">
              <p className="text-sm text-gray-400 text-center">
                ¿No tienes cuenta?{' '}
                <button onClick={onRegister} className="text-blue-400 hover:text-blue-300 font-medium">
                  Regístrate
                </button>
              </p>
            </CardFooter>
          </Card>
        </motion.div>
        <div className="mt-8 flex items-center justify-center">
          <a
            href="https://synkdata.online"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-1.5 text-xs text-gray-600 hover:text-gray-400 transition-colors"
          >
            <span>Powered by</span>
            <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600 group-hover:from-blue-300 group-hover:to-blue-500 transition-all">
              Synkdata.online
            </span>
          </a>
        </div>
      </div>
    </motion.div>
  )
}

function RegisterView({ onRegister, onBack, onLogin }: { onRegister: (user: UserInfo) => void; onBack: () => void; onLogin: () => void }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const data = await apiFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, phone, password }),
      })
      localStorage.setItem('dax_token', data.token)
      onRegister(data.user)
      toast({ title: 'Bienvenido', description: 'Te has registrado correctamente' })
    } catch (err) {
      toast({ title: 'Error', description: (err as Error).message, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-black via-gray-900 to-black"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="w-full max-w-md">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="bg-gray-900/80 backdrop-blur-sm border-gray-800">
            <CardHeader className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Image src="/logo.png" alt="DAX" width={32} height={32} />
                  <span className="text-xl font-bold text-white">DAX</span>
                </div>
                <button onClick={onBack} className="p-1 hover:bg-gray-800 rounded">
                  <ArrowLeft className="w-5 h-5" />
                </button>
              </div>
              <CardTitle className="text-white">Crear cuenta</CardTitle>
              <CardDescription>Únete a DAX y comienza a tramitar</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name" className="text-gray-200">Nombre completo</Label>
                  <Input
                    id="name"
                    placeholder="Tu nombre"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="bg-gray-800 border-gray-700 text-white placeholder-gray-500"
                  />
                </div>
                <div>
                  <Label htmlFor="email" className="text-gray-200">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="tu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-gray-800 border-gray-700 text-white placeholder-gray-500"
                  />
                </div>
                <div>
                  <Label htmlFor="phone" className="text-gray-200">Teléfono</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+52 961 314 2550"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="bg-gray-800 border-gray-700 text-white placeholder-gray-500"
                  />
                </div>
                <div>
                  <Label htmlFor="password" className="text-gray-200">Contraseña</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="bg-gray-800 border-gray-700 text-white placeholder-gray-500"
                  />
                </div>
                <Button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  {loading ? 'Registrando...' : 'Crear cuenta'}
                </Button>
              </form>
            </CardContent>
            <CardFooter className="flex flex-col space-y-2">
              <p className="text-sm text-gray-400 text-center">
                ¿Ya tienes cuenta?{' '}
                <button onClick={onLogin} className="text-blue-400 hover:text-blue-300 font-medium">
                  Inicia sesión
                </button>
              </p>
            </CardFooter>
          </Card>
        </motion.div>
        <div className="mt-8 flex items-center justify-center">
          <a
            href="https://synkdata.online"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-1.5 text-xs text-gray-600 hover:text-gray-400 transition-colors"
          >
            <span>Powered by</span>
            <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600 group-hover:from-blue-300 group-hover:to-blue-500 transition-all">
              Synkdata.online
            </span>
          </a>
        </div>
      </div>
    </motion.div>
  )
}

function DashboardView({ user, services, onLogout, onRefreshUser, mobileMenuOpen, setMobileMenuOpen }: {
  user: UserInfo
  services: Service[]
  onLogout: () => void
  onRefreshUser: () => void
  mobileMenuOpen: boolean
  setMobileMenuOpen: (open: boolean) => void
}) {
  const [currentTab, setCurrentTab] = useState<UserTab>('inicio')
  const [orders, setOrders] = useState<Order[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    Promise.all([
      apiFetch('/orders').then(setOrders).catch(() => setOrders([])),
      apiFetch('/transactions').then(setTransactions).catch(() => setTransactions([])),
    ]).finally(() => setLoading(false))
  }, [currentTab])

  const userTabs: { id: UserTab; label: string; icon: React.ReactNode }[] = [
    { id: 'inicio', label: 'Inicio', icon: <Home className="w-4 h-4" /> },
    { id: 'ordenes', label: 'Mis Órdenes', icon: <ShoppingCart className="w-4 h-4" /> },
    { id: 'transacciones', label: 'Transacciones', icon: <CreditCard className="w-4 h-4" /> },
    { id: 'recargar', label: 'Recargar Saldo', icon: <Plus className="w-4 h-4" /> },
  ]

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="fixed top-0 z-40 w-full border-b border-gray-800 bg-black/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image src="/logo.png" alt="DAX" width={32} height={32} />
            <span className="text-xl font-bold text-white hidden sm:block">DAX</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={onLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Cerrar sesión</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="sm:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="pt-20 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Tab Navigation */}
        <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
          {userTabs.map((tab) => (
            <Button
              key={tab.id}
              variant={currentTab === tab.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCurrentTab(tab.id)}
              className="flex items-center gap-2 whitespace-nowrap"
            >
              {tab.icon}
              {tab.label}
            </Button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {currentTab === 'inicio' && <UserInicio user={user} onNavigate={setCurrentTab} />}
            {currentTab === 'ordenes' && <UserOrdenes orders={orders} />}
            {currentTab === 'transacciones' && <UserTransacciones transactions={transactions} />}
            {currentTab === 'recargar' && <UserRecargar user={user} onRefresh={onRefreshUser} />}
          </AnimatePresence>
        )}
      </main>

      {/* Credits */}
      <footer className="border-t border-gray-800 py-4">
        <div className="max-w-7xl mx-auto w-full px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span className="text-xs text-gray-600">© 2026 DAX Servicios Digitales</span>
          <a
            href="https://synkdata.online"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-300 transition-colors"
          >
            <span>Powered by</span>
            <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600 group-hover:from-blue-300 group-hover:to-blue-500 transition-all">
              Synkdata.online
            </span>
          </a>
        </div>
      </footer>
    </div>
  )
}

function UserInicio({ user, onNavigate }: { user: UserInfo; onNavigate: (tab: UserTab) => void }) {
  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="bg-gradient-to-br from-blue-600/20 to-cyan-600/20 border-blue-500/30 backdrop-blur-sm">
          <CardContent className="pt-6">
            <h1 className="text-3xl font-bold text-white mb-2">¡Bienvenido, {user.name}!</h1>
            <p className="text-gray-400">Gestiona tus trámites y servicios en un solo lugar</p>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        {[
          { label: 'Saldo disponible', value: `$${user.balance.toFixed(2)}`, icon: Wallet, action: () => onNavigate('recargar') },
          { label: 'Email', value: user.email, icon: Mail },
          { label: 'Teléfono', value: user.phone || 'No registrado', icon: Phone },
          { label: 'Rol', value: user.role === 'admin' ? 'Administrador' : 'Usuario', icon: User },
        ].map((item, i) => (
          <motion.div key={i} variants={staggerItem}>
            <Card className="bg-gray-900/80 border-gray-800 cursor-pointer hover:border-blue-500/50 transition-all" onClick={() => item.action?.()}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-2">
                  <item.icon className="w-5 h-5 text-blue-400" />
                </div>
                <p className="text-sm text-gray-400">{item.label}</p>
                <p className="text-xl font-bold text-white mt-1">{item.value}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}

function UserOrdenes({ orders }: { orders: Order[] }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <Card className="bg-gray-900/80 border-gray-800 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Mis Órdenes</CardTitle>
        </CardHeader>
        <CardContent>
          {orders.length === 0 ? (
            <p className="text-gray-400 text-center py-8">No tienes órdenes aún</p>
          ) : (
            <ScrollArea>
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-700 hover:bg-gray-800/50">
                    <TableHead className="text-gray-300">Servicio</TableHead>
                    <TableHead className="text-gray-300">Estado</TableHead>
                    <TableHead className="text-gray-300">Precio</TableHead>
                    <TableHead className="text-gray-300">Fecha</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id} className="border-gray-700 hover:bg-gray-800/50">
                      <TableCell className="text-gray-300">{order.service?.name}</TableCell>
                      <TableCell>
                        <Badge className={`${STATUS_COLORS[order.status] || STATUS_COLORS.pending}`}>
                          {STATUS_LABELS[order.status] || order.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-gray-300">${order.totalPrice.toFixed(2)}</TableCell>
                      <TableCell className="text-gray-300">{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}

function UserTransacciones({ transactions }: { transactions: Transaction[] }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <Card className="bg-gray-900/80 border-gray-800 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Transacciones</CardTitle>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <p className="text-gray-400 text-center py-8">No tienes transacciones aún</p>
          ) : (
            <ScrollArea>
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-700 hover:bg-gray-800/50">
                    <TableHead className="text-gray-300">Tipo</TableHead>
                    <TableHead className="text-gray-300">Monto</TableHead>
                    <TableHead className="text-gray-300">Estado</TableHead>
                    <TableHead className="text-gray-300">Fecha</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((transaction) => (
                    <TableRow key={transaction.id} className="border-gray-700 hover:bg-gray-800/50">
                      <TableCell className="text-gray-300 capitalize">{transaction.type}</TableCell>
                      <TableCell className="text-gray-300">${transaction.amount.toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge className={`${STATUS_COLORS[transaction.status] || STATUS_COLORS.pending}`}>
                          {STATUS_LABELS[transaction.status] || transaction.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-gray-300">{new Date(transaction.createdAt).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}

function UserRecargar({ user, onRefresh }: { user: UserInfo; onRefresh: () => void }) {
  const [amount, setAmount] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleRecharge = async () => {
    if (!amount || isNaN(Number(amount))) {
      toast({ title: 'Error', description: 'Ingresa un monto válido', variant: 'destructive' })
      return
    }

    setLoading(true)
    try {
      const data = await apiFetch('/transactions/create-recharge', {
        method: 'POST',
        body: JSON.stringify({ amount: Number(amount) }),
      })
      toast({ title: 'Éxito', description: 'Redirigiendo a PayPal...' })
      window.location.href = data.paypalLink
    } catch (err) {
      toast({ title: 'Error', description: (err as Error).message, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 bg-gray-900/80 border-gray-800 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Recargar Saldo</CardTitle>
            <CardDescription>Selecciona el monto a recargar a tu cuenta</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="amount" className="text-gray-200 mb-2 block">Monto (MXN)</Label>
              <Input
                id="amount"
                type="number"
                placeholder="500.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                step="0.01"
                min="10"
                className="bg-gray-800 border-gray-700 text-white placeholder-gray-500"
              />
              <p className="text-xs text-gray-500 mt-2">Mínimo: $10.00 MXN</p>
            </div>

            <div className="bg-gray-800/50 rounded-lg p-4">
              <p className="text-sm text-gray-400 mb-2">Monto a recargar:</p>
              <p className="text-2xl font-bold text-blue-400">${Number(amount || 0).toFixed(2)} MXN</p>
            </div>

            <Button
              onClick={handleRecharge}
              disabled={loading || !amount}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CreditCard className="w-4 h-4 mr-2" />}
              {loading ? 'Procesando...' : 'Continuar con PayPal'}
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/80 border-gray-800 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg">Información de tu Cuenta</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-xs text-gray-500 uppercase">Saldo Actual</p>
              <p className="text-2xl font-bold text-blue-400">${user.balance.toFixed(2)}</p>
            </div>
            <Separator className="bg-gray-700" />
            <div>
              <p className="text-xs text-gray-500 uppercase">Nombre</p>
              <p className="text-sm font-medium text-gray-200">{user.name}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase">Email</p>
              <p className="text-sm font-medium text-gray-200">{user.email}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  )
}

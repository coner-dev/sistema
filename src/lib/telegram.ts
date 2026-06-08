// lib/telegram.ts
// Notificaciones SOLO para ADMIN en DAX

export class TelegramAdminService {
  private botToken: string;
  private adminChatId: string;

  constructor() {
    this.botToken = process.env.TELEGRAM_BOT_TOKEN || '';
    this.adminChatId = process.env.TELEGRAM_CHAT_ID || '';

    if (!this.botToken || !this.adminChatId) {
      console.warn('⚠️ Telegram no configurado. Notificaciones desactivadas.');
    }
  }

  private async sendMessage(text: string): Promise<boolean> {
    try {
      const response = await fetch(`https://api.telegram.org/bot${this.botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: this.adminChatId,
          text: text,
          parse_mode: 'HTML',
        }),
      });

      if (!response.ok) {
        console.error('❌ Error Telegram:', response.statusText);
        return false;
      }

      return true;
    } catch (error) {
      console.error('❌ Error en notificación Telegram:', error);
      return false;
    }
  }

  // ============================================
  // 👤 NUEVO USUARIO REGISTRADO
  // ============================================
  async notifyNewUser(email: string, name: string, phone?: string) {
    const timestamp = new Date().toLocaleString('es-MX', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit', 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });

    const text = `
<b>✨ NUEVO REGISTRO EN DAX SISTEMA</b>

<b>👤 Información del Usuario</b>
${name && `<b>Nombre:</b> <code>${name}</code>\n`}${email && `<b>Correo:</b> <code>${email}</code>\n`}${phone ? `<b>Teléfono:</b> <code>${phone}</code>\n` : ''}<b>Registro:</b> ${timestamp}

<i>El usuario puede comenzar a usar la plataforma inmediatamente.</i>
    `;
    return this.sendMessage(text);
  }

  // ============================================
  // 📦 NUEVA ORDEN CREADA
  // ============================================
  async notifyNewOrder(
    orderId: string,
    userName: string,
    userEmail: string,
    serviceName: string,
    serviceCategory: string,
    price: number,
    estimatedTime: string
  ) {
    const timestamp = new Date().toLocaleString('es-MX', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit', 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });

    const text = `
<b>🎯 NUEVA ORDEN RECIBIDA</b>

<b>📋 Detalles de la Orden</b>
<b>ID Orden:</b> <code>${orderId}</code>
<b>Servicio:</b> ${serviceName}
<b>Categoría:</b> 🏷️ ${serviceCategory}

<b>💳 Información del Cliente</b>
<b>Nombre:</b> ${userName}
<b>Correo:</b> <code>${userEmail}</code>

<b>💰 Detalles Financieros</b>
<b>Costo:</b> <b>$${price.toFixed(2)} MXN</b>
<b>Tiempo Estimado:</b> ⏱️ ${estimatedTime}

<b>📊 Estado:</b> <u>⏳ Pendiente de procesamiento</u>
<b>Fecha:</b> ${timestamp}

<i>Accede al panel admin para más detalles.</i>
    `;
    return this.sendMessage(text);
  }

  // ============================================
  // 💸 NUEVO DEPÓSITO RECIBIDO
  // ============================================
  async notifyNewDeposit(
    transactionId: string,
    userName: string,
    userEmail: string,
    amount: number,
    reference: string
  ) {
    const timestamp = new Date().toLocaleString('es-MX', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit', 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });

    const text = `
<b>💰 NUEVO DEPÓSITO REGISTRADO</b>

<b>👤 Información del Cliente</b>
<b>Nombre:</b> ${userName}
<b>Correo:</b> <code>${userEmail}</code>

<b>💳 Detalles de la Transacción</b>
<b>ID Transacción:</b> <code>${transactionId}</code>
<b>Referencia:</b> <code>${reference}</code>
<b>Monto:</b> <b>$${amount.toFixed(2)} MXN</b>

<b>📊 Estado:</b> <u>⏳ Pendiente de aprobación</u>
<b>Fecha:</b> ${timestamp}

<b>✅ Acciones requeridas:</b>
• Verificar la referencia de pago
• Confirmar el monto recibido
• Aprobar o rechazar en el panel admin

<i>Accede al panel para gestionar esta transacción.</i>
    `;
    return this.sendMessage(text);
  }

  // ============================================
  // ⚠️ ERROR DEL SISTEMA
  // ============================================
  async notifyError(errorTitle: string, errorMessage: string, endpoint: string) {
    const timestamp = new Date().toLocaleString('es-MX', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit', 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });

    const text = `
<b>🚨 ALERTA: ERROR EN EL SISTEMA</b>

<b>⚡ Información del Error</b>
<b>Endpoint:</b> <code>${endpoint}</code>
<b>Tipo de Error:</b> <b>${errorTitle}</b>
<b>Mensaje:</b> 
<code>${errorMessage}</code>

<b>🕐 Hora del Error:</b> ${timestamp}

<b>⚠️ Acción requerida:</b>
Revisa los logs del servidor inmediatamente y toma las acciones necesarias para resolver el problema.

<i>Este es un error crítico que requiere atención urgente.</i>
    `;
    return this.sendMessage(text);
  }
}

// Exportar instancia singleton
export const telegramService = new TelegramAdminService();
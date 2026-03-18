# 📧 GUÍA DE CONFIGURACIÓN - SISTEMA DE CORREOS DARK LION

## 🎯 Resumen de lo Implementado

Se ha integrado un sistema completo de envío de correos de confirmación en el método `createClientAndDesign`. Los correos se envían automáticamente cuando se genera un nuevo pedido con:

- **Plantilla HTML profesional** con diseño formal y moderno
- **Tipografía personalizada**: Chakra Petch (título), Arboria (subtítulos), Montserrat (texto)
- **Colores corporativos**: Negro (#1a1a2e), Naranja (#f39c12), Blanco
- **Información del pedido** (folio, cantidad, tela, modelo, etc.)
- **Previsualización del diseño** subida por el cliente
- **Descargable**: Orden de producción en Excel

---

## 📁 ARCHIVOS CREADOS

### 1. **`src/config/emailConfig.ts`**
   - Configuración del transporte de Nodemailer
   - Conexión con Gmail SMTP
   - Verificación automática de conexión al iniciar

### 2. **`src/services/emailService.ts`**
   - Servicio de emisión de correos
   - Función `sendDesignConfirmationEmail()`
   - Soporte para plantilla HTML personalizable
   - Manejo de errores y logging

### 3. **`templates/email-template.html`**
   - Plantilla HTML receptiva (responsive)
   - Diseño profesional con gradientes
   - Estilos CSS incrustados
   - Variables para interpolación dinámica

### 4. **Modificaciones en `src/controllers/designController.ts`**
   - Importación del servicio de correo
   - Integración automática en `createClientAndDesign()`
   - Envío asincrónico sin bloquear la respuesta

---

## ⚙️ CONFIGURACIONES NECESARIAS

### Paso 1: Actualizar el archivo `.env`

Edita tu archivo `.env` en la raíz del proyecto y agrega/actualiza estas líneas:

```env
# Configuración de Correo (Gmail)
EMAIL_USER=darklionteamsoftware@gmail.com
EMAIL_PASS=tu_contraseña_de_aplicacion_aqui
```

### ⚠️ IMPORTANTE - Obtener Contraseña de Gmail

**Opción A: Usar Contraseña de Aplicación (Recomendado)**

1. Ve a [myaccount.google.com](https://myaccount.google.com)
2. En el menú izquierdo, selecciona **"Seguridad"**
3. Desplázate hacia abajo y habilita la **"Autenticación de dos factores"**
4. Vuelve a "Seguridad" y busca **"Contraseñas de aplicación"**
5. Selecciona:
   - Aplicación: **Mail**
   - Dispositivo: **Windows (o tu SO)**
6. Google generará una contraseña de 16 caracteres
7. **Copia esta contraseña en `.env` como `EMAIL_PASS`**

**Opción B: Si no puedes usar Contraseña de Aplicación**

Si tu cuenta no tiene la opción de "Contraseña de aplicación":
1. Ve a [myaccount.google.com/security](https://myaccount.google.com/security)
2. Busca **"Acceso de aplicaciones menos seguras"** y actívalo
3. Usa tu contraseña de Gmail directamente en `EMAIL_PASS`

---

## 🖼️ INTEGRACIÓN DEL LOGO

### Opción 1: Logo en Cloudinary (Recomendado)

Si tienes `logo.png` en una carpeta local `images/`:

1. Sube el logo a Cloudinary manualmente desde su dashboard
2. Copia la URL segura (ejemplo):
   ```
   https://res.cloudinary.com/dqnrsm5fs/image/upload/v1/darklion_logo.png
   ```
3. En `templates/email-template.html`, reemplaza la línea:
   ```html
   <img src="{{ logoUrl }}" alt="Dark Lion Logo" style="max-width: 100px;">
   ```
   
   Con tu URL de Cloudinary:
   ```html
   <img src="https://res.cloudinary.com/tu_cloud/image/upload/v1/logo.png" alt="Dark Lion Logo" style="max-width: 100px;">
   ```

### Opción 2: Logo en carpeta local

1. Copia `logo.png` a la carpeta `templates/`
2. Modifica la línea en `email-template.html`:
   ```html
   <img src="cid:logo" alt="Dark Lion Logo" style="max-width: 100px;">
   ```

3. En `src/services/emailService.ts`, actualiza la función `sendDesignConfirmationEmail()`:
   ```typescript
   const mailOptions = {
     from: process.env.EMAIL_USER || 'darklionteamsoftware@gmail.com',
     to: data.clientEmail,
     subject: `✅ Confirmación de Diseño - Folio: ${data.folio}`,
     html: htmlContent,
     attachments: [
       {
         filename: 'logo.png',
         path: path.join(process.cwd(), 'templates', 'logo.png'),
         cid: 'logo'
       }
     ]
   };
   ```

---

## 🎨 PERSONALIZAR TIPOGRAFÍA

La plantilla ya incluye las fuentes que solicitaste. Para mantenerlas o cambiarlas:

### Fuentes Actuales:
- **Chakra Petch**: Títulos principales y subtítulos
- **Arboria**: Subtítulos secundarios
- **Montserrat**: Texto normal y body

### Para cambiar fuentes en `email-template.html`:

Busca la sección `<style>` y modifica:

```css
/* Para títulos principales */
.header h1 {
    font-family: 'Chakra Petch', sans-serif;  /* ← Cambiar aquí */
}

/* Para subtítulos */
.order-details-title {
    font-family: 'Chakra Petch', sans-serif;  /* ← O aquí */
}

/* Para texto normal */
body {
    font-family: 'Montserrat', sans-serif;  /* ← O aquí */
}
```

---

## 🎯 FLUJO DE EMISIÓN DE CORREOS

```
1. Cliente sube imagen + datos en createClientAndDesign()
   ↓
2. Se crea: Cliente → Diseño → Documento
   ↓
3. Se sube imagen a Cloudinary
   ↓
4. Se genera Excel de orden de producción
   ↓
5. Se sube Excel a Cloudinary
   ↓
6. Se confirma la transacción
   ↓
7. Se emite evento WebSocket (new_order)
   ↓
8. Se envía Push Notification
   ↓
9. ⭐ SE ENVÍA CORREO DE CONFIRMACIÓN (AQUÍ) ⭐
   con todos los detalles del pedido
   ↓
10. Se retorna respuesta al cliente
```

---

## ✅ VERIFICACIÓN DE FUNCIONAMIENTO

### Prueba local:

1. **Compila el TypeScript**:
   ```bash
   npm run build
   ```

2. **Asegúrate de que `.env` esté configurado correctamente**

3. **Inicia el servidor**:
   ```bash
   npm start
   # o para desarrollo:
   npm run dev
   ```

4. **Monitorea los logs** para ver:
   ```
   ✅ Servidor de correo configurado correctamente
   ✅ Correo de confirmación enviado: <message-id>
   ```

5. **Realiza una solicitud POST** a `createClientAndDesign` con:
   - Imagen (multipart form-data)
   - Datos del cliente (name, email, phone_number)
   - Producto (id_product)
   - Tela y tallas

6. **Verifica tu buzón de correo** para recibir el correo con el diseño

### En caso de error:

**Si ves**: `⚠️ Error enviando correo de confirmación`

Revisa:
1. ¿`.env` tiene `EMAIL_USER` y `EMAIL_PASS` corretos?
2. ¿Gmail tiene habilitada la "Autenticación de dos factores"?
3. ¿La "Contraseña de aplicación" fue generada correctamente?
4. ¿El correo del cliente (`email`) es válido?

---

## 🔧 ESTRUCTURA DEL SERVICIO DE CORREO

### Función: `sendDesignConfirmationEmail(data)`

**Parámetros de entrada**:
```typescript
{
  clientName: string;           // Nombre del cliente
  clientEmail: string;          // Email para envío
  designId: number;             // ID del diseño en BD
  folio: string;                // Folio de orden (OP-YYYYMMDD-XXXX)
  productName: string;          // Nombre del producto
  model: string;                // Modelo
  fabricType: string;           // Tipo de tela
  totalQuantity: number;        // Cantidad total
  orderDate: string;            // Fecha en formato DD/MM/YYYY
  designImageUrl: string;       // URL de imagen en Cloudinary
  documentUrl: string;          // URL del Excel en Cloudinary
}
```

**Retorno**: `Promise<void>`

**Errores**: Capturados y logged, no afectan el flujo principal

---

## 📧 VARIABLES DE PLANTILLA

En `email-template.html`, usa estas variables que se reemplazarán automáticamente:

```html
{{ clientName }}      <!-- Nombre del cliente -->
{{ designId }}        <!-- ID del diseño -->
{{ folio }}           <!-- Folio de orden -->
{{ productName }}     <!-- Nombre del producto -->
{{ model }}           <!-- Modelo -->
{{ fabricType }}      <!-- Tipo de tela -->
{{ totalQuantity }}   <!-- Cantidad total -->
{{ orderDate }}       <!-- Fecha del pedido -->
{{ designImageUrl }}  <!-- URL de la imagen del diseño -->
{{ documentUrl }}     <!-- URL del Excel descargable -->
{{ logoUrl }}         <!-- URL del logo (si se configura) -->
```

---

## 🚀 OPCIONALES AVANZADOS

### Enviar a múltiples destinatarios:

En `src/services/emailService.ts`, modifica:

```typescript
const mailOptions = {
  from: process.env.EMAIL_USER,
  to: data.clientEmail,           // Cliente
  cc: 'admin@darklion.com',       // Copia a administrador
  bcc: 'logs@darklion.com',       // Copia oculta para auditoría
  subject: `✅ Confirmación de Diseño - Folio: ${data.folio}`,
  html: htmlContent,
};
```

### Agregar PDF adjunto:

```typescript
attachments: [
  {
    filename: 'orden_produccion.xlsx',
    path: 'ruta/al/archivo.xlsx'
  }
]
```

---

## 📝 NOTAS IMPORTANTES

- ✅ Los correos se envían **de forma asincrónica** (no bloquean la respuesta)
- ✅ Si hay error en el correo, **el pedido se crea de todas formas**
- ✅ Los errores de correo se loguean pero **no generan excepciones**
- ✅ La plantilla es **totalmente responsive** (móvil + escritorio)
- ✅ Usa **Google Fonts** (Chakra Petch, Montserrat) - no requiere instalación

---

## 🆘 SOPORTE

Si necesitas ayuda:
1. Verifica que el servidor de correo esté configurado (busca en logs: `✅ Servidor de correo`)
2. Prueba la credencial de Gmail en [Gmail SMTP Tester](https://tools.gmass.co/gmail-smtp-test)
3. Revisa los logs del servidor para mensajes de error específicos

---

**Última actualización**: 17 de Marzo, 2026
**Versión**: 1.0

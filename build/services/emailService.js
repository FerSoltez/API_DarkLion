"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendDesignConfirmationEmail = sendDesignConfirmationEmail;
const emailConfig_1 = __importDefault(require("../config/emailConfig"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
/**
 * Genera el HTML de la plantilla de correo con variables interpoladas
 */
function generateEmailHTML(data) {
    const templatePath = path.join(process.cwd(), 'templates', 'email-template.html');
    let htmlTemplate = '';
    // Intentar cargar la plantilla si existe
    if (fs.existsSync(templatePath)) {
        htmlTemplate = fs.readFileSync(templatePath, 'utf-8');
    }
    else {
        // Plantilla por defecto si no existe el archivo
        htmlTemplate = getDefaultEmailTemplate();
    }
    // Reemplazar variables en la plantilla
    htmlTemplate = htmlTemplate
        .replace(/{{\s*clientName\s*}}/g, data.clientName)
        .replace(/{{\s*designId\s*}}/g, data.designId.toString())
        .replace(/{{\s*folio\s*}}/g, data.folio)
        .replace(/{{\s*productName\s*}}/g, data.productName)
        .replace(/{{\s*model\s*}}/g, data.model)
        .replace(/{{\s*fabricType\s*}}/g, data.fabricType)
        .replace(/{{\s*totalQuantity\s*}}/g, data.totalQuantity.toString())
        .replace(/{{\s*orderDate\s*}}/g, data.orderDate)
        .replace(/{{\s*designImageUrl\s*}}/g, data.designImageUrl)
        .replace(/{{\s*documentUrl\s*}}/g, data.documentUrl);
    return htmlTemplate;
}
/**
 * Plantilla HTML por defecto (si no existe el archivo)
 */
function getDefaultEmailTemplate() {
    return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Confirmación de Diseño - Dark Lion</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Monserrat', sans-serif;
            background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
            padding: 20px;
            color: #333;
        }
        
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border-radius: 10px;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }
        
        /* Header */
        .header {
            background: linear-gradient(135deg, #1a1a2e 0%, #2d2d44 100%);
            padding: 40px 20px;
            text-align: center;
            border-bottom: 4px solid #f39c12;
        }
        
        .logo-section {
            display: flex;
            justify-content: center;
            margin-bottom: 20px;
        }
        
        .logo-section img {
            max-width: 150px;
            height: auto;
        }
        
        .header h1 {
            font-family: 'Chakra Petch', sans-serif;
            font-size: 32px;
            color: white;
            font-weight: 700;
            letter-spacing: 2px;
        }
        
        .header p {
            font-family: 'Arboria', sans-serif;
            font-size: 14px;
            color: #f39c12;
            margin-top: 8px;
            font-weight: 600;
        }
        
        /* Main Content */
        .content {
            padding: 40px 30px;
        }
        
        .greeting {
            font-size: 18px;
            color: #1a1a2e;
            margin-bottom: 25px;
            line-height: 1.6;
        }
        
        .greeting strong {
            color: #f39c12;
        }
        
        /* Order Details Box */
        .order-details {
            background: #f8f9fa;
            border-left: 4px solid #f39c12;
            padding: 20px;
            margin: 30px 0;
            border-radius: 5px;
        }
        
        .order-details-title {
            font-family: 'Arboria', sans-serif;
            font-size: 16px;
            color: #1a1a2e;
            font-weight: 700;
            margin-bottom: 15px;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        
        .detail-row {
            display: flex;
            justify-content: space-between;
            padding: 10px 0;
            border-bottom: 1px solid #e0e0e0;
            font-size: 14px;
        }
        
        .detail-row:last-child {
            border-bottom: none;
        }
        
        .detail-label {
            font-weight: 600;
            color: #2d2d44;
        }
        
        .detail-value {
            color: #f39c12;
            font-weight: 500;
        }
        
        /* Image Preview */
        .design-preview {
            margin: 30px 0;
            text-align: center;
        }
        
        .design-preview-title {
            font-family: 'Arboria', sans-serif;
            font-size: 14px;
            font-weight: 700;
            color: #1a1a2e;
            margin-bottom: 15px;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        
        .design-preview img {
            max-width: 100%;
            height: auto;
            border-radius: 8px;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
            max-height: 300px;
        }
        
        /* CTA Button */
        .cta-section {
            text-align: center;
            margin: 30px 0;
        }
        
        .btn {
            display: inline-block;
            padding: 14px 40px;
            background: linear-gradient(135deg, #f39c12 0%, #e67e22 100%);
            color: white;
            text-decoration: none;
            border-radius: 5px;
            font-weight: 600;
            font-size: 14px;
            transition: transform 0.3s, box-shadow 0.3s;
            box-shadow: 0 5px 15px rgba(243, 156, 18, 0.3);
            letter-spacing: 1px;
        }
        
        .btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(243, 156, 18, 0.4);
        }
        
        /* Message */
        .message {
            font-size: 14px;
            line-height: 1.8;
            color: #555;
            margin: 25px 0;
            text-align: center;
        }
        
        /* Footer */
        .footer {
            background: #1a1a2e;
            color: #bbb;
            text-align: center;
            padding: 25px;
            font-size: 12px;
            border-top: 1px solid #333;
        }
        
        .footer p {
            margin: 8px 0;
        }
        
        .footer a {
            color: #f39c12;
            text-decoration: none;
        }
        
        .footer a:hover {
            text-decoration: underline;
        }
        
        /* Responsive */
        @media (max-width: 600px) {
            .content {
                padding: 30px 20px;
            }
            
            .header h1 {
                font-size: 24px;
            }
            
            .detail-row {
                flex-direction: column;
            }
            
            .detail-label, .detail-value {
                display: block;
                margin-bottom: 5px;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <!-- Header -->
        <div class="header">
            <div class="logo-section">
                <img src="https://res.cloudinary.com/dqnrsm5fs/image/upload/v1/logo.png" alt="Dark Lion Logo">
            </div>
        </div>
        
        <!-- Main Content -->
        <div class="content">
            <div class="greeting">
                ¡Hola <strong>{{ clientName }}</strong>! 👋
            </div>
            
            <p style="font-size: 14px; line-height: 1.8; color: #555; margin-bottom: 20px;">
                Nos complace confirmar que hemos recibido exitosamente tu diseño y hemos generado tu orden de producción.
            </p>
            
            <!-- Order Details -->
            <div class="order-details">
                <div class="order-details-title">📋 Detalles de tu Pedido</div>
                
                <div class="detail-row">
                    <span class="detail-label">Folio:</span>
                    <span class="detail-value">{{ folio }}</span>
                </div>
                
                <div class="detail-row">
                    <span class="detail-label">ID Diseño:</span>
                    <span class="detail-value">{{ designId }}</span>
                </div>
                
                <div class="detail-row">
                    <span class="detail-label">Producto:</span>
                    <span class="detail-value">{{ productName }}</span>
                </div>
                
                <div class="detail-row">
                    <span class="detail-label">Modelo:</span>
                    <span class="detail-value">{{ model }}</span>
                </div>
                
                <div class="detail-row">
                    <span class="detail-label">Tipo de Tela:</span>
                    <span class="detail-value">{{ fabricType }}</span>
                </div>
                
                <div class="detail-row">
                    <span class="detail-label">Cantidad Total:</span>
                    <span class="detail-value">{{ totalQuantity }} unidades</span>
                </div>
                
                <div class="detail-row">
                    <span class="detail-label">Fecha del Pedido:</span>
                    <span class="detail-value">{{ orderDate }}</span>
                </div>
            </div>
            
            <!-- Design Preview -->
            <div class="design-preview">
                <div class="design-preview-title">🎨 Tu Diseño</div>
                <img src="{{ designImageUrl }}" alt="Diseño del Cliente">
            </div>
            
            <!-- CTA -->
            <div class="cta-section">
                <a href="{{ documentUrl }}" class="btn">📥 Descargar Orden de Producción</a>
            </div>
            
            <!-- Message -->
            <div class="message">
                <strong>¿Preguntas?</strong> Contáctanos a través de nuestros canales de atención al cliente. Estamos aquí para ayudarte.
            </div>
        </div>
        
        <!-- Footer -->
        <div class="footer">
            <p><strong>© 2026 Dark Lion - La fuerza de tus ideas</strong></p>
            <p>Diseños profesionales para tu negocio</p>
            <p>
                <a href="mailto:darklionteamsoftware@gmail.com">darklionteamsoftware@gmail.com</a> 
                | <a href="https://darklion.com">www.darklion.com</a>
            </p>
        </div>
    </div>
</body>
</html>
  `;
}
/**
 * Enviar correo de confirmación de diseño
 */
function sendDesignConfirmationEmail(data) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const htmlContent = generateEmailHTML(data);
            // Logo se encuentra en src/images/logo.png
            const logoPath = path.join(process.cwd(), 'src', 'images', 'logo.png');
            const mailOptions = {
                from: process.env.EMAIL_USER || 'darklionteamsoftware@gmail.com',
                to: data.clientEmail,
                subject: `✅ Confirmación de Diseño - Folio: ${data.folio}`,
                html: htmlContent,
                attachments: [],
            };
            // Incluir logo si existe
            if (fs.existsSync(logoPath)) {
                mailOptions.attachments.push({
                    filename: 'logo.png',
                    path: logoPath,
                    cid: 'logo',
                });
                console.log('✅ Logo incluido en el correo desde:', logoPath);
            }
            else {
                console.warn('⚠️ Advertencia: Logo no encontrado en', logoPath);
            }
            const info = yield emailConfig_1.default.sendMail(mailOptions);
            console.log('✅ Correo de confirmación enviado:', info.messageId);
        }
        catch (error) {
            console.error('❌ Error enviando correo de confirmación:', error.message);
            throw error;
        }
    });
}
exports.default = {
    sendDesignConfirmationEmail,
};

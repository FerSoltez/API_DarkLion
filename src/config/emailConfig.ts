import nodemailer from 'nodemailer';

// Crear transporte de Nodemailer configurado con Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || '',
    pass: process.env.EMAIL_PASS || '',
  },
});

// Verificar la conexión al iniciar
transporter.verify((error, success) => {
  if (error) {
    console.warn('⚠️ Advertencia de Email:', error.message);
  } else {
    console.log('✅ Servidor de correo configurado correctamente');
  }
});

export default transporter;

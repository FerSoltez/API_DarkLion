import { Request, Response } from 'express';
import webpush from 'web-push';
import { PushSubscription } from '../models/PushSubscription';

// Configurar VAPID keys desde variables de entorno
const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || '';
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || '';
const VAPID_EMAIL = process.env.VAPID_EMAIL || 'mailto:admin@darklion.com';

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(VAPID_EMAIL, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
}

const pushController = {
  // Obtener la clave pública VAPID (el frontend la necesita para suscribirse)
  getVapidPublicKey: async (_req: Request, res: Response) => {
    try {
      if (!VAPID_PUBLIC_KEY) {
        res.status(500).json({ message: 'VAPID_PUBLIC_KEY no configurada en el servidor' });
        return;
      }
      res.status(200).json({ publicKey: VAPID_PUBLIC_KEY });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  },

  // Registrar una suscripción push
  subscribe: async (req: Request, res: Response) => {
    try {
      const { endpoint, keys } = req.body;

      if (!endpoint || !keys || !keys.p256dh || !keys.auth) {
        res.status(400).json({ message: 'Faltan campos requeridos: endpoint, keys.p256dh, keys.auth' });
        return;
      }

      // Upsert: si el endpoint ya existe, actualizar las keys
      const existing = await PushSubscription.findOne({ where: { endpoint } });
      if (existing) {
        await PushSubscription.update(
          { p256dh: keys.p256dh, auth: keys.auth },
          { where: { endpoint } }
        );
        res.status(200).json({ message: 'Suscripción actualizada' });
      } else {
        await PushSubscription.create({
          endpoint,
          p256dh: keys.p256dh,
          auth: keys.auth,
        });
        res.status(201).json({ message: 'Suscripción registrada exitosamente' });
      }
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  },

  // Eliminar una suscripción push
  unsubscribe: async (req: Request, res: Response) => {
    try {
      const { endpoint } = req.body;

      if (!endpoint) {
        res.status(400).json({ message: 'Falta el campo endpoint' });
        return;
      }

      const deleted = await PushSubscription.destroy({ where: { endpoint } });
      if (deleted) {
        res.status(200).json({ message: 'Suscripción eliminada' });
      } else {
        res.status(404).json({ message: 'Suscripción no encontrada' });
      }
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  },
};

// Función helper para enviar push a TODOS los suscriptores
export async function sendPushToAll(title: string, body: string, data?: any): Promise<void> {
  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
    console.warn('VAPID keys no configuradas, no se enviarán push notifications');
    return;
  }

  const subscriptions = await PushSubscription.findAll();
  const payload = JSON.stringify({ title, body, data });

  const results = await Promise.allSettled(
    subscriptions.map(async (sub) => {
      const subData = sub.toJSON() as any;
      const pushSubscription = {
        endpoint: subData.endpoint,
        keys: {
          p256dh: subData.p256dh,
          auth: subData.auth,
        },
      };

      try {
        await webpush.sendNotification(pushSubscription, payload);
      } catch (error: any) {
        // Si la suscripción expiró o es inválida (410 Gone, 404), eliminarla
        if (error.statusCode === 410 || error.statusCode === 404) {
          await PushSubscription.destroy({ where: { endpoint: subData.endpoint } });
          console.log(`Suscripción expirada eliminada: ${subData.endpoint.slice(0, 50)}...`);
        }
        throw error;
      }
    })
  );

  const sent = results.filter(r => r.status === 'fulfilled').length;
  const failed = results.filter(r => r.status === 'rejected').length;
  console.log(`Push notifications: ${sent} enviadas, ${failed} fallidas`);
}

export default pushController;

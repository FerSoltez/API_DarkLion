"use strict";
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
exports.sendPushToAll = sendPushToAll;
const web_push_1 = __importDefault(require("web-push"));
const PushSubscription_1 = require("../models/PushSubscription");
// Configurar VAPID keys desde variables de entorno
const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || '';
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || '';
const VAPID_EMAIL = process.env.VAPID_EMAIL || 'mailto:admin@darklion.com';
if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
    web_push_1.default.setVapidDetails(VAPID_EMAIL, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
}
const pushController = {
    // Obtener la clave pública VAPID (el frontend la necesita para suscribirse)
    getVapidPublicKey: (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            if (!VAPID_PUBLIC_KEY) {
                res.status(500).json({ message: 'VAPID_PUBLIC_KEY no configurada en el servidor' });
                return;
            }
            res.status(200).json({ publicKey: VAPID_PUBLIC_KEY });
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }),
    // Registrar una suscripción push
    subscribe: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { endpoint, keys } = req.body;
            if (!endpoint || !keys || !keys.p256dh || !keys.auth) {
                res.status(400).json({ message: 'Faltan campos requeridos: endpoint, keys.p256dh, keys.auth' });
                return;
            }
            // Upsert: si el endpoint ya existe, actualizar las keys
            const existing = yield PushSubscription_1.PushSubscription.findOne({ where: { endpoint } });
            if (existing) {
                yield PushSubscription_1.PushSubscription.update({ p256dh: keys.p256dh, auth: keys.auth }, { where: { endpoint } });
                res.status(200).json({ message: 'Suscripción actualizada' });
            }
            else {
                yield PushSubscription_1.PushSubscription.create({
                    endpoint,
                    p256dh: keys.p256dh,
                    auth: keys.auth,
                });
                res.status(201).json({ message: 'Suscripción registrada exitosamente' });
            }
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }),
    // Eliminar una suscripción push
    unsubscribe: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { endpoint } = req.body;
            if (!endpoint) {
                res.status(400).json({ message: 'Falta el campo endpoint' });
                return;
            }
            const deleted = yield PushSubscription_1.PushSubscription.destroy({ where: { endpoint } });
            if (deleted) {
                res.status(200).json({ message: 'Suscripción eliminada' });
            }
            else {
                res.status(404).json({ message: 'Suscripción no encontrada' });
            }
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }),
};
// Función helper para enviar push a TODOS los suscriptores
function sendPushToAll(title, body, data) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
            console.warn('VAPID keys no configuradas, no se enviarán push notifications');
            return;
        }
        const subscriptions = yield PushSubscription_1.PushSubscription.findAll();
        const payload = JSON.stringify({ title, body, data });
        const results = yield Promise.allSettled(subscriptions.map((sub) => __awaiter(this, void 0, void 0, function* () {
            const subData = sub.toJSON();
            const pushSubscription = {
                endpoint: subData.endpoint,
                keys: {
                    p256dh: subData.p256dh,
                    auth: subData.auth,
                },
            };
            try {
                yield web_push_1.default.sendNotification(pushSubscription, payload);
            }
            catch (error) {
                // Si la suscripción expiró o es inválida (410 Gone, 404), eliminarla
                if (error.statusCode === 410 || error.statusCode === 404) {
                    yield PushSubscription_1.PushSubscription.destroy({ where: { endpoint: subData.endpoint } });
                    console.log(`Suscripción expirada eliminada: ${subData.endpoint.slice(0, 50)}...`);
                }
                throw error;
            }
        })));
        const sent = results.filter(r => r.status === 'fulfilled').length;
        const failed = results.filter(r => r.status === 'rejected').length;
        console.log(`Push notifications: ${sent} enviadas, ${failed} fallidas`);
    });
}
exports.default = pushController;

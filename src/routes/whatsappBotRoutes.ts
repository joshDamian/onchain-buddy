import express from 'express';
import WebhookController from '@/app/WhatsApp/WebhookController';

const whatsappBotRoutes = express.Router();

whatsappBotRoutes
    .post('/messages/webhook', WebhookController.receiveMessageWebhook)
    .get('/messages/webhook', WebhookController.messageWebHookVerification);

export default whatsappBotRoutes;

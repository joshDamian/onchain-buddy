import express from 'express';
import whatsappBotRoutes from './whatsappBotRoutes';
import alchemyNotifyRoutes from '@/routes/alchemyNotifyRoutes';

const apiRoutes = express
    .Router()
    .use('/whatsapp', whatsappBotRoutes)
    .use('/alchemy-notify', alchemyNotifyRoutes);

export default apiRoutes;

import env from '@/constants/env';
import axios from 'axios';
import { logServiceError } from '@/utils/logging';
import { logSync } from '@/resources/logger';

class BotApi {
    private static readonly CLOUD_API_URL = env.WA_CLOUD_API_URL;
    private static readonly CLOUD_API_ACCESS_TOKEN = env.WA_CLOUD_ACCESS_TOKEN;

    private static getRequestConfig() {
        return {
            headers: {
                accept: 'application/json',
                'content-type': 'application/json',
                Authorization: `Bearer ${this.CLOUD_API_ACCESS_TOKEN}`,
            },
        };
    }

    public static async sendWhatsappMessage(businessPhoneNumberId: string, data: object) {
        const endpoint = `${businessPhoneNumberId}/messages`;

        try {
            const requestOptions = this.getRequestConfig();
            const response = await axios.post(
                `${this.CLOUD_API_URL}/${endpoint}`,
                data,
                requestOptions
            );
        } catch (error) {
            await logServiceError(error, 'Error sending message');
            throw error;
        }
    }

    public static async markMassageAsRead(businessPhoneNumberId: string, messageId: string) {
        const endpoint = `${businessPhoneNumberId}/messages`;
        const data = {
            messaging_product: 'whatsapp',
            status: 'read',
            message_id: messageId,
        };

        try {
            const requestOptions = this.getRequestConfig();
            const response = await axios.post(
                `${this.CLOUD_API_URL}/${endpoint}`,
                data,
                requestOptions
            );

            logSync('debug', 'Message marked as read successfully:', response.data); // Handle successful response (optional)
        } catch (error) {
            await logServiceError(error, 'Error marking message as read:');
        }
    }
}

export default BotApi;

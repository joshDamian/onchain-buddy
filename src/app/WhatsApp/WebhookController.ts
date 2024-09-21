import { Request, Response } from 'express';
import { OK } from '@/constants/status-codes';
import { logSync } from '@/resources/logger';
import { handleRequestError } from '@/utils/logging';
import BotApi from '@/app/WhatsApp/BotApi/BotApi';
import { Message, WebhookRequestBody, WhatsAppMessageType } from '@/app/WhatsApp/types';
import env from '@/constants/env';
import BotCommandHandler from '@/app/WhatsApp/BotCommands/BotCommandHandler';

class WebhookController {
    public static async receiveMessageWebhook(req: Request, res: Response) {
        try {
            res.sendStatus(OK);
            logSync('debug', 'Original Body Received', {
                webhookBody: req.body,
            });

            const messageParts = this.extractStringMessageParts(req.body);

            const { message, displayName, businessPhoneNumberId } = messageParts;

            if (message?.id) {
                await BotApi.markMassageAsRead(businessPhoneNumberId, message.id);
            }

            logSync('debug', 'Extracted message parts', {
                messageParts,
            });

            if (message && message.id && businessPhoneNumberId && displayName) {
                await this.messageTypeCheck(message, businessPhoneNumberId, displayName);
            } else {
                logSync('debug', 'Message object not found');
            }
        } catch (error) {
            handleRequestError(error, res, true);
        }
    }

    public static async messageWebHookVerification(req: Request, res: Response) {
        const mode = req.query['hub.mode'];
        const token = req.query['hub.verify_token'];
        const challenge = req.query['hub.challenge'];

        // check the mode and token sent are correct
        if (mode === 'subscribe' && token === env.WA_WEBHOOK_VERIFY_TOKEN) {
            // respond with 200 OK and challenge token from the request
            res.status(200).send(challenge);
            logSync('info', 'Webhook verified successfully!');
        } else {
            // respond with '403 Forbidden' if verify tokens do not match
            res.sendStatus(403);
        }
    }

    private static extractStringMessageParts(requestBody: WebhookRequestBody) {
        const firstEntry = requestBody.entry![0] ?? undefined;

        const firstChange = firstEntry?.changes![0];

        const firstChangeValue = firstChange?.value;

        if (!firstChangeValue) {
            logSync('info', 'Un-extracted request body', requestBody);

            return {};
        }

        if (!firstChangeValue.metadata || !firstChangeValue.metadata.phone_number_id) {
            logSync('info', 'No phone number id found in request body', {
                firstChangeValue,
            });

            return {};
        }

        const businessPhoneNumberId = firstChangeValue.metadata.phone_number_id;

        if (!firstChangeValue.messages) {
            logSync('info', 'No messages found in request body', {
                firstChangeValue,
            });

            return {};
        }

        const message = firstChangeValue.messages[0];

        const displayName = firstChangeValue.contacts[0].profile.name;

        return { businessPhoneNumberId, message, displayName };
    }

    public static async messageTypeCheck(
        message: Message,
        businessPhoneNumberId: string,
        displayName: string
    ) {
        const { type, from, text, interactive } = message;

        logSync('debug', `message data type: ${typeof message}`, {
            message,
        });

        const phoneParams = { userPhoneNumber: from, businessPhoneNumberId };

        // ============== HANDLE TEXT MESSAGES ============== //
        if (type === WhatsAppMessageType.TEXT) {
            const botCommand = BotCommandHandler.isCommand(text.body);

            // Handle bot commands
            if (botCommand) {
                const response = await BotCommandHandler.handlePossibleCommand(
                    text.body.toLowerCase(),
                    phoneParams,
                    displayName
                );

                if (response.handled) {
                    return;
                }
            }
        }
    }
}

export default WebhookController;

const { Telegraf } = require('telegraf');
const cron = require('node-cron');
const fs = require('fs');
const path = require('path');

class TelegramBotManager {
    constructor() {
        this.bot = new Telegraf(global.telegramBotToken);
        this.pairingRequests = new Map();
        this.whatsappStatus = '🔴 Disconnected';
        this.setupHandlers();
    }

    setupHandlers() {
        // Start command
        this.bot.start((ctx) => {
            ctx.reply(
                `🤖 *DARK MD Bot Manager*\n\n` +
                `*Available Commands:*\n` +
                `/reqpair <number> - Request WhatsApp pairing code\n` +
                `/delpair <number> - Delete pairing request\n` +
                `/status - Check WhatsApp connection status\n` +
                `/owner - Contact owner\n` +
                `/help - Show this menu\n\n` +
                `*Example:* /reqpair 2347030626048`,
                { parse_mode: 'Markdown' }
            );
        });

        // Help command
        this.bot.command('help', (ctx) => {
            ctx.reply(
                `📖 *DARK MD Bot Help*\n\n` +
                `*Pairing Instructions:*\n` +
                `1. Use /reqpair with your WhatsApp number\n` +
                `2. Wait for the pairing code\n` +
                `3. Open WhatsApp → Settings → Linked Devices\n` +
                `4. Tap "Link a Device" and enter the code\n\n` +
                `*Number Format:*\n` +
                `• With country code, no + symbol\n` +
                `• Example: 2347030626048 (Nigeria)\n` +
                `• Example: 1234567890 (US)\n\n` +
                `*Commands:*\n` +
                `/reqpair - Get pairing code\n` +
                `/status - Check connection\n` +
                `/owner - Contact info`,
                { parse_mode: 'Markdown' }
            );
        });

        // Request pairing code
        this.bot.command('reqpair', (ctx) => {
            const userId = ctx.from.id;
            const number = ctx.message.text.split(' ')[1];
            
            if (!number) {
                return ctx.reply(
                    '❌ *Usage:* /reqpair <phone-number>\n' +
                    '*Example:* /reqpair 2347030626048\n\n' +
                    '📱 Include country code without +',
                    { parse_mode: 'Markdown' }
                );
            }

            // Validate number format
            const cleanNumber = number.replace(/[^0-9]/g, '');
            if (cleanNumber.length < 10) {
                return ctx.reply('❌ Invalid phone number format. Include country code.\n*Example:* 2347030626048', { parse_mode: 'Markdown' });
            }

            // Check if already exists
            if (this.pairingRequests.has(cleanNumber)) {
                return ctx.reply('⏳ Pairing request already pending for this number. Please wait...');
            }

            // Store pairing request
            this.pairingRequests.set(cleanNumber, {
                telegramUserId: userId,
                username: ctx.from.username || ctx.from.first_name,
                timestamp: Date.now(),
                status: 'pending'
            });

            ctx.reply(
                `✅ *Pairing Request Received*\n\n` +
                `📱 *Number:* ${cleanNumber}\n` +
                `⏰ *Status:* Processing...\n\n` +
                `Please wait while we generate your pairing code...`,
                { parse_mode: 'Markdown' }
            );

            // Emit event for main bot to handle
            if (global.telegramPairingEmitter) {
                global.telegramPairingEmitter.emit('pairingRequest', cleanNumber);
            }
        });

        // Delete pairing request
        this.bot.command('delpair', (ctx) => {
            const number = ctx.message.text.split(' ')[1];
            if (!number) {
                return ctx.reply('❌ Usage: /delpair <phone-number>\nExample: /delpair 2347030626048');
            }

            const cleanNumber = number.replace(/[^0-9]/g, '');
            if (this.pairingRequests.has(cleanNumber)) {
                this.pairingRequests.delete(cleanNumber);
                ctx.reply(`✅ Pairing request deleted for: *${cleanNumber}*`, { parse_mode: 'Markdown' });
            } else {
                ctx.reply('❌ No active pairing request found for this number.');
            }
        });

        // Owner info - Updated with Telegram username
        this.bot.command('owner', (ctx) => {
            ctx.reply(
                `👨‍💻 *Bot Owner Information*\n\n` +
                `• *Name:* 𝐂𝐎𝐃𝐄𝐁𝐑𝐄𝐀𝐊𝐄𝐑\n` +
                `• *Telegram:* [@devemps](https://t.me/devemps)\n` +
                `• *WhatsApp:* +2347030626048\n` +
                `• *GitHub:* C0D3-BR34K3R001\n` +
                `• *Bot:* DARK MD WhatsApp Bot\n\n` +
                `💬 *Contact me on Telegram for support!*`,
                { 
                    parse_mode: 'Markdown',
                    disable_web_page_preview: true
                }
            );
        });

        // Status command - Shows WhatsApp connection status
        this.bot.command('status', (ctx) => {
            const activeRequests = this.pairingRequests.size;
            ctx.reply(
                `📊 *DARK MD Bot Status*\n\n` +
                `• *WhatsApp:* ${this.whatsappStatus}\n` +
                `• *Active Pairing Requests:* ${activeRequests}\n` +
                `• *Telegram Bot:* Online ✅\n` +
                `• *Version:* ${global.version || '1.0.0'}\n\n` +
                `💡 Use /reqpair to get pairing code`,
                { parse_mode: 'Markdown' }
            );
        });

        // Clean up old requests every 30 minutes
        cron.schedule('*/30 * * * *', () => {
            const now = Date.now();
            let cleaned = 0;
            for (const [number, request] of this.pairingRequests.entries()) {
                if (now - request.timestamp > 1800000) { // 30 minutes
                    this.pairingRequests.delete(number);
                    cleaned++;
                    
                    // Notify user if possible
                    if (request.telegramUserId) {
                        try {
                            this.bot.telegram.sendMessage(
                                request.telegramUserId,
                                `⏰ *Pairing Request Expired*\n\nYour pairing request for *${number}* has expired after 30 minutes.\n\nUse /reqpair to request a new code.`,
                                { parse_mode: 'Markdown' }
                            );
                        } catch (error) {
                            // Ignore errors for expired requests
                        }
                    }
                }
            }
            if (cleaned > 0) {
                console.log(`🧹 Cleaned ${cleaned} expired pairing requests`);
            }
        });
    }

    // Method to send pairing code to Telegram
    async sendPairingCode(phoneNumber, pairingCode) {
        const request = this.pairingRequests.get(phoneNumber);
        if (request && request.telegramUserId) {
            try {
                await this.bot.telegram.sendMessage(
                    request.telegramUserId,
                    `🔐 *Pairing Code Generated!*\n\n` +
                    `📱 *Phone:* ${phoneNumber}\n` +
                    `🔢 *Code:* \`${pairingCode}\`\n\n` +
                    `*📲 How to Use:*\n` +
                    `1. Open WhatsApp\n` +
                    `2. Go to Settings → Linked Devices\n` +
                    `3. Tap "Link a Device"\n` +
                    `4. Enter this code\n\n` +
                    `⏰ *Code expires in 30 minutes*\n\n` +
                    `❓ *Need help?* Contact [@devemps](https://t.me/devemps)`,
                    { 
                        parse_mode: 'Markdown',
                        reply_markup: {
                            inline_keyboard: [[
                                { text: "🔄 Request New Code", callback_data: `req_new_${phoneNumber}` },
                                { text: "📞 Contact Owner", url: "https://t.me/devemps" }
                            ]]
                        }
                    }
                );
                
                // Update status
                request.status = 'sent';
                request.code = pairingCode;
                request.sentAt = Date.now();
                
                console.log(`✅ Pairing code sent via Telegram for: ${phoneNumber}`);
                return true;
            } catch (error) {
                console.error('❌ Failed to send pairing code via Telegram:', error);
                return false;
            }
        }
        return false;
    }

    // Update WhatsApp connection status
    updateWhatsAppStatus(status) {
        this.whatsappStatus = status;
        console.log(`📱 WhatsApp status updated: ${status}`);
    }

    // Handle callback queries
    setupCallbacks() {
        this.bot.on('callback_query', (ctx) => {
            const data = ctx.callbackQuery.data;
            if (data.startsWith('req_new_')) {
                const phoneNumber = data.replace('req_new_', '');
                ctx.reply(`🔄 New pairing code requested for: ${phoneNumber}\n\nProcessing...`);
                
                // Emit new request
                if (global.telegramPairingEmitter) {
                    global.telegramPairingEmitter.emit('pairingRequest', phoneNumber);
                }
            }
            ctx.answerCbQuery();
        });
    }

    start() {
        this.setupCallbacks();
        
        this.bot.launch().then(() => {
            console.log('🤖 Telegram Bot Started Successfully');
            console.log('💬 Users can now use /start to begin');
        }).catch(error => {
            console.error('❌ Failed to start Telegram bot:', error);
        });

        // Enable graceful stop
        process.once('SIGINT', () => this.bot.stop('SIGINT'));
        process.once('SIGTERM', () => this.bot.stop('SIGTERM'));
    }
}

module.exports = TelegramBotManager;

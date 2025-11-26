const fs = require("fs")
const os = require('os')
const { runtime } = require('../lib/function')
const speed = require('performance-now')
const moment = require("moment-timezone")

let handler = async (m, { v8, pushname, prefix }) => {
    let timestamp = speed();
    let latensi = speed() - timestamp;
    let menuText = `
╭ *𓊈 DARK XD𓊉*
│➪ User: ${pushname}
│➪ Time: ${moment().tz('Asia/Jakarta').format('HH:mm:ss')}
│➪ Runtime: ${runtime(process.uptime())}
│➪ Mode: ${v8.public ? 'Public' : 'Self'}
│➪ Prefix: ${prefix}
│➪ Bot Name: 𝐃𝐀𝐑𝐊 𝐌𝐃
│➪ Commands: ${Object.keys(global.db.commands || {}).length}
╰𓊈

╭ 𓊈AI𓊉
│➪ .ai
│➪ .gpt3
│➪ .openai
╰𓊈

╭ 𓊈USER𓊉
│➪ .autoread
│➪ .owner
│➪ .ping
│➪ .delete
│➪ .block
│➪ .autorecording
│➪ .autoreact
│➪ .self
│➪ .antibadword
│➪ .unblock
│➪ .public
│➪ .take
│➪ .autoviewstatus
│➪ .autoptyping
│➪ .setpp
│➪ .autobio
│➪ .ban
│➪ .status
│➪ .autoreply
╰𓊈

╭ 𓊈DOWNLOAD𓊉
│➪ .pdftotext
│➪ .movie
│➪ .qrcode
│➪ .tomp4
│➪ .say
│➪ .toimg
│➪ .vv2
│➪ .tomp3
│➪ .tiktok
│➪ .shorturl
│➪ .tgstickers
│➪ .tourl
│➪ .url
│➪ .vv
│➪ .lyrics
│➪ .play
│➪ .ytmp3
│➪ .mediafire
│➪ .ytmp4
│➪ .imbd
│➪ .tts
│➪ .fbdl
│➪ .ytsearch
│➪ .igdl
│➪ .apk
│➪ .play2
│➪ .spotify
╰𓊈

╭ 𓊈GROUP𓊉
│➪ .add
│➪ .antilink
│➪ .closetime
│➪ .creategroup
│➪ .demote
│➪ .grouplink
│➪ .hidetag
│➪ .join
│➪ .vcf
│➪ .kick
│➪ .kickadmins
│➪ .kickall
│➪ .listadmins
│➪ .listonline
│➪ .opentime
│➪ .promote
│➪ .resetlink
│➪ .tag
│➪ .tagall
│➪ .welcome
│➪ .unmute
│➪ .left
╰𓊈

╭ 𓊈UTILITY𓊉
│➪ .book
│➪ .calculate
│➪ .currency
│➪ .dictionary
│➪ .genpass
│➪ .getpp
│➪ .horoscope
│➪ .idch
│➪ .iplookup
│➪ .jid
│➪ .myip
│➪ .qc
│➪ .readqr
│➪ .recipe
│➪ .remind
│➪ .sciencefact
│➪ .time
│➪ .gitclone
│➪ .profile
│➪ .readmore
│➪ .weather
│➪ .calculator
╰𓊈

╭ 𓊈STALK𓊉
│➪ .npmstalk
│➪ .ffstalk
╰𓊈

╭ 𓊈SHOP𓊉
│➪ .hacks
│➪ .aza
╰𓊈

╭ 𓊈PAIR𓊉
│➪ .pair
│➪ .delpair
╰❍
`

    // Send menu text
    await m.reply(menuText)

    // Play MP3 after sending menu
    try {
        const mp3Path = './src/vn/menu.mp3'
        if (fs.existsSync(mp3Path)) {
            console.log('Playing menu MP3 from: ./src/vn/menu.mp3')
            await v8.sendMessage(m.chat, { 
                audio: fs.readFileSync(mp3Path), 
                mimetype: 'audio/mpeg',
                ptt: false 
            }, { quoted: m })
        } else {
            console.log('MP3 file not found at: ./src/vn/menu.mp3')
        }
    } catch (audioError) {
        console.log('Error playing menu audio:', audioError)
    }
}

handler.command = ["menu", "help", "commands", "start"]

module.exports = handler
const fs = require('fs');
const chalk = require('chalk');

// Bot Settings
global.owner = '2347030626048'
global.owner2 = '2347030626048'
global.nameCreator = "𝐂𝐎𝐃𝐄𝐁𝐑𝐄𝐀𝐊𝐄𝐑"
global.version = "1.0.0"
global.botVersion = "V.1"
global.ownerName = '𝐂𝐎𝐃𝐄𝐁𝐑𝐄𝐀𝐊𝐄𝐑'
global.packname = '𝐂𝐎𝐃𝐄𝐁𝐑𝐄𝐀𝐊𝐄𝐑'
global.botName = '𝐂𝐎𝐃𝐄𝐁𝐑𝐄𝐀𝐊𝐄𝐑'
global.botName2 = '𝐂𝐎𝐃𝐄𝐁𝐑𝐄𝐀𝐊𝐄𝐑'

// Telegram Bot Settings
global.telegramBotToken = "8415816270:AAFxcLS8c7Zd3rStEG3DuwxSf7LKqqVt9UA" // Get from @BotFather

global.inviteLink = "https://whatsapp.com/channel/0029VbBQODd3LdQZcDSbMf0e"
global.imageUrl = "https://files.catbox.moe/1fpbzo.png"

global.databasePath = 'database.json'
global.pairing_code = true; // Enable pairing code

// Link Settings
global.ownerLink = "https://wa.me/2347030626048"
global.groupLink = "https://whatsapp.com/channel/0029VbBQODd3LdQZcDSbMf0e"
global.groupLink2 = "https://whatsapp.com/channel/0029VbBQODd3LdQZcDSbMf0e"

// Delay Settings (1000 = 1 second)
global.delayJpm = 3500
global.delayContactPush = 6000
global.panelCreateDelay = 600000

// Channel Settings
global.channelLink = "https://whatsapp.com/channel/0029VbBQODd3LdQZcDSbMf0e"
global.channelId = "120363297700623532@newsletter"
global.channelName = "𝐃𝐀𝐑𝐊 𝐌𝐃-𝐕𝟏 𝐛𝐲 𝐂𝐎𝐃𝐄𝐁𝐑𝐄𝐀𝐊𝐄𝐑"

global.merchantIdQuotaOrder = "-"
global.apiQuotaOrder = "-"
global.qrisQuotaOrder = "-"

// Payment Settings
global.dana = "7030626048"
global.ovo = "OPAY"
global.gopay = "7030626048"
global.qris = ""

global.token_do = ""
// Pterodactyl Panel API Settings
global.egg = "15" // Egg ID
global.nestId = "5" // Nest ID
global.location = "1" // Location ID
global.domain = "Domain"
global.apiKey = "_" //ptla
global.clientApiKey = "_" //ptlc

// Pterodactyl Panel API Settings Server 2
global.eggV2 = "15" // Egg ID
global.nestIdV2 = "5" // Nest ID
global.locationV2 = "1" // Location ID
global.domainV2 = "domain2"
global.apiKeyV2 = "ptla2" //ptla
global.clientApiKeyV2 = "ptlc2" //ptlc

// Subdomain API Settings
global.subdomain = {
    "skyzopedia.us.kg": {
        "zone": "9e4e70b438a65c1d3e6d0e48b82d79de", 
        "apiToken": "odilM9DpvLVPodbPyZwW7UcDKg1aIWsivJc0Vt_o"
    }, 
    "marketplace.us.kg": {
        "zone": "2f33118c3db00b12c38d07cf1c823ed1", 
        "apiToken": "6WS_Op6yuPOWcO17NiO-sOP8Vq9tjSAFZyAn82db"
    }, 
    "serverpanell.biz.id": {
        "zone": "225512a558115605508656b7bdf29b28", 
        "apiToken": "XasxSSnGp8M9QixvT6AAlh1vEm4icVgzDyz7KDiF"
    }, 
    "rexxa.my.id": {
        "zone": "b0d37cb6e9d6a7c2b0a82395cbdfd8b9", 
        "apiToken": "fR2LO4Hz2y0U8dP3IHRwMHnWi_xKKa5RCZjWaXv3"
    }, 
    "xyz-store.biz.id": {
        "zone": "8ae812c35a94b7bd2da993a777b8b16d", 
        "apiToken": "oqZafkd3mSt1bABD9MMTidpCtD9VZdiPTjElVKJB"
    }, 
    "shopserver.us.kg": {
        "zone": "54ca38e266bfdf2dcdb7f51fd79c2db5", 
        "apiToken": "4qOupI-Of-6yNrBaeS1-H0KySuKCd0wS-x0P5XQ4"
    }
}

// Command Messages 
global.messages = {
    owner: "*Access Denied*\nThis feature is only available for the owner\nBuy 𝐃𝐀𝐑𝐊 𝐌𝐃 from 𝐂𝐎𝐃𝐄𝐁𝐑𝐄𝐀𝐊𝐄𝐑\nwa.me//2347030626048",
    admin: "*Access Denied*\nThis feature is only for group admins!",
    botAdmin: "*Access Denied*\nThis feature only works when the bot is an admin!",
    group: "*Access Denied*\nThis feature is only available in groups!",
    private: "*Access Denied*\nThis feature is only available in private chat!",
    premium: "*Access Denied*\nThis feature is only for premium users!",
    wait: 'Loading...',
    error: 'Error!',
    done: 'Done'
}

let file = require.resolve(__filename)
fs.watchFile(file, () => {
    fs.unwatchFile(file)
    console.log(chalk.redBright(`Updated ${__filename}`))
    delete require.cache[file]
    require(file)
})

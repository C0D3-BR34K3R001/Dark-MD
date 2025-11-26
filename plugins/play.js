let handler = async (m, { v8, text, example }) => {
if (!text) return m.reply(example("song name"))
await v8.sendMessage(m.chat, {react: {text: '🔎', key: m.key}})
try {
let ytsSearch = await yts(text)
const res = await ytsSearch.all[0]
let download = await fetchJson(`https://aemt.uk.to/download/ytdl?url=${res.url}`)
if (download.status) {
await v8.sendMessage(m.chat, {
audio: {url: download.result.mp3}, 
mimetype: "audio/mpeg", 
contextInfo: { 
externalAdReply: {
thumbnailUrl: res.thumbnail, 
title: res.title, 
body: `Author ${res.author.name} || Duration ${res.timestamp}`, 
sourceUrl: res.url, 
renderLargerThumbnail: true, 
mediaType: 1
}
}
}, {quoted: m})
}
} catch (e) {
m.reply("Error downloading music")
}
await v8.sendMessage(m.chat, {react: {text: '', key: m.key}})
}

handler.command = ["play", "song", "music"]
module.exports = handler
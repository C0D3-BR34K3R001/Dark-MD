let handler = async (m, { v8, text, example }) => {
if (!text) return m.reply(example("youtube url"))
if (!text.startsWith("https://")) return m.reply("Invalid YouTube URL")
await v8.sendMessage(m.chat, {react: {text: '🕖', key: m.key}})
try {
let download = await fetchJson(`https://aemt.uk.to/download/ytdl?url=${text}`)
if (download.status) {
await v8.sendMessage(m.chat, {audio: {url: download.result.mp3}, mimetype: "audio/mpeg"}, {quoted: m})
} else {
m.reply("Error downloading audio")
}
} catch (e) {
m.reply("Error processing YouTube URL")
}
await v8.sendMessage(m.chat, {react: {text: '', key: m.key}})
}

handler.command = ["ytmp3", "ytaudio", "ytmusic"]
module.exports = handler
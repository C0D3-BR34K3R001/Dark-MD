let handler = async (m, { v8, text, example }) => {
if (!text) return m.reply(example("instagram url"))
if (!text.startsWith('https://')) return m.reply("Invalid Instagram URL")
await v8.sendMessage(m.chat, {react: {text: '🕖', key: m.key}})
try {
let res = await fetchJson(`https://aemt.uk.to/download/igdl?url=${text}`)
if (!res.status) return m.reply("Error downloading Instagram content")
await v8.sendMessage(m.chat, {video: {url: res.result[0].url}, mimetype: "video/mp4", caption: "*Instagram Downloader ✅*"}, {quoted: m})
} catch (e) {
m.reply("Error downloading Instagram content")
}
await v8.sendMessage(m.chat, {react: {text: '', key: m.key}})
}

handler.command = ["instagram", "ig", "igdl"]
module.exports = handler
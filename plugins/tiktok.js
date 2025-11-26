let handler = async (m, { v8, text, example, tiktokDl }) => {
if (!text) return m.reply(example("tiktok url"))
if (!text.startsWith("https://")) return m.reply("Invalid TikTok URL")
await v8.sendMessage(m.chat, {react: {text: '🕖', key: m.key}})
try {
let result = await tiktokDl(text)
if (!result.status) return m.reply("Error downloading TikTok!")
if (result.durations == 0) {
let urlVid = await result.data.find(e => e.type == "nowatermark_hd" || e.type == "nowatermark")
await v8.sendMessage(m.chat, {image: {url: urlVid.url}, caption: `*TikTok Downloader ✅*`}, {quoted: m})
} else {
let urlVid = await result.data.find(e => e.type == "nowatermark_hd" || e.type == "nowatermark")
await v8.sendMessage(m.chat, {video: {url: urlVid.url}, mimetype: 'video/mp4', caption: `*TikTok Downloader ✅*`}, {quoted: m})
}
} catch (e) {
m.reply("Error downloading TikTok content")
}
await v8.sendMessage(m.chat, {react: {text: '', key: m.key}})
}

handler.command = ["tiktok", "tt", "tiktokdl"]
module.exports = handler
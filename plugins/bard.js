let handler = async (m, { text, example }) => {
if (!text) return m.reply(example("your question"))
try {
let res = await fetchJson(`https://api.bardapi.dev/chat?message=${encodeURIComponent(text)}`)
m.reply(res.response || "No response from Bard")
} catch (e) {
m.reply("Bard AI service error")
}
}

handler.command = ["bard", "googleai"]
module.exports = handler
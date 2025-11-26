let handler = async (m, { text, example }) => {
if (!text) return m.reply(example("your question"))
try {
let res = await fetchJson(`https://aemt.uk.to/prompt/gpt?prompt=You%20are%20DARK%20XD%20AI%20Assistant&text=${encodeURIComponent(text)}`)
m.reply(res.result || "No response from AI")
} catch (e) {
m.reply("AI service error: " + e.message)
}
}

handler.command = ["ai", "gpt", "openai", "chatgpt"]
module.exports = handler
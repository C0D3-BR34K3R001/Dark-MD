const fs = require("fs")

let handler = async (m, { v8, isCreator, text, Reply, example }) => {
if (!isCreator) return Reply(global.messages.owner)
if (!text) return m.reply(example("filename & reply code"))
if (!m.quoted || !m.quoted.text) return m.reply(example("filename & reply code"))
if (!text.endsWith(".js")) return m.reply("File name must have .js format")
let condition = "edited"
if (!fs.existsSync("./plugins/" + text.toLowerCase())) return m.reply("Plugin file not found!")
let code = m.quoted.text
await fs.writeFileSync("./plugins/" + text, code)
return m.reply(`Successfully ${condition} plugin file *${text}*`)
}

handler.command = ["sp", "svp", "saveplugins", "saveplugin"]

module.exports = handler
const fs = require("fs")

let handler = async (m, { v8, isCreator, text, Reply, example }) => {
if (!isCreator) return Reply(global.messages.owner)
if (!text) return m.reply(example("filename & reply code"))
if (!m.quoted || !m.quoted.text) return m.reply(example("filename & reply code"))
if (!text.endsWith(".js")) return m.reply("File name must have .js format")
let condition = "adding"
if (fs.existsSync("./plugins/" + text)) return m.reply("Plugin file name already exists in plugins folder!")
let code = m.quoted.text
await fs.writeFileSync("./plugins/" + text, code)
return m.reply(`Successfully ${condition} plugin file *${text}*`)
}

handler.command = ["addplugins", "addplugin", "addp", "addplug"]

module.exports = handler
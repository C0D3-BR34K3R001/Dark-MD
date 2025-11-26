const fs = require("fs")

let handler = async (m, { v8, isCreator, text, Reply, example }) => {
if (!isCreator) return Reply(global.messages.owner)
if (!text) return m.reply(example("plugin filename"))
if (!text.endsWith(".js")) return m.reply("File name must have .js format")
if (!fs.existsSync("./plugins/" + text.toLowerCase())) return m.reply("Plugin file not found!")
await fs.unlinkSync("./plugins/" + text.toLowerCase())
return m.reply(`Successfully deleted plugin file *${text.toLowerCase()}*`)
}

handler.command = ["delplugins", "delplugin", "deleteplugin", "removeplugin"]

module.exports = handler
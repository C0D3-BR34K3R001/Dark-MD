const fs = require("fs")

let handler = async (m, { v8, isCreator, Reply, text, example }) => {
if (!isCreator) return Reply(global.messages.owner)
if (!text) return m.reply(example("plugin filename"))
if (!text.endsWith(".js")) return m.reply("File name must have .js format")
if (!fs.existsSync("./plugins/" + text.toLowerCase())) return m.reply("Plugin file not found!")
let res = await fs.readFileSync("./plugins/" + text.toLowerCase())
return m.reply(`${res.toString()}`)
}

handler.command = ["getp", "gp", "getplugins", "getplugin"]

module.exports = handler
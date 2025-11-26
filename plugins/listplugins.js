const fs = require("fs")
const path = require('path');

let handler = async (m, { v8, isCreator, text, Reply, example }) => {
if (!isCreator) return Reply(global.messages.owner)
let dir = fs.readdirSync('./plugins')
if (dir.length < 1) return m.reply("No plugin files found")
let textList = "\n"
for (let file of dir) {
textList += `* ${file}\n`
}
m.reply(textList)
}

handler.command = ["listplugin", "listplugins", "pluginslist"]

module.exports = handler
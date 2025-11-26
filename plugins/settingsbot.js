let handler = async function (m, { command, isCreator, example, text, Reply, capital }) {
if (!isCreator) return Reply(global.messages.owner)
if (!text) return m.reply(example("on/off"))
if (!/on|off/.test(text)) return m.reply(example("on/off"))
let event
let name
let actions 
if (command == "autoread") {
event = global.db.settings.autoread
name = "Autoread"
actions = async (condition) => {
global.db.settings.autoread = condition
}
}
if (command == "autopromosi") {
event = global.db.settings.autopromosi
name = "Auto Promotion"
actions = async (condition) => {
global.db.settings.autopromosi = condition
}
}
if (command == "autotyping") {
name = "Auto Typing"
event = global.db.settings.autotyping
actions = async (condition) => {
global.db.settings.autotyping = condition
}
}
if (command == "autoreadsw") {
event = global.db.settings.readsw
name = "Auto Read Status"
actions = async (condition) => {
global.db.settings.readsw = condition
}
}
if (text == "on") {
if (event == true) return m.reply(`*${name} is already active!*`)
actions(true)
m.reply(`*${name} successfully activated ✅*`)
}
if (text == "off") {
if (event == false) return m.reply(`*${name} is already inactive!*`)
actions(false)
m.reply(`*${name} successfully deactivated ✅*`)
}
}

handler.command = ["autoread", "autopromosi", "autotyping", "autoreadsw"]

module.exports = handler
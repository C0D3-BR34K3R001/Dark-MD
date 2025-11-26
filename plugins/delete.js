let handler = async ( m, { v8, isCreator, example, Reply }) => {
if (m.isGroup) {
if (!isCreator && !m.isAdmin) return Reply(global.messages.admin)
if (!m.quoted) return m.reply("Reply to the message")
if (m.quoted.fromMe) {
v8.sendMessage(m.chat, { delete: { remoteJid: m.chat, fromMe: true, id: m.quoted.id, participant: m.quoted.sender}})
} else {
if (!m.isBotAdmin) return Reply(global.messages.botAdmin)
v8.sendMessage(m.chat, { delete: { remoteJid: m.chat, fromMe: false, id: m.quoted.id, participant: m.quoted.sender}})
}} else {
if (!isCreator) return Reply(global.messages.owner)
if (!m.quoted) return m.reply(example("reply message"))
v8.sendMessage(m.chat, { delete: { remoteJid: m.chat, fromMe: false, id: m.quoted.id, participant: m.quoted.sender}})
}
}

handler.command = ["delete", "del", "remove"]

module.exports = handler
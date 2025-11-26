let handler = async (m, { v8, text, mentionedJid, quoted, example, isCreator, Reply }) => {
if (!m.isGroup) return Reply(global.messages.group)
if (!m.isBotAdmin) return Reply(global.messages.botAdmin)
if (!isCreator && !m.isAdmin) return Reply(global.messages.admin)
const target = mentionedJid[0] ? mentionedJid[0] : quoted ? quoted.sender : text.replace(/[^0-9]/g, '')+'@s.whatsapp.net'
if (!target) return m.reply(example("@tag/234###"))
try {
await v8.groupParticipantsUpdate(m.chat, [target], 'promote')
await v8.sendMessage(m.chat, {text: `Successfully promoted @${target.split("@")[0]}`, mentions: [target]}, {quoted: m})
} catch (e) {
m.reply("Error promoting user")
}
}

handler.command = ["promote", "admin", "jadikanadmin"]
module.exports = handler
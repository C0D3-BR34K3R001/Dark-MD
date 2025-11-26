let handler = async (m, { v8, text, mentionedJid, quoted, example, isCreator, Reply }) => {
if (!m.isGroup) return Reply(global.messages.group)
if (!isCreator && !m.isAdmin) return Reply(global.messages.admin)
if (!m.isBotAdmin) return Reply(global.messages.botAdmin)
const input = mentionedJid[0] ? mentionedJid[0] : quoted ? quoted.sender : text ? text.replace(/[^0-9]/g, "") + "@s.whatsapp.net" : false
if (!input) return m.reply(example("@tag/reply"))
try {
let onWa = await v8.onWhatsApp(input.split("@")[0])
if (onWa.length < 1) return m.reply("Number not registered on WhatsApp")
await v8.groupParticipantsUpdate(m.chat, [input], 'remove')
m.reply(`Successfully removed ${input.split("@")[0]} from this group`)
} catch (e) {
m.reply("Error removing user from group")
}
}

handler.command = ["kick", "remove", "keluarkan"]
module.exports = handler
let handler = async (m, { v8, text, example, isCreator, Reply }) => {
if (!m.isGroup) return Reply(global.messages.group)
if (!isCreator && !m.isAdmin) return Reply(global.messages.admin)
if (!m.isBotAdmin) return Reply(global.messages.botAdmin)
if (!text) return m.reply(example("23470306###"))
const input = text.replace(/[^0-9]/g, "") + "@s.whatsapp.net"
try {
let onWa = await v8.onWhatsApp(input.split("@")[0])
if (onWa.length < 1) return m.reply("Number not registered on WhatsApp")
await v8.groupParticipantsUpdate(m.chat, [input], 'add')
m.reply(`Successfully added ${input.split("@")[0]} to this group`)
} catch (e) {
m.reply("Error adding user to group")
}
}

handler.command = ["add", "tambah"]
module.exports = handler
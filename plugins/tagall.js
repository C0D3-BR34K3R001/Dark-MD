let handler = async (m, { v8, text, example, isCreator, Reply }) => {
if (!m.isGroup) return Reply(global.messages.group)
if (!isCreator && !m.isAdmin) return Reply(global.messages.admin)
if (!text) return m.reply(example("message"))
let message = text+"\n\n"
let members = await m.metadata.participants.map(v => v.id).filter(e => e !== v8.user.id && e !== m.sender)
await members.forEach((member) => {
message += `@${member.split("@")[0]}\n`
})
await v8.sendMessage(m.chat, {text: message, mentions: [...members]}, {quoted: m})
}

handler.command = ["tagall", "everyone", "all"]
module.exports = handler
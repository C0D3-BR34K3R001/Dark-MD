let handler = async (m, { v8, isCreator, example, Reply, text }) => {
if (!isCreator) return Reply(global.messages.owner)
if (m.isGroup && !m.quoted && !text) return m.reply(example("@tag/number"))
const member = !m.isGroup ? m.chat : m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : text ? text.replace(/[^0-9]/g, "") + "@s.whatsapp.net" : ""
await v8.updateBlockStatus(member, "unblock");
if (m.isGroup) v8.sendMessage(m.chat, {text: `Successfully unblocked @${member.split('@')[0]}`, mentions: [member]}, {quoted: m})
}

handler.command = ["unblock", "unblok"]

module.exports = handler
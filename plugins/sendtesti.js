const fs = require("fs")

let handler = async (m, { v8, text, example, Reply, qmsg, qlocJpm, mime, isCreator, sleep }) => {
if (!isCreator) return Reply(global.messages.owner)
if (!text) return m.reply(example("text with photo"))
if (!/image/.test(mime)) return m.reply(example("text with photo"))
const allGroups = await v8.groupFetchAllParticipating()
const groups = await Object.keys(allGroups)
let count = 0
const caption = text
const jid = m.chat
const mediaPath = await v8.downloadAndSaveMediaMessage(qmsg)
await m.reply(`Processing *testimonial* sending to channel & ${groups.length} group chats`)
await v8.sendMessage(global.channelId, {image: await fs.readFileSync(mediaPath), caption: caption})
for (let group of groups) {
if (global.db.groups[group] && global.db.groups[group].blacklistjpm && global.db.groups[group].blacklistjpm == true) continue
try {
await v8.sendMessage(group, {image: await fs.readFileSync(mediaPath), caption: caption, contextInfo: { isForwarded: true, mentionedJid: [m.sender], businessMessageForwardInfo: { businessOwnerJid: global.owner+"@s.whatsapp.net" }, forwardedNewsletterMessageInfo: { newsletterName: global.channelName, newsletterJid: global.channelId }}}, {quoted: qlocJpm})
count += 1
} catch {}
await sleep(global.delayJpm)
}
await fs.unlinkSync(mediaPath)
await v8.sendMessage(jid, {text: `Successfully sent *testimonial* to channel & ${count} group chats`}, {quoted: m})
}

handler.command = ["sendtesti", "testi", "testimonial"]

module.exports = handler
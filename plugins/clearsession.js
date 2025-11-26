const fs = require("fs")

let handler = async (m, { isCreator, Reply }) => {
if (!isCreator) return Reply(global.messages.owner)
const sessionFiles = fs.readdirSync("./session").filter(e => e !== "creds.json")
const trashFiles = fs.readdirSync("./database/sampah").filter(e => e !== "A")
for (const file of sessionFiles) {
await fs.unlinkSync("./session/" + file)
}
for (const file of trashFiles) {
await fs.unlinkSync("./database/sampah/" + file)
}
m.reply(`*Successfully cleaned trash ✅*
*${sessionFiles.length}* session files\n*${trashFiles.length}* trash files`)
}

handler.command = ["boost", "clearsession", "clsesi", "clearsesi", "cleanup"]

module.exports = handler
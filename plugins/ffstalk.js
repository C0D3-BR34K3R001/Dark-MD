let handler = async (m, { text, example }) => {
if (!text) return m.reply(example("free-fire-id"))
try {
let res = await fetchJson(`https://api.freefireapi.com/player/${text}`)
let player = res
let info = `
*Free Fire Player Info:*
🎮 *ID:* ${player.id}
👤 *Name:* ${player.name}
🏆 *Level:* ${player.level}
⭐ *Rank:* ${player.rank}
⚔️ *Kills:* ${player.kills}
🏅 *Achievements:* ${player.achievements}
`
m.reply(info)
} catch (e) {
m.reply("Player not found or error fetching data")
}
}

handler.command = ["ffstalk", "freefire"]
module.exports = handler
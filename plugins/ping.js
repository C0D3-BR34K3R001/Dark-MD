let handler = async (m, { runtime, speed }) => {
let timestamp = speed();
let latensi = speed() - timestamp;
let respon = `
*Pong! 🏓*
*Response Speed:* ${latensi.toFixed(4)} ms
*Bot Uptime:* ${runtime(process.uptime())}
*Platform:* ${process.platform}
`
m.reply(respon)
}

handler.command = ["ping", "speed", "uptime"]
module.exports = handler
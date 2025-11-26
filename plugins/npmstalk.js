let handler = async (m, { text, example }) => {
if (!text) return m.reply(example("package-name"))
try {
let res = await fetchJson(`https://registry.npmjs.com/${text}`)
let pkg = res
let info = `
*NPM Package Info:*
📦 *Name:* ${pkg.name}
📝 *Description:* ${pkg.description || 'No description'}
🏷️ *Version:* ${pkg['dist-tags']?.latest || 'N/A'}
👤 *Author:* ${pkg.author?.name || 'Unknown'}
📅 *Last Modified:* ${new Date(pkg.time?.modified).toLocaleDateString()}
🔗 *Homepage:* ${pkg.homepage || 'N/A'}
`
m.reply(info)
} catch (e) {
m.reply("Package not found or error fetching data")
}
}

handler.command = ["npmstalk", "npminfo"]
module.exports = handler
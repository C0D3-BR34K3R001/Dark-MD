let handler = async (m, { v8 }) => {
let user = m.sender
let profilePic
try {
profilePic = await v8.profilePictureUrl(user, 'image')
} catch {
profilePic = 'https://telegra.ph/file/a059a6a734ed202c879d3.jpg'
}
let status = await v8.fetchStatus(user)
let userInfo = `
*User Profile:*
📱 *Number:* ${user.split('@')[0]}
👤 *Name:* ${m.pushName || 'Unknown'}
📝 *Status:* ${status?.status || 'No status'}
🕒 *Last Seen:* ${status?.setAt ? new Date(status.setAt).toLocaleString() : 'Unknown'}
`
await v8.sendMessage(m.chat, { 
image: { url: profilePic }, 
caption: userInfo 
}, { quoted: m })
}

handler.command = ["profile", "myprofile", "userinfo"]
module.exports = handler
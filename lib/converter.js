const fs = require('fs')
const path = require('path')
const { spawn } = require('child_process')

function ffmpeg(buffer, args = [], ext = '', ext2 = '') {
  return new Promise(async (resolve, reject) => {
    try {
      let tmp = path.join(__dirname, '../database/sampah', + new Date + '.' + ext)
      let out = tmp + '.' + ext2
      await fs.promises.writeFile(tmp, buffer)
      
      const ffmpegProcess = spawn('ffmpeg', [
        '-y',
        '-i', tmp,
        ...args,
        out
      ])
      
      let stderr = ''
      
      ffmpegProcess.stderr.on('data', (data) => {
        stderr += data.toString()
      })

      ffmpegProcess.on('error', (error) => {
        console.error('FFmpeg error:', error)
        reject(error)
      })
      
      ffmpegProcess.on('close', async (code) => {
        try {
          await fs.promises.unlink(tmp)
          if (code !== 0) {
            console.error('FFmpeg process failed with code:', code)
            console.error('FFmpeg stderr:', stderr)
            return reject(new Error(`FFmpeg process failed with code ${code}`))
          }
          const result = await fs.promises.readFile(out)
          await fs.promises.unlink(out)
          resolve(result)
        } catch (e) {
          reject(e)
        }
      })
    } catch (e) {
      reject(e)
    }
  })
}

/**
 * Convert Audio to Playable WhatsApp Audio
 * @param {Buffer} buffer Audio Buffer
 * @param {String} ext File Extension 
 */
function toAudio(buffer, ext) {
  return ffmpeg(buffer, [
    '-vn',
    '-ac', '2',
    '-b:a', '128k',
    '-ar', '44100',
    '-f', 'mp3'
  ], ext, 'mp3')
}

/**
 * Convert Audio to Playable WhatsApp PTT
 * @param {Buffer} buffer Audio Buffer
 * @param {String} ext File Extension 
 */
function toPTT(buffer, ext) {
  return ffmpeg(buffer, [
    '-vn',
    '-c:a', 'libopus',
    '-b:a', '128k',
    '-vbr', 'on',
    '-compression_level', '10'
  ], ext, 'opus')
}

/**
 * Convert Audio to Playable WhatsApp Video
 * @param {Buffer} buffer Video Buffer
 * @param {String} ext File Extension 
 */
function toVideo(buffer, ext) {
  return ffmpeg(buffer, [
    '-c:v', 'libx264',
    '-c:a', 'aac',
    '-ab', '128k',
    '-ar', '44100',
    '-crf', '32',
    '-preset', 'slow'
  ], ext, 'mp4')
}

/**
 * Convert to WhatsApp Sticker (WebP)
 * @param {Buffer} buffer Media Buffer
 * @param {String} ext File Extension
 */
function toSticker(buffer, ext) {
  return ffmpeg(buffer, [
    '-vf', 'scale=512:512:flags=lanczos:force_original_aspect_ratio=decrease,format=rgba,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=#00000000',
    '-c:v', 'libwebp',
    '-quality', '90',
    '-compression_level', '6',
    '-qscale', '90',
    '-r', '10'
  ], ext, 'webp')
}

module.exports = {
  toAudio,
  toPTT,
  toVideo,
  toSticker,
  ffmpeg,
}
require('../settings');
const fs = require('fs');
const path = require('path');
const { tmpdir } = require('os');
const Crypto = require('crypto');
const ff = require('fluent-ffmpeg');
const FileType = require('file-type');
const webp = require('node-webpmux');

async function imageToWebp(media) {
    const tmpFileOut = path.join(tmpdir(), `${Crypto.randomBytes(6).readUIntLE(0, 6).toString(36)}.webp`)
    const tmpFileIn = path.join(tmpdir(), `${Crypto.randomBytes(6).readUIntLE(0, 6).toString(36)}.jpg`)
    
    try {
        fs.writeFileSync(tmpFileIn, media)
        await new Promise((resolve, reject) => {
            ff(tmpFileIn)
                .on("error", reject)
                .on("end", () => resolve(true))
                .addOutputOptions([
                    "-vcodec", "libwebp",
                    "-vf", "scale='min(320,iw)':min'(320,ih)':force_original_aspect_ratio=decrease,fps=15, pad=320:320:-1:-1:color=white@0.0, split [a][b]; [a] palettegen=reserve_transparent=on:transparency_color=ffffff [p]; [b][p] paletteuse"
                ])
                .toFormat("webp")
                .save(tmpFileOut)
        })

        const buff = fs.readFileSync(tmpFileOut)
        return buff
    } catch (error) {
        throw new Error(`Image to WebP conversion failed: ${error.message}`)
    } finally {
        // Cleanup temporary files
        if (fs.existsSync(tmpFileOut)) fs.unlinkSync(tmpFileOut)
        if (fs.existsSync(tmpFileIn)) fs.unlinkSync(tmpFileIn)
    }
}

async function videoToWebp(media) {
    const tmpFileOut = path.join(tmpdir(), `${Crypto.randomBytes(6).readUIntLE(0, 6).toString(36)}.webp`)
    const tmpFileIn = path.join(tmpdir(), `${Crypto.randomBytes(6).readUIntLE(0, 6).toString(36)}.mp4`)
    
    try {
        fs.writeFileSync(tmpFileIn, media)
        await new Promise((resolve, reject) => {
            ff(tmpFileIn)
                .on("error", reject)
                .on("end", () => resolve(true))
                .addOutputOptions([
                    "-vcodec", "libwebp",
                    "-vf", "scale='min(320,iw)':min'(320,ih)':force_original_aspect_ratio=decrease,fps=15, pad=320:320:-1:-1:color=white@0.0, split [a][b]; [a] palettegen=reserve_transparent=on:transparency_color=ffffff [p]; [b][p] paletteuse",
                    "-loop", "0",
                    "-ss", "00:00:00",
                    "-t", "00:00:05",
                    "-preset", "default",
                    "-an",
                    "-vsync", "0"
                ])
                .toFormat("webp")
                .save(tmpFileOut)
        })

        const buff = fs.readFileSync(tmpFileOut)
        return buff
    } catch (error) {
        throw new Error(`Video to WebP conversion failed: ${error.message}`)
    } finally {
        // Cleanup temporary files
        if (fs.existsSync(tmpFileOut)) fs.unlinkSync(tmpFileOut)
        if (fs.existsSync(tmpFileIn)) fs.unlinkSync(tmpFileIn)
    }
}

async function writeExif(media, metadata = {}) {
    try {
        const fileType = await FileType.fromBuffer(media)
        if (!fileType) throw new Error("Could not determine file type")
        
        let wMedia;
        if (/webp/.test(fileType.mime)) {
            wMedia = media
        } else if (/jpeg|jpg|png/.test(fileType.mime)) {
            wMedia = await imageToWebp(media)
        } else if (/video/.test(fileType.mime)) {
            wMedia = await videoToWebp(media)
        } else {
            throw new Error(`Unsupported media type: ${fileType.mime}`)
        }

        const tmpFileOut = path.join(tmpdir(), `${Crypto.randomBytes(6).readUIntLE(0, 6).toString(36)}.webp`)
        const tmpFileIn = path.join(tmpdir(), `${Crypto.randomBytes(6).readUIntLE(0, 6).toString(36)}.webp`)
        
        fs.writeFileSync(tmpFileIn, wMedia)

        const img = new webp.Image()
        const stickerData = {
            a: metadata.author || global.author || '',
            b: metadata.packname || global.packname || '',
            c: metadata.author || global.author || '',
            d: metadata.categories || [''],
            e: metadata.isAvatar ? 1 : 0
        }
        
        const json = {
            'sticker-pack-id': stickerData.a,
            'sticker-pack-name': stickerData.b,
            'sticker-pack-publisher': stickerData.c,
            'emojis': stickerData.d,
            'is-avatar-sticker': stickerData.e
        }

        const exifAttr = Buffer.from([0x49, 0x49, 0x2A, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00, 0x41, 0x57, 0x07, 0x00, 0x00, 0x00, 0x00, 0x00, 0x16, 0x00, 0x00, 0x00])
        const jsonBuff = Buffer.from(JSON.stringify(json), 'utf-8')
        const exif = Buffer.concat([exifAttr, jsonBuff])
        exif.writeUIntLE(jsonBuff.length, 14, 4)

        await img.load(tmpFileIn)
        img.exif = exif
        await img.save(tmpFileOut)

        const resultBuffer = fs.readFileSync(tmpFileOut)
        
        // Cleanup
        if (fs.existsSync(tmpFileIn)) fs.unlinkSync(tmpFileIn)
        if (fs.existsSync(tmpFileOut)) fs.unlinkSync(tmpFileOut)
        
        return resultBuffer
    } catch (error) {
        throw new Error(`EXIF writing failed: ${error.message}`)
    }
}

module.exports = { imageToWebp, videoToWebp, writeExif }
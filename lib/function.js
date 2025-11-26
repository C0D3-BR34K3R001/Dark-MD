const fs = require('fs');
const util = require('util');
const Jimp = require('jimp');
const axios = require('axios');
const chalk = require('chalk');
const crypto = require('crypto');
const FileType = require('file-type');
const jsobfus = require('javascript-obfuscator');
const moment = require('moment-timezone');
const { sizeFormatter } = require('human-readable');
const { proto, areJidsSameUser, extractMessageContent, downloadContentFromMessage, getContentType, getDevice } = require('@whiskeysockets/baileys');

const pool = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890'.split('');

/**
 * =============================================
 * TIME & DATE FUNCTIONS
 * =============================================
 */

/**
 * Get current Unix timestamp in seconds
 */
const unixTimestampSeconds = (date = new Date()) => Math.floor(date.getTime() / 1000);

/**
 * Generate message tag for WhatsApp
 */
const generateMessageTag = (epoch) => {
    let tag = unixTimestampSeconds().toString();
    if (epoch) tag += '.--' + epoch;
    return tag;
};

/**
 * Calculate process time in seconds
 */
const processTime = (timestamp, now) => {
    return moment.duration(now - moment(timestamp * 1000)).asSeconds();
};

/**
 * Format time as HH:MM:SS
 */
const clockString = (ms) => {
    const h = isNaN(ms) ? '--' : Math.floor(ms / 3600000);
    const m = isNaN(ms) ? '--' : Math.floor(ms / 60000) % 60;
    const s = isNaN(ms) ? '--' : Math.floor(ms / 1000) % 60;
    return [h, m, s].map(v => v.toString().padStart(2, 0)).join(':');
};

/**
 * Get formatted time
 */
const getTime = (format, date) => {
    return date ? 
        moment(date).locale('id').format(format) : 
        moment.tz('Asia/Jakarta').locale('id').format(format);
};

/**
 * Format date with locale
 */
const formatDate = (timestamp, locale = 'id') => {
    const date = new Date(timestamp);
    return date.toLocaleDateString(locale, {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric'
    });
};

/**
 * Indonesian date format
 */
const tanggal = (timestamp) => {
    const months = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jum\'at', 'Sabtu'];
    
    const date = new Date(timestamp);
    const day = date.getDate();
    const month = date.getMonth();
    const dayName = days[date.getDay()];
    const year = date.getFullYear();
    
    return `${dayName}, ${day} ${months[month]} ${year}`;
};

/**
 * Calculate bot runtime
 */
const runtime = (seconds = process.uptime()) => {
    seconds = Number(seconds);
    const d = Math.floor(seconds / (3600 * 24));
    const h = Math.floor(seconds % (3600 * 24) / 3600);
    const m = Math.floor(seconds % 3600 / 60);
    const s = Math.floor(seconds % 60);
    
    const dDisplay = d > 0 ? d + (d === 1 ? "d " : "d ") : "";
    const hDisplay = h > 0 ? h + (h === 1 ? "h " : "h ") : "";
    const mDisplay = m > 0 ? m + (m === 1 ? "m " : "m ") : "";
    const sDisplay = s > 0 ? s + (s === 1 ? "s" : "s") : "";
    
    return dDisplay + hDisplay + mDisplay + sDisplay;
};

/**
 * =============================================
 * NETWORK & HTTP FUNCTIONS
 * =============================================
 */

/**
 * Fetch buffer from URL
 */
const getBuffer = async (url, options = {}) => {
    try {
        const response = await axios({
            method: "GET",
            url,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.69 Safari/537.36',
                'DNT': 1,
                'Upgrade-Insecure-Request': 1,
                ...options.headers
            },
            responseType: 'arraybuffer',
            timeout: 30000,
            ...options
        });
        return response.data;
    } catch (error) {
        console.error(chalk.red('Buffer fetch error:'), error.message);
        throw new Error(`Failed to fetch buffer: ${error.message}`);
    }
};

/**
 * Fetch JSON from URL
 */
const fetchJson = async (url, options = {}) => {
    try {
        const response = await axios({
            method: 'GET',
            url,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.69 Safari/537.36',
                'Accept': 'application/json',
                ...options.headers
            },
            timeout: 30000,
            ...options
        });
        return response.data;
    } catch (error) {
        console.error(chalk.red('JSON fetch error:'), error.message);
        throw new Error(`Failed to fetch JSON: ${error.message}`);
    }
};

/**
 * Check if string is a valid URL
 */
const isUrl = (url) => {
    if (typeof url !== 'string') return false;
    return url.match(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)/gi) !== null;
};

/**
 * Get media type from URL
 */
const getTypeUrlMedia = async (url) => {
    try {
        const response = await axios.head(url, { timeout: 10000 });
        const contentType = response.headers['content-type'];
        return { type: contentType, url };
    } catch (error) {
        // Fallback to buffer method if HEAD fails
        try {
            const buffer = await getBuffer(url);
            const fileType = await FileType.fromBuffer(buffer);
            return { type: fileType?.mime || 'unknown', url };
        } catch (e) {
            throw new Error(`Failed to get media type: ${error.message}`);
        }
    }
};

/**
 * =============================================
 * FILE & MEDIA FUNCTIONS
 * =============================================
 */

/**
 * Format file size to human readable format
 */
const formatp = sizeFormatter({
    std: 'JEDEC',
    decimalPlaces: 2,
    keepTrailingZeroes: false,
    render: (literal, symbol) => `${literal} ${symbol}B`,
});

/**
 * Convert bytes to human readable size
 */
const bytesToSize = (bytes, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

/**
 * Get size of media file
 */
const getSizeMedia = async (path) => {
    try {
        if (typeof path === 'string' && isUrl(path)) {
            const response = await axios.head(path);
            const length = parseInt(response.headers['content-length']);
            return bytesToSize(length, 3);
        } else if (Buffer.isBuffer(path)) {
            const length = Buffer.byteLength(path);
            return bytesToSize(length, 3);
        } else if (typeof path === 'string' && fs.existsSync(path)) {
            const stats = fs.statSync(path);
            return bytesToSize(stats.size, 3);
        } else {
            throw new Error('Invalid path or buffer provided');
        }
    } catch (error) {
        throw new Error(`Failed to get media size: ${error.message}`);
    }
};

/**
 * Check network bandwidth
 */
const checkBandwidth = async () => {
    try {
        let download = 0;
        let upload = 0;
        const stats = await require('node-os-utils').netstat.stats();
        
        for (let stat of stats) {
            download += parseInt(stat.inputBytes || 0);
            upload += parseInt(stat.outputBytes || 0);
        }
        
        return {
            download: bytesToSize(download),
            upload: bytesToSize(upload),
        };
    } catch (error) {
        console.error(chalk.red('Bandwidth check error:'), error.message);
        return { download: '0 Bytes', upload: '0 Bytes' };
    }
};

/**
 * =============================================
 * IMAGE PROCESSING FUNCTIONS
 * =============================================
 */

/**
 * Resize image
 */
const reSize = async (image, width = 100, height = 100) => {
    try {
        const read = await Jimp.read(image);
        const result = await read.resize(width, height).getBufferAsync(Jimp.MIME_JPEG);
        return result;
    } catch (error) {
        throw new Error(`Image resize failed: ${error.message}`);
    }
};

/**
 * Enhance image to HD
 */
const toHD = async (image) => {
    try {
        const read = await Jimp.read(image);
        const newWidth = read.bitmap.width * 4;
        const newHeight = read.bitmap.height * 4;
        const result = await read.resize(newWidth, newHeight).getBufferAsync(Jimp.MIME_JPEG);
        return result;
    } catch (error) {
        throw new Error(`HD conversion failed: ${error.message}`);
    }
};

/**
 * Generate profile picture
 */
const generateProfilePicture = async (buffer) => {
    try {
        const jimp = await Jimp.read(buffer);
        const min = Math.min(jimp.getWidth(), jimp.getHeight());
        const cropped = jimp.crop(0, 0, min, min);
        
        return {
            img: await cropped.scaleToFit(720, 720).getBufferAsync(Jimp.MIME_JPEG),
            preview: await cropped.scaleToFit(72, 72).getBufferAsync(Jimp.MIME_JPEG)
        };
    } catch (error) {
        throw new Error(`Profile picture generation failed: ${error.message}`);
    }
};

/**
 * =============================================
 * STRING & TEXT FUNCTIONS
 * =============================================
 */

/**
 * Capitalize first letter
 */
const capital = (string) => {
    if (typeof string !== 'string') return '';
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
};

/**
 * Format number to Indonesian Rupiah
 */
const toIDR = (amount) => {
    try {
        const numericAmount = Number(amount);
        if (isNaN(numericAmount)) throw new Error('Invalid number');
        
        const formatted = numericAmount.toLocaleString('id-ID', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        });
        
        return `Rp ${formatted}`;
    } catch (error) {
        console.error(chalk.red('IDR format error:'), error.message);
        return 'Rp 0';
    }
};

/**
 * Truncate text with ellipsis
 */
const batasiTeks = (text, limit) => {
    if (typeof text !== 'string') return '';
    return text.length <= limit ? text : text.substring(0, limit) + '...';
};

/**
 * Check if string contains emoji
 */
const isEmoji = (str) => {
    if (typeof str !== 'string') return false;
    const emojiRegex = /[\p{Emoji_Presentation}\p{Emoji}\u{1F000}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F100}-\u{1F1FF}]/u;
    return emojiRegex.test(str);
};

/**
 * Generate random text
 */
const randomText = (length) => {
    const result = [];
    for (let i = 0; i < length; i++) {
        result.push(pool[Math.floor(Math.random() * pool.length)]);
    }
    return result.join('');
};

/**
 * =============================================
 * UTILITY FUNCTIONS
 * =============================================
 */

/**
 * Sleep/delay function
 */
const sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Get random element from array
 */
const pickRandom = (array) => {
    if (!Array.isArray(array) || array.length === 0) return null;
    return array[Math.floor(Math.random() * array.length)];
};

/**
 * Generate random filename
 */
const getRandom = (ext = '') => {
    return `${Math.floor(Math.random() * 10000)}${Date.now()}${ext}`;
};

/**
 * Format JSON with indentation
 */
const jsonformat = (data) => {
    return JSON.stringify(data, null, 2);
};

/**
 * Logic switch function
 */
const logic = (check, inputs, outputs) => {
    if (!Array.isArray(inputs) || !Array.isArray(outputs) || inputs.length !== outputs.length) {
        throw new Error('Input and output arrays must have same length');
    }
    
    for (let i = 0; i < inputs.length; i++) {
        if (util.isDeepStrictEqual(check, inputs[i])) return outputs[i];
    }
    return null;
};

/**
 * =============================================
 * SECURITY & AUTH FUNCTIONS
 * =============================================
 */

/**
 * Hash password using SHA256
 */
const getHashedPassword = (password) => {
    if (typeof password !== 'string') throw new Error('Password must be a string');
    const sha256 = crypto.createHash('sha256');
    return sha256.update(password).digest('base64');
};

/**
 * Generate authentication token
 */
const generateAuthToken = (size = 32) => {
    return crypto.randomBytes(size).toString('hex');
};

/**
 * Generate simple token
 */
const generateToken = (length = 8) => {
    const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890!@#$%^&*';
    let token = '';
    for (let i = 0; i < length; i++) {
        token += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return token;
};

/**
 * Obfuscate JavaScript code
 */
const encryptCode = async (code) => {
    try {
        const obfuscationResult = jsobfus.obfuscate(code, {
            compact: false,
            controlFlowFlattening: true,
            controlFlowFlatteningThreshold: 1,
            numbersToExpressions: true,
            simplify: true,
            stringArrayShuffle: true,
            splitStrings: true,
            stringArrayThreshold: 1
        });
        
        return {
            status: 200,
            result: obfuscationResult.getObfuscatedCode()
        };
    } catch (error) {
        throw new Error(`Code obfuscation failed: ${error.message}`);
    }
};

/**
 * =============================================
 * WHATSAPP SPECIFIC FUNCTIONS
 * =============================================
 */

/**
 * Parse mentions from text
 */
const parseMention = (text = '') => {
    if (typeof text !== 'string') return [];
    return [...text.matchAll(/@([0-9]{5,16}|0)/g)].map(v => v[1] + '@s.whatsapp.net');
};

/**
 * Get group admins from participants
 */
const getGroupAdmins = (participants) => {
    if (!Array.isArray(participants)) return [];
    
    return participants
        .filter(participant => participant.admin === 'superadmin' || participant.admin === 'admin')
        .map(participant => participant.id);
};

/**
 * =============================================
 * FILE OPERATIONS
 * =============================================
 */

/**
 * Read random line from text file
 */
const readFileTxt = (filePath) => {
    try {
        if (!fs.existsSync(filePath)) throw new Error('File not found');
        const data = fs.readFileSync(filePath, 'utf8');
        const lines = data.toString().split('\n').filter(line => line.trim());
        return pickRandom(lines)?.replace('\r', '') || '';
    } catch (error) {
        throw new Error(`Text file read failed: ${error.message}`);
    }
};

/**
 * Read random item from JSON file
 */
const readFileJson = (filePath) => {
    try {
        if (!fs.existsSync(filePath)) throw new Error('File not found');
        const jsonData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        if (!Array.isArray(jsonData)) throw new Error('JSON data must be an array');
        return pickRandom(jsonData);
    } catch (error) {
        throw new Error(`JSON file read failed: ${error.message}`);
    }
};

/**
 * =============================================
 * LEGACY FUNCTIONS (Keep for compatibility)
 * =============================================
 */

const webApi = (a, b, c, d, e, f) => a + b + c + d + e + f;

const cekMenfes = (tag, nomer, db_menfes) => {
    let found = false;
    Object.keys(db_menfes).forEach((i) => {
        if (db_menfes[i].id == nomer) {
            found = i;
        }
    });
    
    if (found !== false) {
        return tag === 'id' ? db_menfes[found].id : db_menfes[found].teman;
    }
    return null;
};

const format = (...args) => util.format(...args);

const getAllHTML = async (urls) => {
    try {
        const htmlArr = [];
        for (const url of urls) {
            const response = await axios.get(url);
            htmlArr.push(response.data);
        }
        return htmlArr;
    } catch (error) {
        console.error(chalk.red('HTML fetch error:'), error.message);
        throw new Error(`Failed to fetch HTML: ${error.message}`);
    }
};

// Export all functions
module.exports = {
    // Time & Date
    unixTimestampSeconds, generateMessageTag, processTime, clockString,
    getTime, formatDate, tanggal, runtime,
    
    // Network & HTTP
    getBuffer, fetchJson, isUrl, getTypeUrlMedia,
    
    // File & Media
    formatp, bytesToSize, getSizeMedia, checkBandwidth,
    
    // Image Processing
    reSize, toHD, generateProfilePicture,
    
    // String & Text
    capital, toIDR, batasiTeks, isEmoji, randomText,
    
    // Utilities
    sleep, pickRandom, getRandom, jsonformat, logic,
    
    // Security & Auth
    getHashedPassword, generateAuthToken, generateToken, encryptCode,
    
    // WhatsApp Specific
    parseMention, getGroupAdmins,
    
    // File Operations
    readFileTxt, readFileJson,
    
    // Legacy
    webApi, cekMenfes, format, getAllHTML
};

// Hot reload
let file = require.resolve(__filename);
fs.watchFile(file, () => {
    fs.unwatchFile(file);
    console.log(chalk.redBright(`Updated ${__filename}`));
    delete require.cache[file];
    require(file);
});
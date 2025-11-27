const fs = require('fs');
const util = require('util');
const Jimp = require('jimp');
const axios = require('axios');
const chalk = require('chalk');
const crypto = require('crypto');
const FileType = require('file-type');
const moment = require('moment-timezone');
const { proto, areJidsSameUser, extractMessageContent, downloadContentFromMessage, getContentType, getDevice } = require('@whiskeysockets/baileys');

const pool = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890'.split('');

/**
 * Format file size to human readable format
 */
const formatp = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * =============================================
 * TIME & DATE FUNCTIONS
 * =============================================
 */

const unixTimestampSeconds = (date = new Date()) => Math.floor(date.getTime() / 1000);

const generateMessageTag = (epoch) => {
    let tag = unixTimestampSeconds().toString();
    if (epoch) tag += '.--' + epoch;
    return tag;
};

const processTime = (timestamp, now) => {
    return moment.duration(now - moment(timestamp * 1000)).asSeconds();
};

const clockString = (ms) => {
    const h = isNaN(ms) ? '--' : Math.floor(ms / 3600000);
    const m = isNaN(ms) ? '--' : Math.floor(ms / 60000) % 60;
    const s = isNaN(ms) ? '--' : Math.floor(ms / 1000) % 60;
    return [h, m, s].map(v => v.toString().padStart(2, 0)).join(':');
};

const getTime = (format, date) => {
    return date ? 
        moment(date).locale('id').format(format) : 
        moment.tz('Asia/Jakarta').locale('id').format(format);
};

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

const isUrl = (url) => {
    if (typeof url !== 'string') return false;
    return url.match(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)/gi) !== null;
};

/**
 * =============================================
 * FILE & MEDIA FUNCTIONS
 * =============================================
 */

const bytesToSize = (bytes, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

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
 * =============================================
 * UTILITY FUNCTIONS
 * =============================================
 */

const sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
};

const pickRandom = (array) => {
    if (!Array.isArray(array) || array.length === 0) return null;
    return array[Math.floor(Math.random() * array.length)];
};

const getRandom = (ext = '') => {
    return `${Math.floor(Math.random() * 10000)}${Date.now()}${ext}`;
};

const jsonformat = (data) => {
    return JSON.stringify(data, null, 2);
};

const capital = (string) => {
    if (typeof string !== 'string') return '';
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
};

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

const parseMention = (text = '') => {
    if (typeof text !== 'string') return [];
    return [...text.matchAll(/@([0-9]{5,16}|0)/g)].map(v => v[1] + '@s.whatsapp.net');
};

const getGroupAdmins = (participants) => {
    if (!Array.isArray(participants)) return [];
    
    return participants
        .filter(participant => participant.admin === 'superadmin' || participant.admin === 'admin')
        .map(participant => participant.id);
};

// Legacy functions for compatibility
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

// Export all functions
module.exports = {
    // Time & Date
    unixTimestampSeconds, generateMessageTag, processTime, clockString,
    getTime, formatDate, tanggal, runtime,
    
    // Network & HTTP
    getBuffer, fetchJson, isUrl,
    
    // File & Media
    formatp, bytesToSize, getSizeMedia,
    
    // String & Text
    capital, toIDR,
    
    // Utilities
    sleep, pickRandom, getRandom, jsonformat,
    
    // WhatsApp Specific
    parseMention, getGroupAdmins,
    
    // Legacy
    webApi, cekMenfes, format
};

// Hot reload
let file = require.resolve(__filename);
fs.watchFile(file, () => {
    fs.unwatchFile(file);
    console.log(chalk.redBright(`Updated ${__filename}`));
    delete require.cache[file];
    require(file);
});

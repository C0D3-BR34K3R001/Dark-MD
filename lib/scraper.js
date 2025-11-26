const axios = require('axios');
const chalk = require("chalk");
const cheerio = require('cheerio');
const fetch = require('node-fetch');
const fs = require("fs");
const FormData = require('form-data');
const crypto = require("crypto");
const Jimp = require('jimp');

/**
 * TikTok Downloader
 * Downloads TikTok videos without watermark
 */
async function tiktokDl(url) {
    return new Promise(async (resolve, reject) => {
        try {
            if (!url || !url.includes('tiktok.com')) {
                return reject(new Error('Invalid TikTok URL'));
            }

            const domain = 'https://www.tikwm.com/api/';
            const response = await axios.post(domain, {}, {
                headers: {
                    'Accept': 'application/json, text/javascript, */*; q=0.01',
                    'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                    'Origin': 'https://www.tikwm.com',
                    'Referer': 'https://www.tikwm.com/',
                    'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                params: {
                    url: url,
                    count: 12,
                    cursor: 0,
                    web: 1,
                    hd: 1
                }
            });

            const res = response.data.data;
            
            if (!res) {
                return reject(new Error('No data received from TikTok API'));
            }

            const formatNumber = (integer) => {
                const numb = parseInt(integer);
                return Number(numb).toLocaleString().replace(/,/g, '.');
            };

            const formatDate = (timestamp, locale = 'en') => {
                const date = new Date(timestamp * 1000); // Convert seconds to milliseconds
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

            let data = [];
            
            // Handle image posts (slideshows)
            if (res?.duration === 0 && res.images) {
                res.images.forEach(image => {
                    data.push({ 
                        type: 'photo', 
                        url: `https://www.tikwm.com${image}` 
                    });
                });
            } else {
                // Handle video posts
                data.push(
                    {
                        type: 'watermark',
                        url: res?.wmplay ? `https://www.tikwm.com${res.wmplay}` : null,
                    },
                    {
                        type: 'nowatermark',
                        url: res?.play ? `https://www.tikwm.com${res.play}` : null,
                    },
                    {
                        type: 'nowatermark_hd',
                        url: res?.hdplay ? `https://www.tikwm.com${res.hdplay}` : null
                    }
                );
            }

            const result = {
                status: true,
                title: res.title || 'No title',
                taken_at: formatDate(res.create_time),
                region: res.region || 'Unknown',
                id: res.id,
                durations: res.duration,
                duration: res.duration + ' Seconds',
                cover: res.cover ? `https://www.tikwm.com${res.cover}` : null,
                size_wm: res.wm_size,
                size_nowm: res.size,
                size_nowm_hd: res.hd_size,
                data: data.filter(item => item.url), // Remove null URLs
                music_info: {
                    id: res.music_info?.id,
                    title: res.music_info?.title || 'Unknown',
                    author: res.music_info?.author || 'Unknown',
                    album: res.music_info?.album || null,
                    url: res.music ? `https://www.tikwm.com${res.music}` : res.music_info?.play
                },
                stats: {
                    views: formatNumber(res.play_count || 0),
                    likes: formatNumber(res.digg_count || 0),
                    comment: formatNumber(res.comment_count || 0),
                    share: formatNumber(res.share_count || 0),
                    download: formatNumber(res.download_count || 0)
                },
                author: {
                    id: res.author?.id,
                    fullname: res.author?.unique_id || 'Unknown',
                    nickname: res.author?.nickname || 'Unknown',
                    avatar: res.author?.avatar ? `https://www.tikwm.com${res.author.avatar}` : null
                }
            };

            resolve(result);
        } catch (error) {
            console.error(chalk.red('TikTok download error:'), error.message);
            reject(new Error(`TikTok download failed: ${error.message}`));
        }
    });
}

/**
 * Pinterest Image Search (Method 1)
 */
async function pinterest(query) {
    return new Promise(async (resolve, reject) => {
        try {
            if (!query || query.trim() === '') {
                return reject(new Error('Search query cannot be empty'));
            }

            const response = await axios.get(`https://id.pinterest.com/search/pins/?q=${encodeURIComponent(query)}`, {
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
                    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8"
                }
            });

            const $ = cheerio.load(response.data);
            const results = [];

            $('img').each((index, element) => {
                const src = $(element).attr('src');
                if (src && src.includes('pinimg.com')) {
                    // Replace with higher quality version if possible
                    const highQualityUrl = src.replace(/236/g, '736').replace(/474/g, '1200');
                    results.push(highQualityUrl);
                }
            });

            // Remove duplicates and undefined values
            const uniqueResults = [...new Set(results.filter(url => url))];
            
            if (uniqueResults.length === 0) {
                return reject(new Error('No images found for the search query'));
            }

            resolve(uniqueResults.slice(0, 20)); // Limit to 20 results
        } catch (error) {
            console.error(chalk.red('Pinterest search error:'), error.message);
            reject(new Error(`Pinterest search failed: ${error.message}`));
        }
    });
}

/**
 * Pinterest Search (Method 2 - API based)
 */
async function pinterest2(query) {
    return new Promise(async (resolve, reject) => {
        try {
            if (!query || query.trim() === '') {
                return reject(new Error('Search query cannot be empty'));
            }

            const baseUrl = 'https://www.pinterest.com/resource/BaseSearchResource/get/';
            const queryParams = {
                source_url: `/search/pins/?q=${encodeURIComponent(query)}`,
                data: JSON.stringify({
                    options: {
                        isPrefetch: false,
                        query: query,
                        scope: 'pins',
                        no_fetch_context_on_resource: false
                    },
                    context: {}
                }),
                _: Date.now()
            };

            const url = new URL(baseUrl);
            Object.entries(queryParams).forEach(([key, value]) => {
                url.searchParams.set(key, value);
            });

            const response = await fetch(url.toString(), {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                    'Accept': 'application/json,text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const json = await response.json();
            const results = json.resource_response?.data?.results || [];

            const formattedResults = results.map(item => ({
                pin: `https://www.pinterest.com/pin/${item.id}`,
                link: item.link || '',
                created_at: item.created_at ? new Date(item.created_at).toLocaleDateString('en-US', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                }) : 'Unknown date',
                id: item.id,
                images_url: item.images?.['736x']?.url || item.images?.orig?.url || '',
                title: item.grid_title || 'No title',
                description: item.description || ''
            })).filter(item => item.images_url); // Only include items with images

            if (formattedResults.length === 0) {
                return reject(new Error('No Pinterest results found'));
            }

            resolve(formattedResults);
        } catch (error) {
            console.error(chalk.red('Pinterest API search error:'), error.message);
            reject(new Error(`Pinterest API search failed: ${error.message}`));
        }
    });
}

/**
 * MediaFire Downloader
 * Extracts direct download links from MediaFire URLs
 */
async function mediafire(url) {
    return new Promise(async (resolve, reject) => {
        try {
            if (!url || !url.includes('mediafire.com')) {
                return reject(new Error('Invalid MediaFire URL'));
            }

            const response = await axios.get(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                },
                timeout: 10000
            });

            const $ = cheerio.load(response.data);
            
            // Extract information using multiple selectors for robustness
            const title = $('.dl-btn-label').text() || 
                         $('.filename').text() || 
                         'Unknown File';
            
            const size = $('.file-size').text() || 
                        $('.fileinfo > .details > li').first().find('span').text() ||
                        'Unknown size';
            
            const uploadDate = $('.fileinfo > .details > li').eq(1).find('span').text() || 
                             'Unknown date';
            
            const downloadLink = $('#downloadButton').attr('href');

            if (!downloadLink) {
                return reject(new Error('Download link not found on the page'));
            }

            const result = {
                title: title.trim(),
                filename: downloadLink.split('/').pop() || 'file',
                upload_date: uploadDate.trim(),
                size: size.trim(),
                mime: downloadLink.split('.').pop() || 'unknown',
                link: downloadLink
            };

            resolve(result);
        } catch (error) {
            console.error(chalk.red('MediaFire download error:'), error.message);
            reject(new Error(`MediaFire download failed: ${error.message}`));
        }
    });
}

/**
 * Remini AI Image Enhancer
 * Enhances image quality using AI
 */
async function remini(imageBuffer, type = 'enhance') {
    return new Promise(async (resolve, reject) => {
        try {
            if (!imageBuffer || !Buffer.isBuffer(imageBuffer)) {
                return reject(new Error('Invalid image buffer provided'));
            }

            const validTypes = ['enhance', 'recolor', 'dehaze'];
            if (!validTypes.includes(type)) {
                type = 'enhance'; // Default to enhance
            }

            const formData = new FormData();
            formData.append('model_version', '1');
            formData.append('image', imageBuffer, {
                filename: 'enhance_image_body.jpg',
                contentType: 'image/jpeg'
            });

            const apiUrl = `https://developer.vyro.ai/api/v1/${type}`;
            
            const response = await fetch(apiUrl, {
                method: 'POST',
                body: formData,
                headers: {
                    'User-Agent': 'okhttp/4.9.3',
                    'Connection': 'Keep-Alive',
                    ...formData.getHeaders()
                }
            });

            if (!response.ok) {
                throw new Error(`API returned status: ${response.status}`);
            }

            const resultBuffer = await response.buffer();
            
            // Validate that we got an image back
            if (resultBuffer.length < 100) { // Arbitrary minimum size
                throw new Error('API returned invalid image data');
            }

            resolve(resultBuffer);
        } catch (error) {
            console.error(chalk.red('Remini enhancement error:'), error.message);
            reject(new Error(`Image enhancement failed: ${error.message}`));
        }
    });
}

module.exports = { 
    pinterest, 
    pinterest2, 
    remini, 
    mediafire, 
    tiktokDl 
};
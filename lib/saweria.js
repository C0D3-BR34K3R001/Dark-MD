const qrcode = require('qrcode')
const cheerio = require('cheerio')
const moment = require('moment-timezone')
const fetch = require('node-fetch')

class Saweria {
   constructor(user_id) {
      this.user_id = user_id;
      this.baseUrl = 'https://saweria.co';
      this.apiUrl = 'https://backend.saweria.co';
   }

   async login(email, password) {
      try {
         const response = await fetch(`${this.apiUrl}/auth/login`, {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json',
               'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            body: JSON.stringify({
               email,
               password
            }),
         });

         if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`)
         }

         const { data } = await response.json();

         if (!data || !data.id) {
            return {
               creator: 'Saweria',
               status: false,
               message: 'Login failed - invalid credentials or account'
            };
         }

         return {
            creator: 'Saweria',
            status: true,
            data: {
               user_id: data.id,
               name: data.name,
               email: data.email
            }
         };
      } catch (error) {
         console.error('Saweria login error:', error);
         return {
            creator: 'Saweria',
            status: false,
            message: error.message
         };
      }
   }

   async createPayment(amount, message = 'Order') {
      try {
         if (!this.user_id) {
            return {
               creator: 'Saweria',
               status: false,
               message: 'User ID not configured'
            };
         }

         if (amount < 1000) {
            return {
               creator: 'Saweria',
               status: false,
               message: 'Minimum amount is 1000'
            };
         }

         const response = await fetch(`${this.apiUrl}/donations/${this.user_id}`, {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json',
               'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            body: JSON.stringify({
               agree: true,
               amount: Number(amount),
               customer_info: {
                  first_name: 'Customer',
                  email: "customer@example.com",
                  phone: '',
               },
               message: message,
               notUnderAge: true,
               payment_type: 'qris',
               vote: ''
            }),
         });

         if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`)
         }

         const { data } = await response.json();

         if (!data || !data.id) {
            return {
               creator: 'Saweria',
               status: false,
               message: 'Payment creation failed - no data received'
            };
         }

         const qr_string = data.qr_string;
         const qr_image = await qrcode.toDataURL(qr_string, {
            scale: 8
         });

         return {
            creator: 'Saweria',
            status: true,
            data: {
               ...data,
               expired_at: moment(data.created_at).add(10, 'minutes').format('DD/MM/YYYY HH:mm:ss'),
               receipt: `${this.baseUrl}/qris/${data.id}`,
               url: `${this.baseUrl}/qris/${data.id}`,
               qr_image: qr_image
            }
         };
      } catch (error) {
         console.error('Saweria payment error:', error);
         return {
            creator: 'Saweria',
            status: false,
            message: error.message
         };
      }
   }

   async checkPayment(id) {
      try {
         if (!this.user_id) {
            return {
               creator: 'Saweria',
               status: false,
               message: 'User ID not configured'
            };
         }

         const response = await fetch(`${this.baseUrl}/receipt/${id}`, {
            method: 'GET',
            headers: {
               "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
               "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
            },
         });

         if (!response.ok) {
            return {
               creator: 'Saweria',
               status: false,
               message: `Transaction not found (HTTP ${response.status})`
            };
         }

         const text = await response.text();
         const $ = cheerio.load(text);
         const statusMessage = $('h2.chakra-heading.css-14dtuui').text();

         if (!statusMessage) {
            return {
               creator: 'Saweria',
               status: false,
               message: 'Transaction not found or page structure changed'
            };
         }

         // Check for successful payment indicators
         const isSuccess = statusMessage.includes('success') || 
                          statusMessage.includes('berhasil') || 
                          statusMessage.includes('completed');

         return {
            creator: 'Saweria',
            status: isSuccess,
            message: statusMessage.trim() || 'Payment status unknown'
         };
      } catch (error) {
         console.error('Saweria check payment error:', error);
         return {
            creator: 'Saweria',
            status: false,
            message: error.message
         };
      }
   }
}

module.exports = { Saweria };
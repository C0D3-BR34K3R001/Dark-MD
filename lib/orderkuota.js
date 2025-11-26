require("../settings.js");
const axios = require("axios");

class OrderKuota {
    constructor() {
        this.apiToken = global.apiOrderKuota;
        this.urlQris = global.qrisOrderKuota;
        this.merchantId = global.merchantIdOrderKuota;
        this.baseUrl = "https://gateway.elevate.web.id/api/orkut";
    }

    async createPayment(amount) {
        try {
            const response = await axios.get(`${this.baseUrl}/createpayment?amount=${amount}&codeqr=${this.urlQris}`);
            if (response.status !== 200) throw new Error(`API returned status: ${response.status}`)
            return response.data.result
        } catch (error) {
            throw new Error(`Payment creation failed: ${error.message}`)
        }
    }
    
    async checkStatus() {
        try {
            const response = await axios.get(`${this.baseUrl}/checkstatus?merchant=${this.merchantId}&keyorkut=${this.apiToken}`);
            if (response.status !== 200) throw new Error(`API returned status: ${response.status}`)
            return response.data;
        } catch (error) {
            throw new Error(`Status check failed: ${error.message}`)
        }
    }

    async validateCredentials() {
        if (!this.apiToken || !this.merchantId || !this.urlQris) {
            throw new Error("Missing required credentials: apiToken, merchantId, or urlQris")
        }
        return true
    }
}

module.exports = { OrderKuota };
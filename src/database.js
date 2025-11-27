const fs = require('fs');
const path = require('path');

class DataBase {
    constructor() {
        this.path = './database.json';
    }

    async read() {
        try {
            if (fs.existsSync(this.path)) {
                const data = fs.readFileSync(this.path, 'utf8');
                return JSON.parse(data);
            }
            return {};
        } catch (error) {
            console.error('Database read error:', error);
            return {};
        }
    }

    async write(data) {
        try {
            fs.writeFileSync(this.path, JSON.stringify(data, null, 2));
            return true;
        } catch (error) {
            console.error('Database write error:', error);
            return false;
        }
    }
}

module.exports = DataBase;

const fs = require('fs');
const chalk = require('chalk');
const path = require('path');

function cleaningSession(directory) {
    fs.readdir(directory, (err, files) => {
        if (err) {
            console.log(chalk.red('Error reading session directory:', err.message));
            return;
        }
    
        let count = 0;
        const promises = [];

        files.forEach(file => {
            const filePath = path.join(directory, file);
            
            const promise = new Promise((resolve) => {
                fs.stat(filePath, (err, stats) => {
                    if (err) {
                        console.log(chalk.red('Error stating file:', filePath, err.message));
                        resolve();
                        return;
                    }
                    
                    const fileTime = stats.mtime;
                    const currentTime = new Date();
                    const fileAgeInHours = (currentTime - fileTime) / (1000 * 60 * 60);

                    if (fileAgeInHours > 2 && !file.includes("creds.json")) {
                        fs.unlink(filePath, (unlinkErr) => {
                            if (!unlinkErr) {
                                count += 1;
                                console.log(chalk.yellow('Cleaned session file:', file));
                            } else {
                                console.log(chalk.red('Error deleting file:', filePath, unlinkErr.message));
                            }
                            resolve();
                        });
                    } else {
                        resolve();
                    }
                });
            });
            promises.push(promise);
        });

        Promise.all(promises).then(() => {
            if (count > 0) {
                console.log(chalk.cyan.bold(`✅ ${count} session trash files successfully cleaned`));
            }
        });
    });
}

module.exports = { cleaningSession }
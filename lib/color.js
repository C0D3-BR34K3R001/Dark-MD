const chalk = require('chalk')

const color = (text, color) => {
    return !color ? chalk.green(text) : chalk.keyword(color)(text)
}

const bgcolor = (text, bgcolor) => {
    return !bgcolor ? chalk.green(text) : chalk.bgKeyword(bgcolor)(text)
}

const Lognyong = (text, color) => {
    return !color ? chalk.yellow('[ ! ] ') + chalk.green(text) : chalk.yellow('=> ') + chalk.keyword(color)(text)
}

const successLog = (text) => {
    return chalk.green('✅ ') + chalk.white(text)
}

const errorLog = (text) => {
    return chalk.red('❌ ') + chalk.white(text)
}

const warningLog = (text) => {
    return chalk.yellow('⚠️ ') + chalk.white(text)
}

const infoLog = (text) => {
    return chalk.blue('ℹ️ ') + chalk.white(text)
}

module.exports = {
    color,
    bgcolor,
    Lognyong,
    successLog,
    errorLog,
    warningLog,
    infoLog
}
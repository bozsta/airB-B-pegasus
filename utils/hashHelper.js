const crypto = require('crypto-js')
const encBase64 = require("crypto-js/enc-base64");

const generateHash = (password, salt) => {
    if (!password || !password.trim()
    || !salt || !salt.trim()
    || typeof password !== 'string'
    || typeof salt !== 'string') {
        throw new Error("Failled to generate hash")
    }
    return crypto.SHA256(password + salt).toString(encBase64)
}

module.exports = generateHash
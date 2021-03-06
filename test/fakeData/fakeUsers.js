const mongoose = require('mongoose')
const password = 'password'
const salt = 'salt'
const generateHash = require('../../utils/hashHelper')
const user1 =   {
    _id: new mongoose.mongo.ObjectId('56cb91bdc3464f14678934ca'),
    token: 'token',
    email: 'email@email.fr',
    account: {
        username: 'username',
        name: 'name',
        description: 'description',
        photo: { url:'secure_url1', public_id: 'public_id1' },
    },
    hash: generateHash(password, salt),
    salt: salt,
    updatePasswordToken: 'updatePasswordToken1',
    updatePasswordExpiredAt: Date.now()  + (15 * 60000)
}
const user2 =   {
    _id: new mongoose.mongo.ObjectId('56cb91bdc3464f14678934cb'),
    token: 'token2',
    email: 'email2@email.fr',
    account: {
        username: 'username2',
        name: 'name2',
        description: 'description2',
    },
    hash: generateHash(password, salt),
    salt: salt,
    updatePasswordToken: 'updatePasswordToken2',
    updatePasswordExpiredAt: Date.now()  + (15 * 60000)
}

module.exports = {
    user1,
    user2
}

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
    },
    hash: generateHash(password, salt),
    salt: salt
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
    salt: salt
}

module.exports = {
    user1,
    user2
}

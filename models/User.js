const monggose = require('mongoose')

const User = monggose.model('User', {
    token: {
       type: String,
       require: true
    },
    email: {
        type: String,
        require: true,
        unique: true
     },
    username: {
        type: String,
        require: true,
        unique: true
     },
     name: {
        type: String,
        require: true
     },
    description:{
        type: String,
        require: true
     },
     hash: {
         type: String,
         require: true
     },
     salt: {
        type: String,
        require: true
     }
})

module.exports = User
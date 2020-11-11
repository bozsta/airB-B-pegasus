const mongose = require('mongoose')

const Room = mongose.model('Room', {
    title: {
        type: String,
        require: true
    },
    description: {
        type: String,
        require: true
    },
    price: {
        type: Number,
        require: true
    },
    photos: [Object],
    location: [Number],
    user: {
        type: mongose.Schema.Types.ObjectId,
        ref: 'User'
    }
})

module.exports = Room
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
    location: {
        type: [Number], // Longitude et latitude
        index: "2d", // Créer un index geospatial https://docs.mongodb.com/manual/core/2d/
      },
    user: {
        type: mongose.Schema.Types.ObjectId,
        ref: 'User'
    }
})

module.exports = Room
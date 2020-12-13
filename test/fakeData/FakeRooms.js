const mongoose = require('mongoose')
const Room1 = {
    _id: new mongoose.mongo.ObjectId('111111111111111111111111'),
    title: "Room in Paris 1",
    description: "Paris 1",
    price: 250,
    location: {
      lat: 48.888823,
      lng: 3.34118
    },
    user: new mongoose.mongo.ObjectId('111111111111111111111111')
}
const Room2 = {
    _id: new mongoose.mongo.ObjectId('222222222222222222222222'),
    title: "Room in BREST 2",
    description: "Breizh 3",
    price: 150,
    location: {
      lat: 40.888823,
      lng: 13.34118
    },
    user: new mongoose.mongo.ObjectId('222222222222222222222222')
}

module.exports = {
    Room1,
    Room2
}
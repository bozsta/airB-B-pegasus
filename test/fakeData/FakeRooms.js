const mongoose = require('mongoose')
const Room1 = {
    _id: new mongoose.mongo.ObjectId('111111111111111111111111'),
    photos: [ {}, {}, {}, {} ],
    title: "Room in Paris 1",
    description: "Paris 1",
    price: 250,
    location: [48.888823, 3.34118],
    user: new mongoose.mongo.ObjectId('111111111111111111111111')
}
const Room2 = {
    _id: new mongoose.mongo.ObjectId('222222222222222222222222'),
    title: "Room in BREST",
    description: "Breizh",
    price: 150,
    location: [40.888823, 13.34118],
    user: new mongoose.mongo.ObjectId('222222222222222222222222')
}
const Room3 = {
  _id: new mongoose.mongo.ObjectId('333333333333333333333333'),
  title: "Room in Marseille",
  description: "Marseille",
  price: 300,
  location: [20.888823, 20.34118],
  user: new mongoose.mongo.ObjectId('333333333333333333333333')
}

const Room4 = {
  _id: new mongoose.mongo.ObjectId('444444444444444444444444'),
  title: "Room in Marseille 2",
  description: "Marseille 2",
  price: 50,
  location: [30.888823, 10.34118],
  user: new mongoose.mongo.ObjectId('444444444444444444444444')
}
module.exports = {
    Room1,
    Room2,
    Room3,
    Room4
}
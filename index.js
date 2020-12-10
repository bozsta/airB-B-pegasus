const express = require('express')
const formidable = require('express-formidable')
const cors = require('cors')
const mongoose = require('mongoose')
const helmet = require("helmet")
const cloudinary = require('cloudinary').v2
require('dotenv').config()
const mailgun = require('mailgun-js')({apiKey: process.env.MAILGUN_API_KEY, domain: process.env.MAILGUN_DOMAIN});


mongoose.connect(process.env.MONGODB_URI, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useCreateIndex: true
})

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
}); 

const PORT = process.env.PORT || 3000
const app = express()

// Middleware
app.use(formidable())
app.use(cors())
app.use(helmet())

// Routes
const userRoutes = require('./routes/User')
app.use('/user', userRoutes)
const roomRoutes = require('./routes/rooms')
app.use('/room', roomRoutes)


app.all('*', (req,res) => {
    res.status(404).json({error: { message: 'URL not found'}})
})

const server = app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`)
})

module.exports = {
    app,
    server
}

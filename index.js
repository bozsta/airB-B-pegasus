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

const PORT = process.env.PORT
const app = express()

// Middleware
app.use(formidable())
app.use(cors())
app.use(helmet())

// Routes
const userRoutes = require('./routes/user')
app.use('/user', userRoutes)
const roomRoutes = require('./routes/rooms')
app.use('/room', roomRoutes)

/* Only for test */
app.get('/mail', (req,res) => {
    var data = {
        from: 'Excited User <me@samples.mailgun.org>',
        to: 'lubozfabien@hotmail.com',
        subject: 'Hello test mail gun',
        text: 'Testing some Mailgun awesomeness!'
      }; 

      mailgun.messages().send(data, function (error, body) {
        console.log('body mailgun:', body);
      });

    res.status(200).json({ message: 'test mailgun'})
})

app.all('*', (req,res) => {
    res.status(404).json({error: { message: 'URL not found'}})
})

app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`)
})
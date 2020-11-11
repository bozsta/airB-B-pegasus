const express = require('express')
const formidable = require('express-formidable')
const cors = require('cors')
const mongoose = require('mongoose')
const helmet = require("helmet");

mongoose.connect('mongodb://localhost/airBB-pegasus', {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useCreateIndex: true
})

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

app.all('*', (req,res) => {
    res.status(404).json({error: { message: 'URL not found'}})
})

app.listen(3000, () => {
    console.log(`Server started on port 3000`)
})
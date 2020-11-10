const express = require('express')
const formidable = require('express-formidable')
const cors = require('cors')
const mongoose = require('mongoose')

mongoose.connect('mongodb://localhost/airBB-pegasus', {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useCreateIndex: true
})

const app = express()

app.use(formidable())
app.use(cors())

// Routes
const userRoutes = require('./routes/User')
app.use('/user', userRoutes)

app.all('*', (req,res) => {
    res.status(404).json({error: { message: 'URL not found'}})
})

app.listen(3000, () => {
    console.log(`Server started on port 3000`)
})
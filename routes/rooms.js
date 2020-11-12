const router = require('express').Router()
const { User, Room } = require('../models/Models')
const isAuthenticated  = require('../middlewares/isAuthenticated')
const { CustomException } = require('../utils/exeptionHelper')


// /room/publish
router.post('/publish', isAuthenticated, async (req,res) => {
    try {
        let { title, description, price, location } = req.fields

        if (!title || !title.trim() 
        || !description || !description.trim()
        || !price || isNaN(price)
        || !location 
        || !location.lat || isNaN(location.lat)
        || !location.lng || isNaN(location.lng)) {
            throw new Error('Missing parameters')
        }

        title = title.trim()
        description = description.trim()
        price = Number(price)
        
        const locationTab = [Number(location.lat), Number(location.lng)]
        const newRoom = new Room({
            title,
            description,
            price,
            location: locationTab,
            user: req.user._id
        })

        const result = await newRoom.save()
        res.status(200).json(result)
    } catch (error) {
        res.status(400).json({ error: { message: error.message}})
    }
})

router.get('/', async (req,res) => {
    try {
        const rooms = await Room.find({}, { description: false })
        res.status(200).json(rooms)
    } catch (error) {
        res.status(400).json({ error: {message: error.message}})
    }
})

router.get('/:id', async (req,res) => {
    try {
        const { id } = req.params
        const room = await Room.findById(id).populate({
            path: 'user',
            select: 'account'
        })
        res.status(200).json(room)
    } catch (error) {
        res.status(400).json({ error: { message: error.message}})
    }
})

router.put('/update/:id', isAuthenticated, async (req,res) => {
    try {
        let { title, description, price, location } = req.fields
        const { id } = req.params
        const room = await Room.findById(id)

        if (!room) {
            throw CustomException(404, 'Id not found')
        }
        if (!req.user._id.equals(room.user._id)) {
            throw CustomException(401, 'Unauthorized')
        }

        if (title) {
            if (title.trim()) {
                room.title = title.trim()
            }
        }
        if (description) {
            if (description.trim()) {
                room.description = description.trim()
            }
        }
        if (price && !isNaN(price)) {
            room.price = Number(price)
        }
        if (location) {
            if (!isNaN(location.lat) && !isNaN(location.lng)) {
                room.location = [location.lat, location.lng]
            }
        }
        const result = await room.save()

        res.status(200).json(result)
    } catch (error) {
        const status = error.status || 400
        res.status(status).json({ error: { message: error.message}})
    }
})

router.delete('/delete/:id', isAuthenticated, async (req,res) => {
    try {
        const { id } = req.params
        const room = await Room.findById(id)
        if (!room) {
            throw CustomException(404, 'ID not found')
        }
        if (!req.user._id.equals(room.user._id)) {
            throw CustomException(401, 'Unauthorized')
        }
       await room.deleteOne({id})
        res.status(200).json({ message: 'Room deleted'})
    } catch (error) {
        const status = error.status || 400
        res.status(status).json({ error: { message: error.message }})
    }
})

module.exports = router
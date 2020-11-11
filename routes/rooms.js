const router = require('express').Router()
const { User, Room } = require('../models/Models')
const isAuthenticated  = require('../middlewares/isAuthenticated')


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
        
        const locationTab = [location.lat, location.lng]
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

module.exports = router
const router = require('express').Router()
const { User, Room } = require('../models/Models')
const isAuthenticated  = require('../middlewares/isAuthenticated')
const { CustomException } = require('../utils/exeptionHelper')
const cloudinary = require('cloudinary').v2

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

router.get('/filtered', async (req,res) => {
    try {
        const { title, priceMin, priceMax, sort, page, limit } = req.query

        const filter = {}
        const sortItem = {}
        let toSkip = 0
        let numMax = 0

        if (title) {
            filter.title = new RegExp(title, "i")
        }
        if (priceMin || priceMax) {
            const price = {}
            if (priceMin) {
                price.$gte = Number(priceMin) 
                
            }
            if (priceMax) {
                price.$lte = Number(priceMax)
            }
            filter.price = price
        }
        if (sort) {
            switch (sort) {
                case 'price-desc' :
                    sortItem.price = -1
                    break 
                case 'price-asc' :
                    sortItem.price = 1
                    break 
                default :
                throw new Error('Invalde sort parameter value')
            }
        }
        if (limit) {
            numMax = Number(limit) 
            if (page && page > 0 ) {
                toSkip = Number(limit * (page - 1))
            }
        }
     
        const rooms = await Room.find(filter).sort(sortItem).skip(toSkip).limit(numMax)

        res.status(200).json(rooms)
    } catch (error) {
        res.status(400).json({ error: { message: error.message } })
    }
})

router.get('/around', async (req, res) => {
    try {
        let { latitude, longitude } = req.query
        if (!latitude || !longitude) {
            throw new Error('Missing parameters')
        }
        if (isNaN(latitude) || isNaN(longitude)) {
            throw new Error('Unexpected parameters format')
        }
        const around = await Room.find({
            location: {
                $near: [latitude, longitude],
                $maxDistance: 1.5
            }
        })
        res.status(200).json(around)
    } catch (error) {
        const status = error.status || 400
        res.status(status).json({ error: { message: error.message }})
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
        res.status(400).json({ error: { message: error.message } })
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
            throw CustomException(404, 'Room id not found')
        }
        if (!req.user._id.equals(room.user._id)) {
            throw CustomException(401, 'Unauthorized')
        }
        await cloudinary.api.delete_resources_by_prefix(`airBnB/rooms/${id}`)
        cloudinary.api.delete_folder(`airBnB/rooms/${id}`)
        await room.deleteOne({id})
        res.status(200).json({ message: 'Room deleted'})
    } catch (error) {
        const status = error.status || 400
        res.status(status).json({ error: { message: error.message }})
    }
})

router.put('/upload_picture/:id', isAuthenticated, async (req,res) => {
    try {
        const { id } = req.params
        const { picture } = req.files
        const room = await Room.findById(id)
        if (!room) {
            throw CustomException(404, 'Room not found')
        }
        if (!req.user._id.equals(room.user._id)) {
            throw CustomException(401, 'Unauthorized')
        }
        if (!picture) {
            throw new Error('Missing file parameters')
        }
        if (room.photos.length >= 5) {
            throw new Error('Maximum number of images reached')
        }
        const result = await cloudinary.uploader.upload(picture.path, {folder: `airBnB/rooms/${id}`})
        if (!result.secure_url) {
            throw new Error('Error cloud image upload')
        }
       
        room.photos.push({url: result.secure_url, public_id: result.public_id})
        const updatedRoom = await room.save()

        res.status(200).json(
            {
                pictures: updatedRoom.photos,
                _id: updatedRoom._id,
                title: updatedRoom.title,
                description: updatedRoom.description,
                price: updatedRoom.price,
                location: updatedRoom.location,
                user: updatedRoom.user._id,
              }
        )

    } catch (error) {
        const status = error.status || 400
        res.status(status).json({ error: { message: error.message }})
    }
})

router.delete('/delete_picture/:id', isAuthenticated, async (req,res) => {
    try {
        const { id } = req.params
        const { picture_id } = req.fields
        const room = await Room.findById(id)

        if (!picture_id) {
            throw new Error('Missing parameters')
        }
        if (!room) {
            throw CustomException(404,'Room not found')
        }
        if (!req.user._id.equals(room.user._id)) {
            throw CustomException(401, 'Unauthorizeds')
        }
        await cloudinary.api.delete_resources([picture_id])
        for (let i = 0; i < room.photos.length; i++) {
            if (room.photos[i].public_id === picture_id) {
                room.photos.splice(i,1)
            }
        }
        room.save()
        if (!room.photos.length) {
            cloudinary.api.delete_folder(`airBnB/rooms/${id}`)
        }
        res.status(200).json({ message: "Picture deleted"})
    } catch (error) {
        const status = error.status || 400
        res.status(status).json({ error: { message: error.message }})
    }
})


module.exports = router
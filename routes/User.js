const router = require('express').Router()
const uid = require('uid2')
const crypto = require('crypto-js')
const encBase64 = require("crypto-js/enc-base64");
const { User, Room } = require('../models/Models');
const { CustomException } = require('../utils/exeptionHelper');
const isAuthenticated = require('../middlewares/isAuthenticated');
const cloudinary = require('cloudinary').v2

router.post('/sign_up', async (req,res) => {
    try {
        let { password, email, username, name, description} = req.fields
        if (!password || !password.trim() 
            || !email || !email.trim() 
            || !username || !username.trim()
            || !name || !name.trim()
            || !description || !description.trim()) {
            throw new Error("Missing parameters")
        }
        password = password.trim()
        email = email.trim()
        username = username.trim()
        name = name.trim()
        description = description.trim()

        const alreadyExisit = await User.find({$or: [
            { email },
            { username }
        ]})

        if (alreadyExisit) {
            const fields = []
            if (alreadyExisit.email === email) {
                fields.push('Email')
            }
            if (alreadyExisit.username === username) {
                fields.push('Username')
            }
            const message = fields.length === 2 ? 'Email and Username' : fields[0]
            // status 409
            throw CustomException(409, `${message} already exist`)
            // throw new Error(`${message} already exist`)
        }

        const token = uid(24)
        const salt = uid(24)
        const hash = crypto.SHA256(password + salt).toString(encBase64)
  
        const newUser = new User({
            token,
            email,
            account: {
                username,
                name,
                description,
            },
            hash,
            salt
        })

        const user = await newUser.save()
        const result = {
            _id: user._id,
            token: user.token,
            email: user.email,
            username: user.account.username,
            description: user.account.description,
            name: user.account.name
        }
        res.status(200).json(result)
    } catch (error) {
        const status = error.status || 400
       res.status(status).json({ error: { message: error.message }}) 
    }
})

router.post('/log_in', async (req,res) => {
    try {
        let { password, email } = req.fields
        if (!password || !password.trim() 
            || !email || !email.trim()) {
                throw new Error('Missing parameters')
            }
            
        email = email.trim()
        password = password.trim()

        const user = await User.findOne({email})
        console.log('user', user)
        if (!user) {
            throw CustomException(401, 'Unauthorized')
        }

        const hash = crypto.SHA256(password + user.salt).toString(encBase64)
        if (hash !== user.hash) {
            // res.status(401).json({error :'Unauthorized'})
            throw CustomException(401, 'Unauthorized')
        }

        res.status(200).json({
            _id: user._id,
            token: user.token,
            email: user.email,
            username: user.username,
            description: user.description,
            name: user.name
        })
    } catch (error) {
        const status = error.status || 400
        res.status(status).json({ error: { message: error.message } })
    }
})
// pas de id en params ?
// todo test
router.put('/update/:id', isAuthenticated, async (req,res) => {
    try {
        let { username, name, email, description} = req.fields
        const { id } =  req.params
        
        const user = await User.findById(id)
        if (!user) {
            throw CustomException(404, 'User id not found')
        }
        if (!req.user._id.equals(user._id)) {
            throw CustomException(401, 'Unauthorized')
        }
        if (email) {
            if (email.trim()) {
                email = email.trim()
                const emailAlready = await User.findOne({email})
                if (emailAlready) {
                    throw CustomException(409, `emailAlready already exist`)
                }
                user.email = email
            } else { throw new Error('Email is an empty string')}
        }
        if (username) {
            if (username.trim()) {
                username = username.trim()
                const userNameAlready = await User.findOne({username})
                if (userNameAlready) {
                    throw CustomException(409, `username already exist`)
                }
                user.account.username = username
            } else { throw new Error('Username is an empty string')}
        }
        if (name) {
            if (name.trim()) {
                name = name.trim()
                user.account.name = name
            } else { throw new Error('Name is an empty string')}
        }
        if (description) {
            if (description.trim()) {
                description = description.trim()
                user.account.description = description
            } else { throw new Error('Description is an empty string')}
        }
        const updatedUser = await user.save()
        res.status(200).json({
            _id: updatedUser._id,
            email: updatedUser.email,
            account: {
                username: updatedUser.account.username,
                name: updatedUser.account.name,
                description: updatedUser.account.description,
                photo: {
                url: updatedUser.account.photo,
                picture_id:updatedUser.account.photo,
                }
            },
            rooms: updatedUser.rooms
        })
    } catch (error) {
        const status = error.status || 400
        res.status(status).json({ error: { message: error.message } })
    }
})
// todo test
router.put('/update_password', isAuthenticated, async (req,res) => {
    try {
        
    } catch (error) {
        const status = error.status || 400
        res.status(status).json({ error: { message: error.message } })
    }
})
// todo
router.post('/recover_password', (req,res) => {
    try {
        
    } catch (error) {
        const status = error.status || 400
        res.status(status).json({ error: { message: error.message } })
    }
})
router.post('/reset_password', (req, res) => {
    try {
        
    } catch (error) {
        const status = error.status || 400
        res.status(status).json({ error: { message: error.message } })
    }
})
// todo
router.post('/user/delete', (req,res) => {
    try {
        
    } catch (error) {
        const status = error.status || 400
        res.status(status).json({ error: { message: error.message } })
    }
})

router.put('/upload_picture/:id', isAuthenticated, async (req,res) => {
    try {
        const { id } =  req.params
        const picture = req.files.picture

        if (!picture) {
            throw new Error('Missing file paraméters')
        }

        const user = await User.findById(id)
        if (!user) {
            throw CustomException(404, 'User id not found')
        }
        if (!req.user._id.equals(user._id)) {
            throw CustomException(401, "Unauthorized")
        }
        const result = await cloudinary.uploader.upload(picture.path, { folder: `airBnB/users/${user._id}` })
        if (!result.secure_url) {
            throw new Error('Error cloud image upload')
        }
        user.account.photo = {
            url: result.secure_url,
            public_id: result.public_id
        }
        const updatedUser = await user.save()
        res.status(200).json(
            {
                account: {
                  photo: updatedUser.account.photo,
                  username: updatedUser.account.username,
                  description: updatedUser.account.description,
                  name: updatedUser.account.name
                },
                _id: updatedUser._id,
                email: updatedUser.email,
                rooms: updatedUser.rooms
            }
        )
    } catch (error) {
        const status = error.status || 400
        res.status(status).json({ error: { message: error.message}}) 
    }
})

router.delete('/delete_picture/:id', isAuthenticated, async (req,res) => {
    try {
        const { id } = req.params
        const user = await User.findById(id)
        if (!user) {
            throw CustomException(404, 'User not found')
        }
        if (!req.user._id.equals(user._id)) {
            throw CustomException(401, "Unauthorized")
        }
        if (!user.account.photo || !user.account.photo.public_id) {
            throw CustomException(404, 'No item to delete')
        }
        const image_id = user.account.photo.public_id
        await cloudinary.api.delete_resources([user.account.photo.public_id])
        await cloudinary.api.delete_folder(`airBnB/users/${id}`)

        user.account.photo = null
        const userUpdated = await user.save()
        
        res.status(200).json(
            {
                account: {
                  photo: userUpdated.account.photo,
                  username: userUpdated.account.username,
                  description: userUpdated.account.description,
                  name: userUpdated.account.name,
                },
                _id: userUpdated._id,
                email: userUpdated.email,
                rooms: userUpdated.rooms
              }
        )
    } catch (error) {
        const status = req.status || 400
        res.status(status).json({ error: {message: error.message}})
    }
})

router.get('/rooms/:id', async (req,res) => {
    try {
        const { id } = req.params
        const rooms = await Room.find({user: id})
        res.status(200).json(rooms)
    } catch (error) {
        const status = req.status || 400
        res.status(status).json({ error: {message: error.message}}) 
    }
})

router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params
        const user = await User.findById(id).select('_id account rooms')
        if (!user) {
            throw CustomException(404, 'User id not found')
        }
        res.status(200).json(user)
    } catch (error) {
        const status = req.status || 400
        res.status(status).json({ error: {message: error.message}})
    }
})

module.exports = router
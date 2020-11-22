const router = require('express').Router()
const uid = require('uid2')
const crypto = require('crypto-js')
const encBase64 = require("crypto-js/enc-base64");
const { User, Room } = require('../models/Models');
const { CustomException } = require('../utils/exeptionHelper');
const isAuthenticated = require('../middlewares/isAuthenticated');
const mailgun = require('mailgun-js')({apiKey: process.env.MAILGUN_API_KEY, domain: process.env.MAILGUN_DOMAIN});
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
            { "account.username": username }
        ]})

        if (alreadyExisit.length) {
            const fields = []
            for (let i = 0; i < alreadyExisit.length; i++) {
                if (alreadyExisit[i].email === email) {
                    fields.push('Email')
                }
                if (alreadyExisit[i].account.username === username) {
                    fields.push('Username')
                }
            }
           
            const message = fields.length === 2 ? 'Email and Username' : fields[0]
            throw CustomException(409, `${message} already exist`)
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

// todo test
router.put('/update', isAuthenticated, async (req,res) => {
    try {
        let { username, name, email, description} = req.fields
        const user = req.user
        if (email !== undefined) { 
            if (email.trim().length) {
                email = email.trim()
                const emailAlready = await User.findOne({email})
                if (emailAlready) {
                    throw CustomException(409, `Email already already exist`)
                }
                user.email = email
            } else { throw new Error('Email is an empty string')}
        }
        if (username !== undefined) {
            if (username.trim().length) {
                username = username.trim()
                const userNameAlready = await User.findOne({"account.username": username })
                if (userNameAlready) {
                    throw CustomException(409, `Username already exist`)
                }
                user.account.username = username
            } else { throw new Error('Username is an empty string')}
        }
        if (name !== undefined) {
            if (name.trim().length) {
                name = name.trim()
                user.account.name = name
            } else { throw new Error('Name is an empty string')}
        }
        if (description !== undefined) {
            if (description.trim().length) {
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
        let { oldPass, newPass } = req.fields
        if (!oldPass || !oldPass.trim() || !newPass || !newPass.trim()) {
            throw new Error('Missing data parameters')
        }
        const user =  await User.findById(req.user._id)
        if (!user) {
            throw CustomException(404, 'User not found')
        }

        const oldHash = crypto.SHA256(oldPass + user.salt).toString(encBase64)
        const newHash= crypto.SHA256(newPass + user.salt).toString(encBase64)

        if (oldHash !== user.hash) {
            throw CustomException(401, 'Unauthorized')
        }

        user.hash = newHash
        const updatedUser = await user.save()
        res.status(200).json({
            _id: updatedUser._id,
            email: updatedUser.email,
            token: updatedUser.token,
            account: {
              username: updatedUser.account.username,
              name: updatedUser.account.name,
              description: updatedUser.account.description,
              photo: updatedUser.account.photo
            },
            rooms: updatedUser.account.rooms
        })  
    } catch (error) {
        const status = error.status || 400
        res.status(status).json({ error: { message: error.message } })
    }
})
// todo test
router.post('/recover_password', async (req,res) => {
    try {
        const { email } = req.fields
        const resetToken = uid(24)
        const expirDate = Date.now()  + (15 * 60000)

        const user = await User.findOne({email})
        if(!user) {
            throw CustomException(404, 'Email not found')
        }
        user.updatePasswordToken = resetToken
        user.updatePasswordExpiredAt = expirDate
        await user.save()

        var data = {
            from: 'noreply@myairbnb.fr <noreply@myairbnb.fr>',
            to: email,
            subject: 'My airBnB reset password',
            html: `<h2>reset password link</h2>
            <a>link to reset IHM</a>`
          }; 
    
          const result = await mailgun.messages().send(data)
          res.status(200).json({ message: 'A link has been sent to the user'})
        
    } catch (error) {
        const status = error.status || 400
        res.status(status).json({ error: { message: error.message } })
    }
})
// todo test
router.post('/reset_password', async (req, res) => {
    try {
        const { passwordToken, password } = req.fields
        const newSalt = uid(24)
        if (!passwordToken || !passwordToken.trim() || !password || !password.trim()) {
            throw new Error('Missing Parameters')
        }
        const user = await User.findOne({passwordToken})
        if (!user) {
            throw CustomException(404, 'User not found')
        }
        if (Date.now() > user.updatePasswordExpiredAt) {
            throw CustomException(401, "Unauthorized")
        }
        const newHash = crypto.SHA256(password + salt).toString(encBase64)
        user.salt = newSalt
        user.hash = newHash
        const updatedUser = user.save()
        res.status(200).json({
            _id: updatedUser._id,
            email: updatedUser.email,
            token: updatedUser.token 
        })
        
    } catch (error) {
        const status = error.status || 400
        res.status(status).json({ error: { message: error.message } })
    }
})
// todo test
router.delete('/delete/:id', async (req,res) => {
    try {
        const id = req.query
        await Room.deleteMany({user: id})
        await User.deleteOne({ id })
        res.status(200).json({ message: "User deleted" })
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
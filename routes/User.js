const router = require('express').Router()
const uid = require('uid2')
const crypto = require('crypto-js')
const encBase64 = require("crypto-js/enc-base64");
const { User } = require('../models/Models');
const { CustomException } = require('../utils/exeptionHelper');

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

        const alreadyExisit = await User.findOne({$or: [
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
            throw new Error(`${message} already exist`)
        }

        const token = uid(24)
        const salt = uid(24)
        const hash = crypto.SHA256(password + salt).toString(encBase64)
  
        const newUser = new User({
            token,
            email,
            username,
            name,
            description,
            hash,
            salt
        })

        const user = await newUser.save()
        const result = {
            _id: user._id,
            token: user.token,
            email: user.email,
            username: user.username,
            description: user.description,
            name: user.name
        }
        res.status(200).json(result)
    } catch (error) {
       res.status(400).json({ error: { message: error.message }}) 
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
module.exports = router
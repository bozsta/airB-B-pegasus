const { User } = require('../models/Models')

const isAuthenticated = async (req, res, next) => {
    try {
        if (req.headers.authorization) {
            const token = req.headers.authorization.replace('Bearer ', '')
            const user = await User.findOne({token})

            if (user) {
                req.user = user
                return next()
            }
        }
        throw new Error('Unauthorized')
    } catch (error) {
        res.status(401).json({ error: { message: error.message}})
    }
}

module.exports = isAuthenticated
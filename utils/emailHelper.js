const mailgun = require('mailgun-js')({apiKey: process.env.MAILGUN_API_KEY, domain: process.env.MAILGUN_DOMAIN});

const send = async (data) => {
    try {
        const result = await mailgun.messages().send(data)
        return result
    } catch (error) {
        throw new Error(error)
    }
}

module.exports = {
    send
}
const CustomException = (status, message) => {
    if (isNaN(status)) {
        throw new Error('Invalide status Exeption format')
    }
    if (!message || !message.trim()) {
        throw new Error('Invalide message Exeption format')
    }
    const error = new Error(message) 
    error.status = status
    return error
}

module.exports = {
    CustomException
}
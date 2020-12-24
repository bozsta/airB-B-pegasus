const cloudinary = require('cloudinary').v2

const deleteResourcesAndFolder = async (path, id) => {
    await cloudinary.api.delete_resources_by_prefix(`${path}${id}`)
        cloudinary.api.delete_folder(`${path}${id}`)
}
module.exports = {
    deleteResourcesAndFolder
}
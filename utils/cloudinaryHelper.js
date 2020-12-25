const cloudinary = require('cloudinary').v2

const deleteResourcesAndFolder = async (path, id) => {
    await cloudinary.api.delete_resources_by_prefix(`${path}${id}`)
        cloudinary.api.delete_folder(`${path}${id}`)
}

const deleteImage = async (imagePublicId, folderPath) => {
    // await cloudinary.api.delete_resources([user.account.photo.public_id])
    await cloudinary.api.delete_resources(imagePublicId)
    // await cloudinary.api.delete_folder(`airBnB/users/${id}`)
    await cloudinary.api.delete_folder(folderPath)
}
const uploadImage = async (picturePath, folderPath) => {
    // const result = await cloudinary.uploader.upload(picture.path, { folder: `airBnB/users/${user._id}` })
    const result = await cloudinary.uploader.upload(picturePath, { folder: folderPath })
    return result
}

module.exports = {
    deleteResourcesAndFolder,
    uploadImage,
    deleteImage,
}
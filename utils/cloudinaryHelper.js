const cloudinary = require('cloudinary').v2

const deleteResourcesAndFolder = async (path, id) => {
    await cloudinary.api.delete_resources_by_prefix(`${path}${id}`)
        cloudinary.api.delete_folder(`${path}${id}`)
}

const deleteImageAndFolder = async (imagePublicId, folderPath) => {
    await cloudinary.api.delete_resources(imagePublicId)
    await cloudinary.api.delete_folder(folderPath)
}
const deleteImage = async (imagePublicId) => {
    await cloudinary.api.delete_resources(imagePublicId)
}
const deleteFolder = async (folderPath) => {
    await cloudinary.api.delete_folder(folderPath)
}
const uploadImage = async (picturePath, folderPath) => {
    const result = await cloudinary.uploader.upload(picturePath, { folder: folderPath })
    return result
}

module.exports = {
    deleteResourcesAndFolder,
    deleteImageAndFolder,
    uploadImage,
    deleteImage,
    deleteFolder
}
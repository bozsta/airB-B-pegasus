
// tests/db-handler.js

const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

const mongod = new MongoMemoryServer();

/**
 * Connect to the in-memory database.
 */
const connect = async () => {
    try {
        const uri = await mongod.getUri();
        const mongooseOpts = {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true,
        };
        await mongoose.connect(uri, mongooseOpts);
    } catch (error) {
        throw new Error('db-handler connect error', error.message)
    }
}

/**
 * Drop database, close the connection and stop mongod.
 */
const closeDatabase = async () => {
    try {
        await mongoose.connection.dropDatabase();
        await mongoose.connection.close();
        await mongod.stop();
    } catch (error) {
        throw new Error('db-handler closeDatabase error', error.message)
    }
}
/**
 * Insert data inl db collections.
 */
const insertData = async (collection, data) => {
    try {
        await mongoose.connection.collection(collection).insertMany(data)
    } catch (error) {
        throw new Error('db-handler insertData error', error.message)
    }
    
}

/**
 * Find all documents in a db collection.
 */
const findAllDocuments = async (collection, cb) => {
    try {
        mongoose.connection.collection(collection).find({}).toArray(function(err, result) {
            if (err) throw err;
            cb(result)
            // db.close();
        })
    } catch (error) {
        throw new Error('db-handler findAllDocuments error', error.message)
    }
}

/**
 * Find  document by Id in a db collection.
 */
const findDocumentById = async (collection, id) => {
    try {
        id = new mongoose.mongo.ObjectId(id)
        const result = await mongoose.connection.collection(collection).findOne({_id: id})
        return result
    } catch (error) {
        console.log('error', error.message)
        throw new Error('db-handler findDocumentById error', error.message)
    }
}

/**
 * Find documents by filter in a db collection.
 */
const findDocumentByFilter = async (collection, Filter) => {
    try {
        // const result = await mongoose.connection.collection(collection).findOne()
       const result = await mongoose.connection.collection(collection).findOne(Filter)
        return result
    } catch (error) {
        console.log('error', error.message)
        throw new Error('db-handler findDocumentById error', error.message)
    }
}

/**
 * Remove all the data for all db collections.
 */
const clearDatabase = async () => {
    try {
        const collections = await mongoose.connection.collections;

        for (const key in collections) {
            const collection = collections[key];
            await collection.deleteMany();
        }
    } catch (error) {
        throw new Error('db-handler clearDatabase error', error.message)
    }
}

module.exports = {
    connect,
    closeDatabase,
    insertData,
    findAllDocuments,
    findDocumentById,
    findDocumentByFilter,
    clearDatabase
}
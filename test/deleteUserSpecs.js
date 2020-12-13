const chai = require('chai')
const expect = chai.expect
const should = chai.should();
let chaiHttp = require('chai-http')
let { app, server } = require('../index')
chai.use(chaiHttp);
const mongoose = require('mongoose')
const generateHash = require('../utils/hashHelper')

const dbHandler = require('./db/db-handler')

describe('Delete user by id', () => {
    before('before hook', async () => {
        mongoose.disconnect()
        await dbHandler.connect()
        const password = 'password'
        const salt = 'salt'
        const user1 =   {
            _id: new mongoose.mongo.ObjectId('56cb91bdc3464f14678934ca'),
            token: 'token',
            email: 'email@email.fr',
            account: {
                username: 'username',
                name: 'name',
                description: 'description',
            },
            hash: generateHash(password, salt),
            salt: salt
        }
        const user2 =   {
            _id: new mongoose.mongo.ObjectId('56cb91bdc3464f14678934cb'),
            token: 'token2',
            email: 'email2@email.fr',
            account: {
                username: 'username2',
                name: 'name2',
                description: 'description2',
            },
            hash: generateHash(password, salt),
            salt: salt
        }
        const user1Room1 = {
            _id: new mongoose.mongo.ObjectId('111111111111111111111111'),
            title: "Room in Paris 1",
            description: "Paris 1",
            price: 250,
            location: {
              lat: 48.888823,
              lng: 3.34118
            },
            user: new mongoose.mongo.ObjectId('56cb91bdc3464f14678934ca')
        }
        const user2Room1 = {
            _id: new mongoose.mongo.ObjectId('222222222222222222222222'),
            title: "Room in BREST 2",
            description: "Breizh 3",
            price: 150,
            location: {
              lat: 40.888823,
              lng: 13.34118
            },
            user: new mongoose.mongo.ObjectId('56cb91bdc3464f14678934cb')
        }
        await dbHandler.insertData('users', [user1])
        await dbHandler.insertData('rooms', [user1Room1])
    }) 
    after('Process after test', async () => {
        await dbHandler.closeDatabase()
        server.close()
    })
    describe('Should success', () => {
        it('delete user & user s room', done => {
            const userId = '56cb91bdc3464f14678934ca'
            const roomId = '111111111111111111111111'
            chai.request(app)
            .delete(`/user/delete/${userId}`)
            .set({ 'authorization': `Bearer token` })
            .end(async (req,res) => {
                res.should.have.status(200)
                expect(res.body.message).to.equal('User deleted')
                const userData = await dbHandler.findDocumentById('users', new mongoose.mongo.ObjectId(userId))
                expect(userData).to.equal(null)
                const roomData = await dbHandler.findDocumentByFilter('rooms', { user: new mongoose.mongo.ObjectId(userId) })
                expect(roomData).to.equal(null)
                done()
            })
        })
    })
})
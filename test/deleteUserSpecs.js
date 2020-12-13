const chai = require('chai')
const expect = chai.expect
const should = chai.should();
let chaiHttp = require('chai-http')
let { app, server } = require('../index')
chai.use(chaiHttp);
const mongoose = require('mongoose')
const users = require('./fakeData/fakeUsers')
const rooms = require('./fakeData/FakeRooms')

const dbHandler = require('./db/db-handler')

describe('Delete user by id', () => {
    before('before hook', async () => {
        mongoose.disconnect()
        await dbHandler.connect()
        /* const user1 =   {
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
        } */
       /*  const Room1 = {
            _id: new mongoose.mongo.ObjectId('111111111111111111111111'),
            title: "Room in Paris 1",
            description: "Paris 1",
            price: 250,
            location: {
              lat: 48.888823,
              lng: 3.34118
            },
            user: new mongoose.mongo.ObjectId('56cb91bdc3464f14678934ca')
        } */
        rooms.Room1.user = users.user1._id
        await dbHandler.insertData('users', [users.user1])
        await dbHandler.insertData('rooms', [rooms.Room1])
    }) 
    after('Process after test', async () => {
        await dbHandler.closeDatabase()
        server.close()
    })
    describe('Should success', () => {
        it('delete user & user s room', done => {
            chai.request(app)
            .delete(`/user/delete/${users.user1._id}`)
            .set({ 'authorization': `Bearer token` })
            .end(async (req,res) => {
                res.should.have.status(200)
                expect(res.body.message).to.equal('User deleted')
                const userData = await dbHandler.findDocumentById('users', users.user1._id)
                expect(userData).to.equal(null)
                const roomData = await dbHandler.findDocumentByFilter('rooms', { user: users.user1._id})
                expect(roomData).to.equal(null)
                done()
            })
        })
    })
})
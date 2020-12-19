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

describe('Get rooms', () => {
    before('before hook', async () => {
        mongoose.disconnect()
        await dbHandler.connect()
        await dbHandler.insertData('users', [users.user1, users.user2])
        rooms.Room1.user = users.user1._id
        rooms.Room2.user = users.user1._id
        rooms.Room3.user = users.user2._id
        // await dbHandler.insertData('rooms', [rooms.Room1, rooms.Room2, rooms.Room3])
    }) 
    after('Process after test', async () => {
        await dbHandler.closeDatabase()
        server.close()
    })
    describe('Should success', () => {
        it('get all rooms data', done => {
            chai.request(app)
            .get(`/room/`)
            .end((req,res) => {
                res.should.have.status(200)
                // expect((res.body).length).to.equal(3)
                done()
            })
        })
    })
})
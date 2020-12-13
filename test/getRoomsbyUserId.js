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

describe('Get rooms by id', () => {
    before('before hook', async () => {
        mongoose.disconnect()
        await dbHandler.connect()
        rooms.Room1.user = users.user1._id
        rooms.Room2.user = users.user1._id
        await dbHandler.insertData('users', [users.user1])
        await dbHandler.insertData('rooms', [rooms.Room1, rooms.Room2])
    }) 
    after('Process after test', async () => {
        await dbHandler.closeDatabase()
        server.close()
    })
    describe('Should success', () => {
        it('found rooms', done => {
            chai.request(app)
            .get(`/user/rooms/${users.user1._id}`)
            .end((req,res) => {
                res.should.have.status(200)
                expect((res.body).length).to.equal(2)
                done()
            })
        })
    })
})
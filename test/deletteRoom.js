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

describe('Delete room data', () => {
    before('before hook', async () => {
        mongoose.disconnect()
        await dbHandler.connect()
        await dbHandler.insertData('users', [users.user1, users.user2])
        rooms.Room1.user = users.user1._id
        await dbHandler.insertData('rooms', [rooms.Room1])
    }) 
    after('Process after test', async () => {
        await dbHandler.closeDatabase()
        server.close()
    })
    describe('Should success', () => {
        it('delete room', done => {
            chai.request(app)
            .delete(`/room/delete/111111111111111111111111`)
            .set({ 'authorization': `Bearer token` })
            .end((req,res) => {
                res.should.have.status(200)
                expect(res.body.message).to.equal('Room deleted')
                done()
            })
        })
    })
    describe('Should failled', () => {
        it('wrong room id', done => {
            chai.request(app)
            .put(`/room/update/111111111111111111111112`)
            .set({ 'authorization': `Bearer token` })
            .end((req,res) => {
                res.should.have.status(404)
                expect(res.body.error.message).to.equal('Id not found')
                done()
            })
        })
       it('wrong token', done => {
            chai.request(app)
            .put(`/room/update/111111111111111111111111`)
            .set({ 'authorization': `Bearer wrongtoken` })
            .send({
                title: 'newTitle', 
                description: 'newDescription',
                price: 999,
                location: {
                    lat: 9,
                    lng: 9
                }
            })
            .end((req,res) => {
                res.should.have.status(401)
                expect(res.body.error.message).to.equal('Unauthorized')
                done()
            })
        }) 
    })
})
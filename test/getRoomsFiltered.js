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

describe('Get rooms filtered', () => {
    before('before hook', async () => {
        mongoose.disconnect()
        await dbHandler.connect()
        await dbHandler.insertData('users', [users.user1, users.user2])
        rooms.Room1.user = users.user1._id
        rooms.Room2.user = users.user1._id
        rooms.Room3.user = users.user2._id   
        rooms.Room4.user = users.user2._id   
        await dbHandler.insertData('rooms', [rooms.Room1, rooms.Room2, rooms.Room3, rooms.Room4])
    }) 
    after('Process after test', async () => {
        await dbHandler.closeDatabase()
        server.close()
    })
    describe('Should success', () => {
        it('return rooms filtered by title', done => {
            chai.request(app)
            .get(`/room/filtered?title=BREST`)
            .end((req,res) => {
                res.should.have.status(200)
                expect((res.body).length).to.equal(1)
                expect(res.body[0].title).to.equal('Room in BREST')
                done()
            })
        })
        it('return rooms filtered by price min', done => {
            chai.request(app)
            .get(`/room/filtered?priceMin=250`)
            .end((req,res) => {
                res.should.have.status(200)
                expect((res.body).length).to.equal(2)
                expect(res.body[0].price).to.equal(250)
                expect(res.body[1].price).to.equal(300)
                done()
            })
        })
        it('return rooms filtered by price max', done => {
            chai.request(app)
            .get(`/room/filtered?priceMax=250`)
            .end((req,res) => {
                res.should.have.status(200)
                expect((res.body).length).to.equal(3)
                expect(res.body[0].price).to.equal(250)
                expect(res.body[1].price).to.equal(150)
                expect(res.body[2].price).to.equal(50)
                done()
            })
        })
        it('return rooms filtered by price range', done => {
            chai.request(app)
            .get(`/room/filtered?priceMin=175&priceMax=275`)
            .end((req,res) => {
                res.should.have.status(200)
                expect((res.body).length).to.equal(1)
                expect(res.body[0].price).to.equal(250)
                done()
            })
        })
        it('return room sorted desc', done => {
            chai.request(app)
            .get(`/room/filtered?sort=price-desc`)
            .end((req,res) => {
                res.should.have.status(200)
                expect((res.body).length).to.equal(4)
                expect(res.body[0].price).to.equal(300)
                expect(res.body[1].price).to.equal(250)
                expect(res.body[2].price).to.equal(150)
                expect(res.body[3].price).to.equal(50)
                done()
            })
        })
        it('return rooms sorted asc', done => {
            chai.request(app)
            .get(`/room/filtered?sort=price-asc`)
            .end((req,res) => {
                res.should.have.status(200)
                expect((res.body).length).to.equal(4)
                expect(res.body[0].price).to.equal(50)
                expect(res.body[1].price).to.equal(150)
                expect(res.body[2].price).to.equal(250)
                expect(res.body[3].price).to.equal(300)
                done()
            })
        })
        it('return rooms by page', done => {
            chai.request(app)
            .get(`/room/filtered?page=2&limit=2`)
            .end((req,res) => {
                res.should.have.status(200)
                expect((res.body).length).to.equal(2)
                expect(res.body[0]._id).to.equal('333333333333333333333333')
                expect(res.body[1]._id).to.equal('444444444444444444444444')
                done()
            })
        })
    })
    describe('Should faiiled', () => {
        it('return all rooms missing query params', done => {
            chai.request(app)
            .get(`/room/filtered`)
            .end((req,res) => {
                res.should.have.status(200)
                expect((res.body).length).to.equal(4)
                done()
            })
        })
        it('return all rooms wrong query params', done => {
            chai.request(app)
            .get(`/room/filtered?params=wrong`)
            .end((req,res) => {
                res.should.have.status(200)
                expect((res.body).length).to.equal(4)
                done()
            })
        })
        it('return no room wrong title params', done => {
            chai.request(app)
            .get(`/room/filtered?title=WRONG`)
            .end((req,res) => {
                res.should.have.status(200)
                expect((res.body).length).to.equal(0)
                done()
            })
        })
        it('return error wrong price-min params', done => {
            chai.request(app)
            .get(`/room/filtered?priceMin=WRONG`)
            .end((req,res) => {
                res.should.have.status(400)
                done()
            })
        })
        it('return error wrong price-max params', done => {
            chai.request(app)
            .get(`/room/filtered?priceMax=WRONG`)
            .end((req,res) => {
                res.should.have.status(400)
                done()
            })
        })
        it('return all rooms wrong sort params', done => {
            chai.request(app)
            .get(`/room/filtered?sort=WRONG`)
            .end((req,res) => {
                res.should.have.status(400)
                expect(res.body.error.message).to.equal('Invalde sort parameter value')
                done()
            })
        })
    })
})
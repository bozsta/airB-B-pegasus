const chai = require('chai')
const expect = chai.expect
const should = chai.should();
let chaiHttp = require('chai-http')
let { app, server } = require('../index')
chai.use(chaiHttp);
const mongoose = require('mongoose')
const users = require('./fakeData/fakeUsers')

const dbHandler = require('./db/db-handler')

describe('Get user by id', () => {
    before('before hook', async () => {
        mongoose.disconnect()
        await dbHandler.connect()
        await dbHandler.insertData('users', [users.user1])
    }) 
    after('Process after test', async () => {
        await dbHandler.closeDatabase()
        server.close()
    })
    describe('Should success', () => {
        it('return user data', done => {
            chai.request(app)
            .get(`/user/${users.user1._id}`)
            .end((req, res) => {
                res.should.have.status(200)
                expect(res.body._id).to.equal(users.user1._id.toHexString())
                expect(res.body.account.username).to.equal('username')
                expect(res.body.account.name).to.equal('name')
                expect(res.body.account.description).to.equal('description')
                done()
            })
            
        })
    })
    describe('Should failled', () => {
        it('wrong user id', done => {
            chai.request(app)
            .get('/user/56cb91bdc3464f14678934cb')
            .end((req, res) => {
                res.should.have.status(404)
                expect(res.body.error.message).to.equal('User id not found')
                done()
            })
        })
        it('wrong user id format', done => {
            chai.request(app)
            .get('/user/NotobjectId')
            .end((req, res) => {
                res.should.have.status(400)
                res.should.have.throw
                done()
            })
        })
    })
})
const chai = require('chai')
const expect = chai.expect
const should = chai.should();
let chaiHttp = require('chai-http')
let { app, server } = require('../index')
chai.use(chaiHttp);
const mongoose = require('mongoose')
const users = require('./fakeData/fakeUsers')

const dbHandler = require('./db/db-handler')


describe('Recover user password', () => {
    before('before hook', async () => {
        mongoose.disconnect()
        await dbHandler.connect()
        users.user2.updatePasswordExpiredAt = Date.now()
        await dbHandler.insertData('users', [users.user1, users.user2])
    }) 
    after('Process after test', async () => {
        await dbHandler.closeDatabase()
        server.close()
    })
    describe('Should success', () => {
        it('reset user password', done => {
            chai.request(app)
            .post('/user/reset_password')
            .send({ updatePasswordToken: users.user1.updatePasswordToken, password: 'newpassword' })
            .end( async (req,res) => {
                const user = await dbHandler.findDocumentById('users', users.user1._id)
                res.should.have.status(200)
                expect(user.hash).to.not.equal(users.user1.hash)
                done()
            })
        })
    })
    describe('Should failled', () => {
        it('wrong update password token', done => {
            chai.request(app)
            .post('/user/reset_password')
            .send({ updatePasswordToken: 'wrongtoken', password: 'newpassword' })
            .end((req,res) => {
                res.should.have.status(404)
                expect(res.body.error.message).to.equal('User not found')
                done()
            })
        })
        it('token expired', done => {
            chai.request(app)
            .post('/user/reset_password')
            .send({ updatePasswordToken: users.user2.updatePasswordToken, password: 'newpassword' })
            .end((req,res) => {
                res.should.have.status(401)
                expect(res.body.error.message).to.equal('Unauthorized')
                done()
            })
        })
        it('missing updatePasswordToken', done => {
            chai.request(app)
            .post('/user/reset_password')
            .send({ password: 'newpassword' })
            .end((req,res) => {
                res.should.have.status(400)
                expect(res.body.error.message).to.equal('Missing Parameters')
                done()
            })
        })
        it('empty updatePasswordToken', done => {
            chai.request(app)
            .post('/user/reset_password')
            .send({ updatePasswordToken: '', password: 'newpassword' })
            .end((req,res) => {
                res.should.have.status(400)
                expect(res.body.error.message).to.equal('Missing Parameters')
                done()
            })
        })
        it('missing password', done => {
            chai.request(app)
            .post('/user/reset_password')
            .send({ updatePasswordToken: users.user1.updatePasswordToken })
            .end((req,res) => {
                res.should.have.status(400)
                expect(res.body.error.message).to.equal('Missing Parameters')
                done()
            })
        })
        it('empty password', done => {
            chai.request(app)
            .post('/user/reset_password')
            .send({ updatePasswordToken: users.user1.updatePasswordToken , password: ' ' })
            .end((req,res) => {
                res.should.have.status(400)
                expect(res.body.error.message).to.equal('Missing Parameters')
                done()
            })
        })
    })
})
const chai = require('chai')
const expect = chai.expect
const should = chai.should();
let chaiHttp = require('chai-http')
let { app, server } = require('../index')
chai.use(chaiHttp);
const mongoose = require('mongoose')
const users = require('./fakeData/fakeUsers')

const dbHandler = require('./db/db-handler')


describe('Update user data', () => {
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
        it('update password', done => {
            chai.request(app)
            .put('/user/update_password')
            .set({ 'authorization': `Bearer token` })
            .send({ oldPass:  'password',newPass: 'newpassword' })
            .end( async (req,res) => {
                res.should.have.status(200)
                expect(res.body._id).to.equal(users.user1._id.toString())
                const user = await dbHandler.findDocumentById('users', users.user1._id)
                expect(user.hash).to.not.equal(users.user1.hash)
                done()
            })
        })
    })
    describe('Should failled', () => {
        it('wrong token', done => {
            chai.request(app)
            .put('/user/update_password')
            .set({ 'authorization': `Bearer wrongtoken` })
            .send({ oldPass:  'password',newPass: 'newpassword' })
            .end((req,res) => {
                res.should.have.status(401)
                expect(res.body.error.message).to.equal('Unauthorized')
                done()
            })
        })
        it('wrong old password', done => {
            chai.request(app)
            .put('/user/update_password')
            .set({ 'authorization': `Bearer token` })
            .send({ oldPass: 'wrongpassword',newPass: 'newpassword' })
            .end((req,res) => {
                res.should.have.status(401)
                expect(res.body.error.message).to.equal('Unauthorized')
                done()
            })
        })
        it('empty old password', done => {
            chai.request(app)
            .put('/user/update_password')
            .set({ 'authorization': `Bearer token` })
            .send({ oldPass: '  ',newPass: 'newpassword' })
            .end((req,res) => {
                res.should.have.status(400)
                expect(res.body.error.message).to.equal('Missing data parameters')
                done()
            })
        })
        it('missing old password', done => {
            chai.request(app)
            .put('/user/update_password')
            .set({ 'authorization': `Bearer token` })
            .send({ newPass: 'newpassword' })
            .end((req,res) => {
                res.should.have.status(400)
                expect(res.body.error.message).to.equal('Missing data parameters')
                done()
            })
        })
        it('empty new password', done => {
            chai.request(app)
            .put('/user/update_password')
            .set({ 'authorization': `Bearer token` })
            .send({ oldPass: 'wrongpassword', newPass: '  ' })
            .end((req,res) => {
                res.should.have.status(400)
                expect(res.body.error.message).to.equal('Missing data parameters')
                done()
            })
        })
        it('missing new password', done => {
            chai.request(app)
            .put('/user/update_password')
            .set({ 'authorization': `Bearer token` })
            .send({ oldPass: 'wrongpassword',})
            .end((req,res) => {
                res.should.have.status(400)
                expect(res.body.error.message).to.equal('Missing data parameters')
                done()
            })
        })
    })
})
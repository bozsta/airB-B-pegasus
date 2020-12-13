const chai = require('chai')
const expect = chai.expect
const should = chai.should();
let chaiHttp = require('chai-http')
let { app, server } = require('../index')
chai.use(chaiHttp);
const mongoose = require('mongoose')
const generateHash = require('../utils/hashHelper')

const dbHandler = require('./db/db-handler')


describe('Update user data', () => {
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
        await dbHandler.insertData('users', [user1])
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
            .end((req,res) => {
                res.should.have.status(200)
                expect(res.body._id).to.equal('56cb91bdc3464f14678934ca')
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
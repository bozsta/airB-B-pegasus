const chai = require('chai')
const expect = chai.expect
const should = chai.should();
let chaiHttp = require('chai-http')
let { app, server } = require('../index')
chai.use(chaiHttp);
const mongoose = require('mongoose')
const users = require('./fakeData/fakeUsers')
const rooms = require('./fakeData/FakeRooms')
const sinon = require('sinon')
const cloudinaryHleper = require('../utils/cloudinaryHelper')
const fs = require('fs')

const dbHandler = require('./db/db-handler')

describe("Upload user's avatar", () => {
    before('before hook', async () => {
        mongoose.disconnect()
        await dbHandler.connect()
        await dbHandler.insertData('users', [users.user1, users.user2])
        rooms.Room1.user = users.user1._id
        await dbHandler.insertData('rooms', [rooms.Room1])
        // const fakeCloudinaryUpload = sinon.fake.returns({secure_url:'secure_url', public_id: 'public_id'});
        // sinon.replace(cloudinaryHleper, 'uploadImage', fakeCloudinaryUpload);
    }) 
    after('Process after test', async () => {
        await dbHandler.closeDatabase()
        server.close()
    })
    describe('Should success', () => {
        it('upload image', done => {
            chai.request(app)
            .put(`/user/upload_picture/56cb91bdc3464f14678934ca`)
            .set({ 'authorization': `Bearer token` })
            .attach('picture', fs.readFileSync('test/images/test.png'),'test.png')
            .end((req,res) => {
                res.should.have.status(200)
                expect(res.body.account.photo.url).to.equal('secure_url')
                expect(res.body.account.photo.public_id).to.equal('public_id')
                done()
            })
        })
    })
    describe('Should failled', () => {
        it('wrong token', done => {
            chai.request(app)
            .put(`/user/upload_picture/111111111111111111111111`)
            .set({ 'authorization': `Bearer wrongtoken` })
            .attach('picture', fs.readFileSync('test/images/test.png'),'test.png')
            .end((req,res) => {
                res.should.have.status(401)
                expect(res.body.error.message).to.equal('Unauthorized')
                done()
            })
        })
        it('wrong user id', done => {
            chai.request(app)
            .put(`/user/upload_picture/111111111111111111111112`)
            .set({ 'authorization': `Bearer token` })
            .attach('picture', fs.readFileSync('test/images/test.png'),'test.png')
            .end((req,res) => {
                res.should.have.status(404)
                expect(res.body.error.message).to.equal('User id not found')
                done()
            })
        })
        it('missing picture', done => {
            chai.request(app)
            .put(`/user/upload_picture/111111111111111111111111`)
            .set({ 'authorization': `Bearer token` })
            .end((req,res) => {
                res.should.have.status(400)
                expect(res.body.error.message).to.equal('Missing file parameters')
                done()
            })
        })
    })
})
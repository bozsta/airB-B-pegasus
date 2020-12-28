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

const dbHandler = require('./db/db-handler')

describe("Delete user's avatar", () => {
    before('before hook', async () => {
        mongoose.disconnect()
        await dbHandler.connect()
        await dbHandler.insertData('users', [users.user1, users.user2])
        rooms.Room1.user = users.user1._id
        await dbHandler.insertData('rooms', [rooms.Room1])
        const fakeCloudinaryAvatarDelete = sinon.fake.returns('avatar deleted');
        sinon.replace(cloudinaryHleper, 'deleteResourcesAndFolder', fakeCloudinaryAvatarDelete);
    }) 
    after('Process after test', async () => {
        await dbHandler.closeDatabase()
        server.close()
    })
    describe('Should success', () => {
        it('delete avatar', done => {
            chai.request(app)
            .delete(`/user/delete_picture/56cb91bdc3464f14678934ca`)
            .set({ 'authorization': `Bearer token` })
            .send({
                picture_id: 'public_id1'
            })
            .end((req,res) => {
                res.should.have.status(200)
                expect(res.body.account.photo).to.not.have.property('picture_id');
                done()
            })
        })
    })
    describe('Should failled', () => {
        it('wrong token', done => {
            chai.request(app)
            .delete(`/user/delete_picture/56cb91bdc3464f14678934ca`)
            .set({ 'authorization': `Bearer wrongtoken` })
            .send({
                picture_id: 'public_id1'
            })
            .end( (req,res) => {
                res.should.have.status(401)
                expect(res.body.error.message).to.equal('Unauthorized')
                done()
            })
        })
        it('wrong id', done => {
            chai.request(app)
            .delete(`/user/delete_picture/111111111111111111111112`)
            .set({ 'authorization': `Bearer token` })
            .send({
                picture_id: 'public_id1'
            })
            .end( (req,res) => {
                res.should.have.status(404)
                expect(res.body.error.message).to.equal('User not found')
                done()
            })
        })
        it('wrong image id', done => {
            chai.request(app)
            .delete(`/user/delete_picture/56cb91bdc3464f14678934ca`)
            .set({ 'authorization': `Bearer token` })
            .send({
                picture_id: 'wrong_public_id'
            })
            .end( (req,res) => {
                res.should.have.status(404)
                expect(res.body.error.message).to.equal('No item to delete')
                done()
            })
        })
    })
})
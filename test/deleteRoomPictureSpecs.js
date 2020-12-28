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
// const fs = require('fs')

const dbHandler = require('./db/db-handler')

describe("Delete room's picture", () => {
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
        it('delefe image', done => {
            chai.request(app)
            .delete(`/room/delete_picture/111111111111111111111111`)
            .set({ 'authorization': `Bearer token` })
            .send({
                picture_id: 'public_id1'
            })
            .end( async (req,res) => {
                res.should.have.status(200)
                expect(res.body.message).to.equal('Picture deleted')
                const result = await dbHandler.findDocumentByFilter('rooms', {_id: rooms.Room1._id})
                expect(result.photos.length).to.equal(3)
                done()
            })
        })
    })
    describe('Should failled', () => {
        it('wrong token', done => {
            chai.request(app)
            .delete(`/room/delete_picture/111111111111111111111111`)
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
            .delete(`/room/delete_picture/111111111111111111111112`)
            .set({ 'authorization': `Bearer token` })
            .send({
                picture_id: 'public_id1'
            })
            .end( (req,res) => {
                res.should.have.status(404)
                expect(res.body.error.message).to.equal('Room not found')
                done()
            })
        })
        it('wrong image id', done => {
            chai.request(app)
            .delete(`/room/delete_picture/111111111111111111111111`)
            .set({ 'authorization': `Bearer token` })
            .send({
                picture_id: 'wrong_public_id'
            })
            .end( (req,res) => {
                res.should.have.status(404)
                expect(res.body.error.message).to.equal('Image not found')
                done()
            })
        })
    })
})
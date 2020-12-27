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

describe('Publish rooms', () => {
    before('before hook', async () => {
        mongoose.disconnect()
        await dbHandler.connect()
        await dbHandler.insertData('users', [users.user1, users.user2])
    }) 
    after('Process after test', async () => {
        await dbHandler.closeDatabase()
        server.close()
    })
    describe('Should success', () => {
        it('craete new rooms', done => {
            chai.request(app)
            .post(`/room/publish`)
            .set({ 'authorization': `Bearer token` })
            .send({ 
                title: 'title', 
                description: 'description', 
                price: '300', 
                location: { 
                    lat : '30', 
                    lng: '4' } 
            })
            .end((req,res) => {
                res.should.have.status(200)
                expect(res.body.title).to.equal('title')
                expect(res.body.price).to.equal(300)
                expect((res.body.location).length).to.equal(2)
                expect(res.body.location[0]).to.equal(30)
                expect(res.body.location[1]).to.equal(4)
                done()
            })
        })
    })
    describe('Should failled', () => {
        it('wrong token' , done => {
            chai.request(app)
            .post(`/room/publish`)
            .set({ 'authorization': `Bearer wrongtoken` })
            .send({ 
                title: 'title', 
                description: 'description', 
                price: '300', 
                location: { 
                    lat : '30', 
                    lng: '4' } 
            })
            .end((req,res) => {
                res.should.have.status(401)
                expect(res.body.error.message).to.equal('Unauthorized')
                done()
            })
        })
        it('empty title' , done => {
            chai.request(app)
            .post(`/room/publish`)
            .set({ 'authorization': `Bearer token` })
            .send({ 
                title: ' ', 
                description: 'description', 
                price: '300', 
                location: { 
                    lat : '30', 
                    lng: '4' } 
            })
            .end((req,res) => {
                res.should.have.status(400)
                expect(res.body.error.message).to.equal('Missing parameters')
                done()
            })
        })
        it('missing title' , done => {
            chai.request(app)
            .post(`/room/publish`)
            .set({ 'authorization': `Bearer token` })
            .send({ 
                description: 'description', 
                price: '300', 
                location: { 
                    lat : '30', 
                    lng: '4' } 
            })
            .end((req,res) => {
                res.should.have.status(400)
                expect(res.body.error.message).to.equal('Missing parameters')
                done()
            })
        })
        it('empty description' , done => {
            chai.request(app)
            .post(`/room/publish`)
            .set({ 'authorization': `Bearer token` })
            .send({ 
                title: 'title', 
                description: '   ', 
                price: '300', 
                location: { 
                    lat : '30', 
                    lng: '4' } 
            })
            .end((req,res) => {
                res.should.have.status(400)
                expect(res.body.error.message).to.equal('Missing parameters')
                done()
            })
        })
        it('missing description' , done => {
            chai.request(app)
            .post(`/room/publish`)
            .set({ 'authorization': `Bearer token` })
            .send({ 
                title: 'title', 
                price: '300', 
                location: { 
                    lat : '30', 
                    lng: '4' } 
            })
            .end((req,res) => {
                res.should.have.status(400)
                expect(res.body.error.message).to.equal('Missing parameters')
                done()
            })
        })
        it('empty price' , done => {
            chai.request(app)
            .post(`/room/publish`)
            .set({ 'authorization': `Bearer token` })
            .send({ 
                title: 'title', 
                description: 'description', 
                price: ' ', 
                location: { 
                    lat : '30', 
                    lng: '4' } 
            })
            .end((req,res) => {
                res.should.have.status(400)
                expect(res.body.error.message).to.equal('Missing parameters')
                done()
            })
        })
        it('missing price' , done => {
            chai.request(app)
            .post(`/room/publish`)
            .set({ 'authorization': `Bearer token` })
            .send({ 
                title: 'title', 
                description: 'description', 
                location: { 
                    lat : '30', 
                    lng: '4' } 
            })
            .end((req,res) => {
                res.should.have.status(400)
                expect(res.body.error.message).to.equal('Missing parameters')
                done()
            })
        })
        it('price not a number' , done => {
            chai.request(app)
            .post(`/room/publish`)
            .set({ 'authorization': `Bearer token` })
            .send({ 
                title: 'title', 
                description: 'description', 
                price: 'ABC',
                location: { 
                    lat : '30', 
                    lng: '4' } 
            })
            .end((req,res) => {
                res.should.have.status(400)
                expect(res.body.error.message).to.equal('Missing parameters')
                done()
            })
        })
        it('empty lattitude' , done => {
            chai.request(app)
            .post(`/room/publish`)
            .set({ 'authorization': `Bearer token` })
            .send({ 
                title: 'title', 
                description: 'description', 
                price: '300', 
                location: { 
                    lat : ' ', 
                    lng: '4' } 
            })
            .end((req,res) => {
                res.should.have.status(400)
                expect(res.body.error.message).to.equal('Missing parameters')
                done()
            })
        })
        it('empty longitude' , done => {
            chai.request(app)
            .post(`/room/publish`)
            .set({ 'authorization': `Bearer token` })
            .send({ 
                title: 'title', 
                description: 'description', 
                price: '300', 
                location: { 
                    lat : '30', 
                    lng: ' ' } 
            })
            .end((req,res) => {
                res.should.have.status(400)
                expect(res.body.error.message).to.equal('Missing parameters')
                done()
            })
        })
        it('missing lattitude' , done => {
            chai.request(app)
            .post(`/room/publish`)
            .set({ 'authorization': `Bearer token` })
            .send({ 
                title: 'title', 
                description: 'description', 
                price: '300', 
                location: { 
                    lng: '4' } 
            })
            .end((req,res) => {
                res.should.have.status(400)
                expect(res.body.error.message).to.equal('Missing parameters')
                done()
            })
        })
        it('missing longitude' , done => {
            chai.request(app)
            .post(`/room/publish`)
            .set({ 'authorization': `Bearer token` })
            .send({ 
                title: 'title', 
                description: 'description', 
                price: '300', 
                location: { 
                    lat : '30' } 
            })
            .end((req,res) => {
                res.should.have.status(400)
                expect(res.body.error.message).to.equal('Missing parameters')
                done()
            })
        })
        it('lattitude not a number' , done => {
            chai.request(app)
            .post(`/room/publish`)
            .set({ 'authorization': `Bearer token` })
            .send({ 
                title: 'title', 
                description: 'description', 
                price: '300', 
                location: { 
                    lat : '3e', 
                    lng: '4' } 
            })
            .end((req,res) => {
                res.should.have.status(400)
                expect(res.body.error.message).to.equal('Missing parameters')
                done()
            })
        })
        it('longitude not a number' , done => {
            chai.request(app)
            .post(`/room/publish`)
            .set({ 'authorization': `Bearer token` })
            .send({ 
                title: 'title', 
                description: 'description', 
                price: '300', 
                location: { 
                    lat : '30', 
                    lng: '3a' } 
            })
            .end((req,res) => {
                res.should.have.status(400)
                expect(res.body.error.message).to.equal('Missing parameters')
                done()
            })
        })
        it('missing location' , done => {
            chai.request(app)
            .post(`/room/publish`)
            .set({ 'authorization': `Bearer token` })
            .send({ 
                title: 'title', 
                description: 'description', 
                price: '300', 
            })
            .end((req,res) => {
                res.should.have.status(400)
                expect(res.body.error.message).to.equal('Missing parameters')
                done()
            })
        })
    })
})
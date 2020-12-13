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
        it('update user', done => {
            chai.request(app)
            .put('/user/update')
            .set({ 'authorization': `Bearer token` })
            .send({
                username: 'username2',
                name: 'name2',
                description: 'description2',
                email: 'email2@email.fr'
            })
            .end((req,res) => {
                res.should.have.status(200)
                expect(res.body.account.username).to.equal('username2')
                expect(res.body.account.name).to.equal('name2')
                expect(res.body.account.description).to.equal('description2')
                done()
            })  
        })
    })
    describe('Should failled', () => {
        it('wrong bearer token', done => {
             chai.request(app)
             .put('/user/update')
             .set({ 'authorization': `Bearer wrongtoken` })
             .send({
                username: 'username3',
                name: 'name3',
                description: 'description3',
                email: 'email3@email.fr'
             })
             .end((req, res) => {
                 res.should.have.status(401)
                 expect(res.body.error.message).to.equal('Unauthorized')
                 done()
             })
        })
        it('email already exist', done => {
            chai.request(app)
             .put('/user/update')
             .set({ 'authorization': `Bearer token` })
             .send({
                username: 'username4',
                name: 'name4',
                description: 'description4',
                email: 'email2@email.fr'
             })
             .end((req, res) => {
                 res.should.have.status(409)
                 expect(res.body.error.message).to.equal('Email already already exist')
                 done()
             })
        })
        it('empty username', done => {
            chai.request(app)
             .put('/user/update')
             .set({ 'authorization': `Bearer token` })
             .send({
                username: '',
                name: 'name4',
                description: 'description4',
                email: 'email4@email.fr'
             })
             .end((req, res) => {
                 res.should.have.status(400)
                 expect(res.body.error.message).to.equal('Username is an empty string')
                 done()
             })
        })
        it('empty name', done => {
            chai.request(app)
             .put('/user/update')
             .set({ 'authorization': `Bearer token` })
             .send({
                username: 'username',
                name: '',
                description: 'description4',
                email: 'email4@email.fr'
             })
             .end((req, res) => {
                 res.should.have.status(400)
                 expect(res.body.error.message).to.equal('Name is an empty string')
                 done()
             })
        })
        it('empty description', done => {
            chai.request(app)
             .put('/user/update')
             .set({ 'authorization': `Bearer token` })
             .send({
                username: 'username',
                name: 'name',
                description: '  ',
                email: 'email4@email.fr'
             })
             .end((req, res) => {
                 res.should.have.status(400)
                 expect(res.body.error.message).to.equal('Description is an empty string')
                 done()
             })
        })
        it('empty email', done => {
            chai.request(app)
             .put('/user/update')
             .set({ 'authorization': `Bearer token` })
             .send({
                username: 'username',
                name: 'name',
                description: 'description',
                email: '  '
             })
             .end((req, res) => {
                 res.should.have.status(400)
                 expect(res.body.error.message).to.equal('Email is an empty string')
                 done()
             })
        })
    })
})
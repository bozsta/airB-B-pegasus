const chai = require('chai')
const expect = chai.expect
const should = chai.should();
let chaiHttp = require('chai-http')
let { app, server } = require('../index')
chai.use(chaiHttp);
const mongoose = require('mongoose')
const { User } = require('../models/Models')

const dbHandler = require('./db-handler')

describe('User Sign Up' , () => {
    before('before hook', async () => {
        mongoose.disconnect()
        await dbHandler.connect()
    }) 
    after('Process after test', async () => {
        await dbHandler.closeDatabase()
        server.close()
    })
    describe('Should success' , () => {
        it('shoud register user', done => {
            chai.request(app)
            .post('/user/sign_up')
            .send({
                password: 'password',
                email: "email@email.fr",
                username: "username",
                name: "name",
                description: "description",
            })
            .end((err, res) => {
                res.should.have.status(200)
                expect(res.body.email).to.equal('email@email.fr')
                expect(res.body.username).to.equal('username')
                expect(res.body.description).to.equal('description')
                expect(res.body.name).to.equal('name')
                done()
            })
        })
        it('shoud register second user same name, password & description', done => {
            chai.request(app)
            .post('/user/sign_up')
            .send({
                password: 'password',
                email: "email2@email.com",
                username: "username2",
                name: "name",
                description: "description",
            })
            .end((err, res) => {
                res.should.have.status(200)
                expect(res.body.email).to.equal('email2@email.com')
                expect(res.body.username).to.equal('username2')
                expect(res.body.description).to.equal('description')
                expect(res.body.name).to.equal('name')
                done()
            })
        })
    })
    describe('Should failled' , () => {
        it('shoud failled email already exist', done => {
            chai.request(app)
            .post('/user/sign_up')
            .send({
                password: 'password2',
                email: "email@email.fr",
                username: "username3",
                name: "name2",
                description: "description2",
            })
            .end((err, res) => {
                res.should.have.status(409)
                expect(res.body.error.message).to.equal('Email already exist')
                done()
            })
        })
        it('shoud failled username already exist', done => {
            chai.request(app)
            .post('/user/sign_up')
            .send({
                password: 'password2',
                email: "email2@email.fr",
                username: "username",
                name: "name2",
                description: "description2",
            })
            .end((err, res) => {
                res.should.have.status(409)
                expect(res.body.error.message).to.equal('Username already exist')
                done()
            })
        })
        it('shoud failled email & username already exist', done => {
            chai.request(app)
            .post('/user/sign_up')
            .send({
                password: 'password2',
                email: "email@email.fr",
                username: "username",
                name: "name2",
                description: "description2",
            })
            .end((err, res) => {
                res.should.have.status(409)
                expect(res.body.error.message).to.equal('Email and Username already exist')
                done()
            })
        })
        it('shoud failled missing email', done => {
            chai.request(app)
            .post('/user/sign_up')
            .send({
                password: 'password2',
                username: "username",
                name: "name2",
                description: "description2",
            })
            .end((err, res) => {
                res.should.have.status(400)
                expect(res.body.error.message).to.equal('Missing parameters')
                done()
            })
        })
        it('shoud failled empty email', done => {
            chai.request(app)
            .post('/user/sign_up')
            .send({
                password: 'password2',
                email: "    ",
                username: "username",
                name: "name2",
                description: "description2",
            })
            .end((err, res) => {
                res.should.have.status(400)
                expect(res.body.error.message).to.equal('Missing parameters')
                done()
            })
        })
        it('shoud failled missing password', done => {
            chai.request(app)
            .post('/user/sign_up')
            .send({
                email: "email@test.fr",
                username: "username",
                name: "name2",
                description: "description2",
            })
            .end((err, res) => {
                res.should.have.status(400)
                expect(res.body.error.message).to.equal('Missing parameters')
                done()
            })
        })
        it('shoud failled empty password', done => {
            chai.request(app)
            .post('/user/sign_up')
            .send({
                password: '  ',
                email: "email@test.fr",
                username: "username",
                name: "name2",
                description: "description2",
            })
            .end((err, res) => {
                res.should.have.status(400)
                expect(res.body.error.message).to.equal('Missing parameters')
                done()
            })
        })
        it('shoud failled missing username', done => {
            chai.request(app)
            .post('/user/sign_up')
            .send({
                password: 'password',
                email: "email@test.fr",
                name: "name2",
                description: "description2",
            })
            .end((err, res) => {
                res.should.have.status(400)
                expect(res.body.error.message).to.equal('Missing parameters')
                done()
            })
        })
        it('shoud failled empty username', done => {
            chai.request(app)
            .post('/user/sign_up')
            .send({
                password: 'password',
                email: "email@test.fr",
                username: "   ",
                name: "name2",
                description: "description2",
            })
            .end((err, res) => {
                res.should.have.status(400)
                expect(res.body.error.message).to.equal('Missing parameters')
                done()
            })
        })
        it('shoud failled missing name', done => {
            chai.request(app)
            .post('/user/sign_up')
            .send({
                password: 'password',
                email: "email@test.fr",
                username: "username",
                description: "description2",
            })
            .end((err, res) => {
                res.should.have.status(400)
                expect(res.body.error.message).to.equal('Missing parameters')
                done()
            })
        })
        it('shoud failled empty name', done => {
            chai.request(app)
            .post('/user/sign_up')
            .send({
                password: 'password',
                email: "email@test.fr",
                name: "name2",
                username: "username",
                name: "   ",
                description: "description2",
            })
            .end((err, res) => {
                res.should.have.status(400)
                expect(res.body.error.message).to.equal('Missing parameters')
                done()
            })
        })
        it('shoud failled missing name', done => {
            chai.request(app)
            .post('/user/sign_up')
            .send({
                password: 'password',
                email: "email@test.fr",
                username: "username",
                name: "name",
            })
            .end((err, res) => {
                res.should.have.status(400)
                expect(res.body.error.message).to.equal('Missing parameters')
                done()
            })
        })
        it('shoud failled empty name', done => {
            chai.request(app)
            .post('/user/sign_up')
            .send({
                password: 'password',
                email: "email@test.fr",
                name: "name2",
                username: "username",
                name: "name",
                description: "",
            })
            .end((err, res) => {
                res.should.have.status(400)
                expect(res.body.error.message).to.equal('Missing parameters')
                done()
            })
        })
    })
})

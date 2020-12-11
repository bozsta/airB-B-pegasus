const chai = require('chai')
const expect = chai.expect
const should = chai.should();
let chaiHttp = require('chai-http')
let { app, server } = require('../index')
chai.use(chaiHttp);
const mongoose = require('mongoose')
const crypto = require('crypto-js')
const encBase64 = require("crypto-js/enc-base64");
const generateHash = require('../utils/hashHelper')
const { User } = require('../models/Models')

const dbHandler = require('./db-handler')

describe('User log in' , () => {
    before('before hook', async () => {
        mongoose.disconnect()
        await dbHandler.connect()
        const newUser = new User({
            token: 'token',
            email: 'email@email.fr',
            account: {
                username: 'username',
                name: 'name',
                description: 'description',
            },
            hash: generateHash('password', 'salt'),
            salt: 'salt'
        })
        await newUser.save()
    }) 
    after('Process after test', async () => {
        await dbHandler.closeDatabase()
        server.close()
    })
    describe('Should success' , () => {
        it('log user', done => {   
            chai.request(app)
            .post('/user/log_in')
            .send({
                password: 'password',
                email: "email@email.fr",
            })
            .end((err, res) => {
                res.should.have.status(200)
                expect(res.body.token).to.equal('token')
                expect(res.body.email).to.equal('email@email.fr')
                done()
            })  
        })
    })
    
    describe('Should failled' , () => {
        it('wrong password', done => {   
            chai.request(app)
            .post('/user/log_in')
            .send({
                password: 'wrongpassword',
                email: "email@email.fr",
            })
            .end((err, res) => {
                res.should.have.status(401)
                expect(res.body.error.message).to.equal('Unauthorized')
                done()
            })  
        })
        it('empty password', done => {   
            chai.request(app)
            .post('/user/log_in')
            .send({
                password: ' ',
                email: "email@email.fr",
            })
            .end((err, res) => {
                res.should.have.status(400)
                expect(res.body.error.message).to.equal('Missing parameters')
                done()
            })  
        })
        it('missing password', done => {   
            chai.request(app)
            .post('/user/log_in')
            .send({
                email: "email@email.fr",
            })
            .end((err, res) => {
                res.should.have.status(400)
                expect(res.body.error.message).to.equal('Missing parameters')
                done()
            })  
        })
        it('wrong email', done => {   
            chai.request(app)
            .post('/user/log_in')
            .send({
                password: 'password',
                email: "wrongemail@email.fr",
            })
            .end((err, res) => {
                res.should.have.status(401)
                expect(res.body.error.message).to.equal('Unauthorized')
                done()
            })  
        })
        it('empty email', done => {   
            chai.request(app)
            .post('/user/log_in')
            .send({
                password: 'password',
                email: ' ',
            })
            .end((err, res) => {
                res.should.have.status(400)
                expect(res.body.error.message).to.equal('Missing parameters')
                done()
            })  
        })
        it('missing email', done => {   
            chai.request(app)
            .post('/user/log_in')
            .send({
                password: 'password',
            })
            .end((err, res) => {
                res.should.have.status(400)
                expect(res.body.error.message).to.equal('Missing parameters')
                done()
            })  
        })
    })
    
})

const chai = require('chai')
const expect = chai.expect
const should = chai.should();
let chaiHttp = require('chai-http')
let { app, server } = require('../index')
chai.use(chaiHttp);
const mongoose = require('mongoose')

const dbHandler = require('./db/db-handler')

describe('User Sign Up' , () => {
    before('before hook', async () => {
        mongoose.disconnect()
        // await dbHandler.connect()
    }) 
    after('Process after test', async () => {
        //await dbHandler.closeDatabase()
        server.close()
    })
    describe('Should success' , () => {
        it('post redirected to ALL route', done => {
            chai.request(app)
            .post('/wrongroute/')
            .send({
                password: 'password',
                email: "email@email.fr",
                username: "username",
                name: "name",
                description: "description",
            })
            .end((err, res) => {
                console.log('res.body', res.body)
                res.should.have.status(404)
                expect(res.body.error.message).to.equal('URL not found')
                done()
            })
        })
        it('post redirected to ALL route', done => {
            chai.request(app)
            .get('/wrongroute/')
            .send({
                password: 'password',
                email: "email@email.fr",
                username: "username",
                name: "name",
                description: "description",
            })
            .end((err, res) => {
                console.log('res.body', res.body)
                res.should.have.status(404)
                expect(res.body.error.message).to.equal('URL not found')
                done()
            })
        })
        it('post redirected to ALL route', done => {
            chai.request(app)
            .put('/wrongroute/')
            .send({
                password: 'password',
                email: "email@email.fr",
                username: "username",
                name: "name",
                description: "description",
            })
            .end((err, res) => {
                console.log('res.body', res.body)
                res.should.have.status(404)
                expect(res.body.error.message).to.equal('URL not found')
                done()
            })
        })
        it('post redirected to ALL route', done => {
            chai.request(app)
            .delete('/wrongroute/')
            .send({
                password: 'password',
                email: "email@email.fr",
                username: "username",
                name: "name",
                description: "description",
            })
            .end((err, res) => {
                console.log('res.body', res.body)
                res.should.have.status(404)
                expect(res.body.error.message).to.equal('URL not found')
                done()
            })
        })
    })
})

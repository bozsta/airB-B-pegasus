const chai = require('chai')
const expect = chai.expect
const should = chai.should();
let chaiHttp = require('chai-http')
let { app, server } = require('../index')
chai.use(chaiHttp);
const mongoose = require('mongoose')
const users = require('./fakeData/fakeUsers')
const sinon = require('sinon')

const dbHandler = require('./db/db-handler')

const emailHelper = require('../utils/emailHelper')


describe('Recover user password', () => {
    before('before hook', async () => {
        mongoose.disconnect()
        await dbHandler.connect()
        await dbHandler.insertData('users', [users.user1])
        var fake = sinon.fake.returns('email send');
        sinon.replace(emailHelper, 'send', fake);
    }) 
    after('Process after test', async () => {
        await dbHandler.closeDatabase()
        server.close()
    })
    describe('Should success', () => {
        it('update password', done => {
            chai.request(app)
            .post('/user/recover_password')
            .send({
                email: `${users.user1.email}`
            })
            .end((req, res) => {
                res.should.have.status(200)
                expect(res.body.message).to.equal('A link has been sent to the user')
                done()
            })
        })
    })
    // todo
    describe('Should failled', () => {
        it('TODO', done => {
            done()
        })
    })
})
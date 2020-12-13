/* const chai = require('chai')
const expect = chai.expect
const should = chai.should();
let chaiHttp = require('chai-http')
let { app, server } = require('../index')
chai.use(chaiHttp);
const mongoose = require('mongoose')
const users = require('./fakeData/fakeUsers')

const dbHandler = require('./db/db-handler')


describe('Recover user password', () => {
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
        it('update password', done => {
            chai.request(app)
            .post('/user/recover_password')
            .send({
                email: `${users.user1.email}`
            })
            .end((req, res) => {
                console.log('res.body', res.body)
                done()
            })
        })
    })
}) */
const chai = require('chai')
const expect = chai.expect
const should = chai.should();
let chaiHttp = require('chai-http')
let { app, server } = require('../index')
chai.use(chaiHttp);

const mongoose = require('mongoose');

const dbHandler = require('./db-handler')

describe('Try test' , () => {
    before('before hook',async () => {
        mongoose.disconnect()
        await dbHandler.connect()
    });
    after('Process after test',async () => {
        await dbHandler.closeDatabase()
        server.close()
    })
    it('shoud add user', done => {
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
})

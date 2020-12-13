const chai = require('chai')
const expect = chai.expect
const should = chai.should();
let chaiHttp = require('chai-http')
let { app, server } = require('../index')
chai.use(chaiHttp);
const mongoose = require('mongoose')
const options = { hostname: 'api.mailgun.net',
  port: 443,
  protocol: 'https:',
  path: '/v3/sandbox12345.mailgun.org/messages',
  method: 'POST',
  headers:
   { 'Content-Type': 'application/x-www-form-urlencoded',
     'Content-Length': 127 },
  auth: 'api:key-0e8pwgtt5ylx0m94xwuzqys2-o0x4-77',
  agent: false,
  timeout: undefined }
// const mailgun = require('mailgun-js')({ apiKey: process.env.MAILGUN_API_KEY, domain: process.env.MAILGUN_DOMAIN, testMode: true })
// const nock = require('nock')
const users = require('./fakeData/fakeUsers')

const dbHandler = require('./db/db-handler')
const sinon = require('sinon')
const sandbox = sinon.createSandbox()




describe('Recover user password', () => {
    before('before hook', async () => {
        mongoose.disconnect()
        await dbHandler.connect()
        await dbHandler.insertData('users', [users.user1])
       // const mailgunSendSpy = sandbox.stub().yields(null, { status: 200 })
       // sandbox.stub(mailgun({ apiKey: 'foo', domain: 'bar', testMode: true }).Mailgun.prototype, 'messages') 
       /*  .returns({ 
            /* send: (data, cb) => {
                console.log('data', data)
                cb()
            }  *
            send: mailgunSendSpy
        }) */
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
})
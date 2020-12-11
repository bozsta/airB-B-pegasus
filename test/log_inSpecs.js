const chai = require('chai')
const expect = require('chai').expect
const mongoUnit = require('mongo-unit')
let { app, server } = require('../index')

describe('User log in' , () => {
    it('shoud log user', done => {
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

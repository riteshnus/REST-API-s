process.env.NODE_ENV = 'test';
require('dotenv').config()

const chai = require('chai'),
    chaiHttp = require('chai-http'),
    testJson = require('./testInput.json'),
    should = chai.should(),
    server = require('../app');

chai.use(chaiHttp);

describe("All Api Test", () => {
    describe("POST /registerteacher", () => {
        it("it should register new teacher", (done) => {
            chai.request(server)
                .post('/api/registerteacher')
                .send(testJson.registerTeacher)
                .end((err, res) => {
                    res.should.have.status(204);
                    done();
                })
        })
    })

    describe("POST /register", () => {
        it("it should register student under teacher", (done) => {
            chai.request(server)
                .post('/api/register')
                .send(testJson.registerStudent)
                .end((err, res) => {
                    res.should.have.status(204);
                    done();
                })
        })
    })

    describe("POST /commonstudents?teacher=teacherken3@gmail.com", () => {
        it("it should return common students", (done) => {
            chai.request(server)
                .get('/api/commonstudents?teacher=teacherken3@gmail.com')
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.students.should.be.a('array');
                    done();
                })
        })
    })

    describe("POST /suspend", () => {
        it("it should suspend a student", (done) => {
            chai.request(server)
                .post('/api/suspend')
                .send(testJson.suspendStudent)
                .end((err, res) => {
                    res.should.have.status(204);
                    done();
                })
        })
    })

    describe("POST /notification", () => {
        it("it should give a list of active student for teacher", (done) => {
            chai.request(server)
                .post('/api/retrievefornotifications')
                .send(testJson.notification)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.recipients.should.be.a('array');
                    done();
                })
        })
    })

});


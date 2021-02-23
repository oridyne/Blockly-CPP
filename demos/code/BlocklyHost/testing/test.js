process.env.NODE_ENV = 'test';
const
    chai = require('chai'),
    chaiHttp = require('chai-http'),
    server = require('../server')(),
    fs = require('fs'),
    path = require('path'),
    config = require('../config'),
    assert = require('assert'),
    cppCompilePath = "./server/service/cppCompile";
server.create(config);
server.start();
var address = 'http://localhost:3000';
var expect = chai.expect;
let should = chai.should();
chai.use(chaiHttp);

function clearDir(dir,uid) {
    fs.readdir(dir, (err, files) => {
      if (err) throw err;
      for (const file of files) {
        if (file.includes(uid)) {
          fs.unlink(path.join(dir, file), err => {
            if (err) throw err;
          });
        }
      }
    });
} 

describe('/GET id', () => {
    it('it should GET id', (done) => {
        chai.request(address)
            .get('/cppCompile/id')
            .end((err,res) => {
                expect(err).to.be.null;
                expect(res).to.have.status(200);
                console.log(res.body);
                done();
        });
    });
});

describe('/POST SendFile', () => {
    it('it should save file', (done) => {
        let file = {
            filename: "main",
            ext: "cpp",
            id: "0x5df321a476c00000",
            code: "#include <iostream>\nint main() {\nstd::cout << \"hi\" << std::endl\; \n}\n"
        }
        chai.request(address)
            .post('/cppCompile/saveFile')
            .send(file)
            .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('status').eql('success');
                    console.log(res.body);
                done();
            });
    });

});

describe('/POST Compile Program', () => {
    it('it should compile test program', (done) => {
        let compReq = {
            id:"0x5df321a476c00000",
            filenames: ["main.cpp"],
        }
        chai.request(address)
        .post('/cppCompile/compile')
        .send(compReq)
        .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.should.have.property('status').eql(0);
                console.log(res.body);
                clearDir(cppCompilePath,"0x5df321a476c00000");
        });
        done();
    });
});


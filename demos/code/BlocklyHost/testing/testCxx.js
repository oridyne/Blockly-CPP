const { resolve } = require("path");
const { exit } = require("process");

process.env.NODE_ENV = "test";
const chai = require("chai"),
  chaiHttp = require("chai-http"),
  server = require("../server")(),
  fs = require("fs"),
  path = require("path"),
  config = require("../config"),
  assert = require("assert"),
  cppCompilePath = "./server/service/cppCompile",
  ws = require('ws'),
  chalk = require('chalk');
server.create(config);
let uid;
const address = "http://localhost:3000";
const expect = chai.expect;
let should = chai.should();
chai.use(chaiHttp);

const testFileContents = fs.readFileSync(`${__dirname}\\TestFiles\\test.h`).toString();
const testCodeContents = fs.readFileSync(`${__dirname}\\TestFiles\\code.h`).toString();


describe("CXX Test", async () => { 
    
    let testFilePromise = new Promise((resolve) => {
        let testFile = {
            filename: "test.h",
            id:"0x5df321a476c00000",
            code: testFileContents,
        }

        chai.request(address)
                .post("/cppCompile/saveFile").set('content-type', "application/json")
                .send((testFile))
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a("object");
                    res.body.should.have.property("status").eql("success");
                    console.log(res.body);
                    resolve(res.body.status);
        });
    });

    let codeFilePromise = new Promise((resolve) => {
        let codeFile = {
       filename: "code.h",
                id:"0x5df321a476c00000",
                code: testCodeContents
        }
        chai.request(address)
            .post("/cppCompile/saveFile").set('content-type', "application/json")
            .send((codeFile))
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a("object");
                res.body.should.have.property("status").eql("success");
                console.log(res.body);
                resolve(res.body.status);
        });
    });
      
    await new Promise((resolve) => {
        it("it should compile the code files", async () => {
            await codeFilePromise;
            await testFilePromise;
            let compReq = {
                id:"0x5df321a476c00000" ,
                filenames: ["code.h", "test.h"],
                args:[],
                isTest: true,
                exeName: "runner"
            };
            chai.request(address)
            .post("/cppCompile/compile")
            .send(compReq)
            .end((err, res) => {
                console.log(res.body);
                res.should.have.status(200);
                res.body.should.be.a("object");
                res.body.should.have.property("status").eql(0);
                resolve();
            });
        });
    });

    const websocket = new ws(`ws://localhost:3001`);
    websocket.on('open', () => {
        //console.log(chalk.keyword('orange')("connected"));
        const data = { msgType: 1, id: "0x5df321a476c00000", data: "runner" };
        const json = JSON.stringify(data);
        websocket.send(json);
    });

    websocket.on('close', () => {
        //clearDir(cppCompilePath,"0x5df321a476c00000" );
        //console.log(chalk.keyword('orange')("client disconnected"));
        exit(0);
    });

    websocket.on('message', (m) => {
        console.log(chalk.keyword('orange')("client recieved msg: " + m));
    });

    websocket.on('upgrade',(m) => {
        //console.log(chalk.keyword('orange')("upgrade"));
    });

    websocket.on('unexpected-response',(e)=>{
        //console.log(e);
    });

    websocket.on('error', (e) => {
        console.log(e);
    });
    // it("run websocket", async (done) => {
    // });
});

function clearDir(dir, uid) {
  fs.readdir(dir, (err, files) => {
    if (err) throw err;
    for (const file of files) {
      if (file.includes(uid)) {
        fs.unlink(path.join(dir, file), (err) => {
          if (err) throw err;
        });
      }
    }
  });
}
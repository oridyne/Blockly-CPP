process.env.NODE_ENV = "test";
const chai = require("chai"),
  chaiHttp = require("chai-http"),
  server = require("../server")(),
  fs = require("fs"),
  path = require("path"),
  config = require("../config"),
  assert = require("assert"),
  ws = require('ws'),
  chalk = require('chalk');
server.create(config);
const address = "http://localhost:3000";
const expect = chai.expect;
let should = chai.should();
chai.use(chaiHttp);
const testFileDir = `${__dirname}\\TestFiles`;

function sendTestFile(testFilename, uid, code) {
    let testFile = {
        filename: testFilename,
        id: uid,
        code: code,
    }
    let filePromise = new Promise((resolve) => {
        chai.request(address)
            .post("/cppCompile/saveFile").set('content-type', "application/json")
            .send((testFile))
            .end((err, res) => {
                if(err) console.error(err);   
                //console.log(res.body);
                res.should.have.status(200);
                res.body.should.be.a("object");
                res.body.should.have.property("status").eql("success");
                resolve(res.body.status);
        });
    });
    return filePromise;
}

function startWebsocket(id, exeName) {
    const websocket = new ws(`ws://localhost:3001`);
    websocket.on('open', () => {
        const data = { msgType: 1, id: id, data: exeName };
        const json = JSON.stringify(data);
        websocket.send(json);
    });

    websocket.on('message', (m) => {
        let resObj = JSON.parse(m);
        //console.log(chalk.keyword('orange')(`${id} recieved msg:  + ${m}`));
        console.log(chalk.underline.keyword('orange')(resObj.output));
    });

    websocket.on('unexpected-response',(e)=>{
        console.error(e);
    });
    websocket.on('error', (e) => {
        console.error(e);
        throw(e);
    });
}

function requestCompile(uid, filenames, args, isTest, exeName) {
    let compReq = {
        id: uid,
        filenames: filenames,
        args: args,
        isTest: isTest,
        exeName: exeName
    };
    let compPromise = new Promise((resolve) => {
        chai.request(address)
        .post("/cppCompile/compile")
        .send(compReq)
        .end((err, res) => {
            if(err)console.log(err);
            console.log(res.body);
            res.should.have.status(200);
            res.body.should.be.a("object");
            res.body.should.have.property("status").eql(0);
            resolve();
        });
    });
    return compPromise; 
}

describe("Basic CXX Test", () => {
    const testCodeContents = fs.readFileSync(`${testFileDir}\\code.h`).toString();
    const testFileContents = fs.readFileSync(`${testFileDir}\\test.h`).toString();
    let uid = "0x5df321a476c00000"
    it("it should compile the basic test", async () => {
        await sendTestFile("test.h", uid, testFileContents);
        await sendTestFile("code.h", uid, testCodeContents);
        await requestCompile(uid, ["test.h", "code.h"], ["-O1"], true, "runner");
        startWebsocket(uid, "runner"); 
    });
});

describe("Advanced CXX Test", () => {
    const conversionCpp = fs.readFileSync(`${testFileDir}\\BTDC\\Conversion.cpp`).toString();
    const conversionH = fs.readFileSync(`${testFileDir}\\BTDC\\Conversion.h`).toString();
    const testNew = fs.readFileSync(`${testFileDir}\\BTDC\\testNew.h`).toString();
    let uid = "0x5df321a476c055540";
    it("it should compile the advanced test", async () => {
        await sendTestFile("Conversion.cpp", uid, conversionCpp);
        await sendTestFile("Conversion.h", uid, conversionH);
        await sendTestFile("testNew.h", uid, testNew);
        await requestCompile(uid, ["Conversion.h", "Conversion.cpp", "testNew.h"], ["-O1"], true, "runner"); 
        startWebsocket(uid, "runner");
    });
});
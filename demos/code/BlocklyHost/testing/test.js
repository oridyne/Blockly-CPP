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
var uid;
var address = "http://localhost:3000";
var expect = chai.expect;
let should = chai.should();
chai.use(chaiHttp);

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

describe("/GET id", () => {
  it("it should GET id", (done) => {
    chai.request(address)
      .get("/cppCompile/id")
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        console.log(res.text);
        done();
      });
  });
});

describe("/POST SendFile", () => {
  it("it should save file", (done) => {
    let file = {
      filename: "main.cpp",
      id: "0x5df321a476c00000",
      code: '#include <iostream>\nint main() {\nstd::cout << "hi" << std::endl; \n}\n',
    };
    chai
      .request(address)
      .post("/cppCompile/saveFile").set('content-type', "application/json")
      .send((file))
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a("object");
        res.body.should.have.property("status").eql("success");
        console.log((res.body));
        done();
      });
  });
});

describe("Compile and websocket", async () => {
  const compile = new Promise((resolve,reject)=>{
    it("it should compile test program", (done) => {
    let compReq = {
      id:"0x5df321a476c00000" ,
      filenames: ["main.cpp"],
    };
    chai
      .request(address)
      .post("/cppCompile/compile")
      .send((compReq))
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a("object");
        res.body.should.have.property("status").eql(0);
        console.log(res.body);
        done();
        resolve();
      });
    });
  }); 
  await compile;
  var websocket = new ws(`ws://localhost:3001`);

  websocket.on('open', () => {
    console.log(chalk.keyword('orange')("connected"));
    const data = { msgType: 1, id: "0x5df321a476c00000", data: "" };
    const json = JSON.stringify(data);
    websocket.send(json);
  });

  websocket.on('close', () => {
    clearDir(cppCompilePath,"0x5df321a476c00000" );
    console.log(chalk.keyword('orange')("disconnected"));
    process.exit();
  });

  websocket.on('message', (m) => {
    console.log(chalk.keyword('orange')("recieved msg: " + m));
  });

  websocket.on('upgrade',(m) => {
    console.log(chalk.keyword('orange')("upgrade"));
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


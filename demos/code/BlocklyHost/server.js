const http = require("http");
const https = require('https');
const url = require('url'); 
const WebSocket = require('ws');
const { spawn } = require("child_process");
const execFile = require('child_process').execFile;
const fs = require('fs');
const path = require('path');
const compilePath = __dirname+"\\compile";

const flakeIDGen = require('flake-idgen'),
intformat = require('biguint-format'),
generator = new flakeIDGen();
const processes = new Map();
const crypto = require('crypto');

var port = 4020;
const wss = new WebSocket.Server({ noServer: true });
var server = http.createServer(function (request, response) {
  const parsedURL = url.parse(request.url, true);
  if(parsedURL.pathname === '/compile' && request.method === 'POST') {
    serverCompile(request,response);
  }
  else if(parsedURL.pathname === '/stop' && request.method === 'POST') {
    let body = '';
    request.on('data', (chunk) => {
      body += chunk;
    });
    request.on('end', () => {
      response.writeHead(200, {
        'Content-Type': 'text/plain',
        'Access-Control-Allow-Origin' : '*',
        'Access-Control-Allow-Headers' : 'Content-Type',
        'Access-Control-Allow-Methods' : 'GET,PUT,POST,DELETE,OPTIONS'
      });
      if (processes.has(body)) {
        if(!processes.get(body)){
          processes.delete(body);
          response.write(JSON.stringify({output:'program not running / not found', code:0}));
          response.end();
          return;
        }
        processes.get(body).kill('SIGINT');
        response.write(JSON.stringify({output:'program stopped', code:1}));
        response.end();
        
      } else {
        response.write(JSON.stringify({output:'program not running / not found', code:0}));
        response.end();
      }
    });
  }
});

server.on('upgrade', function upgrade(request, socket, head) {
  wss.handleUpgrade(request, socket, head, function done(ws) {
    wss.emit('connection', ws, request);
  });
});

server.listen(port, () => console.log(`Server running at http://localhost:${port}`));

function serverCompile(request, response) {
  // create new user id
  var id6 = intformat(generator.next(), 'hex', { prefix: '0x' });
  processes.set(id6);
  console.log("Uid made: " + id6);
  var compRes = {
    "compStatus" :"",
    "gpp" :"g++: ",
    "uid" :`${id6}`
  };
  (async () => { 
    var requestPromise = await new Promise((resolve,reject) => {  
      var body = Buffer.from([]);
      request.on('data', function (data) {
        body = Buffer.concat([body,data]);
        if (body.length > 1e7) {
          console.log("POSTED data too large!");
          request.connection.destroy();
          resolve(0);
        }
      });
      request.on("end", function() {
        response.writeHead(200, {
          'Content-Type': 'text/plain',
          'Access-Control-Allow-Origin' : '*',
          'Access-Control-Allow-Headers' : 'Content-Type',
          'Access-Control-Allow-Methods' : 'GET,PUT,POST,DELETE,OPTIONS'
        });
        resolve(body);
      });
    });
    if(requestPromise === 0) {
      return console.log('request too big');
    }
    var bodyJson = JSON.parse(requestPromise.toString());
    console.log(bodyJson);
    //Write request body to file
    await new Promise((resolve,reject)=>{
      fs.writeFile( compilePath + `/main${id6}.cpp`, bodyJson.code, function (err) {
        if (err) {
          resolve();
          return console.log(err);
        }
        console.log(`file written id: ${id6}`);
        resolve();
      });
    });
    //Call g++
    var gppArg =  ["-o",`./main${id6}.exe`,`./main${id6}.cpp`,];
    console.log(compilePath);
    const gpp = spawn("g++",gppArg, {cwd: compilePath });    
    const compilePromise = await new Promise((resolve,reject)=> {
      gpp.stdout.on("data", (data)=>{ 
        console.log(`g++ stdout: ${data}`);
        compRes.gpp += data;
      });
      gpp.stderr.on("data", (data)=>{ 
        console.log(`g++ stderr: ${data}`);
        compRes.gpp += data;
      });
      gpp.on("error",(error)=>{
        console.log(error);
        resolve(1);
      });
      gpp.on("close",(code)=>{
        resolve(code);
      });
    });
    // when compile fails send failure and error messages else send back success
    if(compilePromise == 0) {
      compRes.compStatus = 0;
      response.write(JSON.stringify(compRes, null, 3));
      response.end();
    } else {
      compRes.compStatus = 1;
      response.write(JSON.stringify(compRes, null, 3));
      response.end();
      clearDir(compilePath,id6);
    }
  })();	
}

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
//let sockets = [];
wss.on('connection', function connection(ws, req) {
  //sockets.push(ws);
  //msgType
  // 1 id
  // 2 input
  ws.on('message', function message(msg) {
    var msgJson = JSON.parse(msg);
    switch(msgJson.msgType) {
      case 1:
        ws.send(JSON.stringify({id:`user id: ${msgJson.id}`}));
        console.log(`Received message ${msgJson.id} from user`);
        runProgram(ws, msgJson.id);
        break;
      case 2:
        if (processes.has(msgJson.id)) {
          processes.get(msgJson.id).stdin.write(msgJson.data + "\n");
          console.log(`Received input ${msgJson.data} from user`);
          //ws.send(msgJson.data);
        } else {
          ws.send(JSON.stringify({output:'process not running', stop:1}));
        }
        break;
    }
  });
  ws.on('close', function close() {
    console.log('disconnected');
  });
});

function runProgram(ws,uid) {
  const runCompile = execFile(`./main${uid}.exe`,{cwd: compilePath});
  processes.set(uid, runCompile);
  runCompile.stdout.on("data", (data) => {
    console.log(data);
    ws.send(JSON.stringify({output:data, stop:0}));
  });
  runCompile.stderr.on("data", (data) => {
    console.log(data);
    ws.send(JSON.stringify({output:data, stop:0}));
  });
  runCompile.on("close", (code) => {
    ws.send(JSON.stringify({output:`Process exited with code ${code}`, stop:1}));
    clearDir(compilePath,uid);
    processes.delete(uid);
    ws.terminate();
  });
}

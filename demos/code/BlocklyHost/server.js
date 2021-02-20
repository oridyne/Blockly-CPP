const http = require("http");
const { spawn } = require("child_process");
const execFile = require('child_process').execFile;
const fs = require('fs');
const path = require('path');
const compilePath = __dirname+"/compile";
const url = require('url'); 
const https = require('https');
const flakeIDGen = require('flake-idgen'),
intformat = require('biguint-format'),
generator = new flakeIDGen();
const processes = new Map();

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
      console.log(body);
      response.writeHead(200, {
        'Content-Type': 'text/plain',
        'Access-Control-Allow-Origin' : '*',
        'Access-Control-Allow-Headers' : 'Content-Type',
        'Access-Control-Allow-Methods' : 'GET,PUT,POST,DELETE,OPTIONS'
      });
      if (processes.has(body)) {
        processes.get(body).kill('SIGINT');
        processes.delete(body);
        response.write('program stopped');
        response.end();
        clearDir(compilePath,body);
      } else {
        response.write('program not running / not found');
        response.end();
      }
    });
  }
  else if(parsedURL.pathname === '/input' && request.method === 'POST') {
    let body = '';
    request.on('data', (chunk) => {
      body += chunk;
    });
    request.on('end', () => {
      console.log(body);
      var proc = JSON.parse(body);
      response.writeHead(200, {
        'Content-Type': 'text/plain',
        'Access-Control-Allow-Origin' : '*',
        'Access-Control-Allow-Headers' : 'Content-Type',
        'Access-Control-Allow-Methods' : 'GET,PUT,POST,DELETE,OPTIONS'
      });
      if (processes.has(proc.id)) {
        processes.get(proc.id).stdin.write(proc.input + "\n");
        response.write(proc.input);
      } else {
        response.write('program not running / not found');
        response.end();
      }
    });
  }
}).listen(4020);

function serverCompile(request, response) {
  // create new user id
  var id6 = intformat(generator.next(), 'hex', { prefix: '0x' });
  processes.set(id6);
  response.writeHead(200, {
    'Content-Type': 'text/plain',
    'Access-Control-Allow-Origin' : '*',
    'Access-Control-Allow-Headers' : 'Content-Type',
    'Access-Control-Allow-Methods' : 'GET,PUT,POST,DELETE,OPTIONS'
  });
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
        resolve(body);
      });
    }); 
    if(requestPromise === 0) {
      return console.log('request too big');
    }
    var bodyJson = JSON.parse(requestPromise.toString());
    //Write request body to file
    fs.writeFile( compilePath + `/main-${id6}.cpp`, bodyJson.code, function (err) {
      if (err) {
        request.connection.destroy();
        return console.log(err);
      }
    });
    //Call g++
    const gpp = spawn("g++", ["-o",`./main-${id6}.exe`,`./main-${id6}.cpp`,], {cwd: compilePath });
    const compilePromise = new Promise((resolve,reject)=>{
      gpp.stdout.on("data", (data)=>{ 
        console.log(`g++ stdout: ${data}`);
        compRes.gpp+=data;
      });
      gpp.stderr.on("data", (data)=>{ 
        console.log(`g++ stderr: ${data}`);
        compRes.gpp+=data;
      });
      gpp.on("close",(code)=>{
        resolve (code);
      });
    });
    //Split into websocket server
    // when compile fails send failure and error messages else send back success
    if(await compilePromise == 0) {
      compRes.compStatus = 0;
      response.write(JSON.stringify(compRes, null, 3));
      response.end();
      //   response.end();
      // const runCompile = execFile("./main.exe",{cwd: compilePath});
      // processes.set(bodyJson.id, runCompile);
      // runCompile.stdout.on("data", (data) => {
      //   console.log(data);
      //   compRes.exe += data;
      // });
      // runCompile.stderr.on("data", (data) => {
      //   console.log(data);
      //   compRes.exe += data;
      // });
      // runCompile.on("close", (code) => {
      //   console.log(`main.exe exited with code ${code}`);
      //   compRes.exe += `\nmain.exe exited with code ${code}`;
      //   response.write(JSON.stringify(compRes, null, 3));
      //   response.end();
      //   clearDir(compilePath);
      //   processes.delete(bodyJson.id);
      // });
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
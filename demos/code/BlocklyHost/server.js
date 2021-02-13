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
    else if(parsedURL.pathname === '/userid' && request.method === 'GET') {
      var id6 = intformat(generator.next(), 'hex', { prefix: '0x' });
      processes.set(id6);
      response.writeHead(200, {
        'Content-Type': 'text/plain',
        'Access-Control-Allow-Origin' : '*',
        'Access-Control-Allow-Headers' : 'Content-Type',
        'Access-Control-Allow-Methods' : 'GET,PUT,POST,DELETE,OPTIONS'
      });
      response.write(`${id6}`);
      console.log("Uid made: " + id6);
      response.end();
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
  var compRes = {
    "gpp" :"g++: ",
    "exe" :"program output: "
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
            'Content-Type': 'application/json',
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
    //Write request body to file
    fs.writeFile( compilePath + "/main.cpp", bodyJson.code, function (err) {
      if (err) {
        return console.log(err);
      }
    });
    //TODO make exes and files unique using userid
    //TODO clear files based on userid
    //Call g++
    const gpp = spawn("g++", ["-o","./main.exe","./main.cpp",], {cwd: compilePath });
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
    //if compilation successful execute compiled file 
    if(await compilePromise == 0) {
      const runCompile = execFile("./main.exe",{cwd: compilePath});
      processes.set(bodyJson.id, runCompile);
      runCompile.stdout.on("data", (data) => {
        console.log(data);
        compRes.exe += data;
      });
      runCompile.stderr.on("data", (data) => {
        console.log(data);
        compRes.exe += data;
      });
      runCompile.on("close", (code) => {
        console.log(`main.exe exited with code ${code}`);
        compRes.exe += `\nmain.exe exited with code ${code}`;
        response.write(JSON.stringify(compRes, null, 3));
        response.end();
        clearDir(compilePath);
        processes.delete(bodyJson.id);
      });
    } else {
      compRes.exe += "compilation failed";
      response.write(JSON.stringify(compRes, null, 3));
      response.end();
    }
  })();	
}

function clearDir(dir) {
    fs.readdir(dir, (err, files) => {
      if (err) throw err;
      for (const file of files) {
        fs.unlink(path.join(dir, file), err => {
          if (err) throw err;
        });
      }
    });
  } 
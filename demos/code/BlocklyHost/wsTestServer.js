const ws = require("ws");
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

var WebSocketServer = require('ws').Server;

function noop() {}

function heartbeat() {
  this.isAlive = true;
}

wss = new WebSocketServer({port: 4080});

wss.on('connection', (ws) => {
  ws.id =  intformat(generator.next(), 'hex', { prefix: '0x' });
  ws.isAlive = true;
  ws.on('pong', heartbeat);
  ws.on('message', function(message) {
    console.log('Received Message:', message);
    if(message == 'do') {
      const runCompile = execFile("./testprog",{cwd: __dirname});
      runCompile.stdout.on("data", (data) => {
        console.log(data);
        ws.send(data);
      });
      runCompile.stderr.on("data", (data) => {
        console.log(data);
        ws.send(data);
      });
      runCompile.on("close", (code) => {
        console.log(`main.exe exited with code ${code}`);
        ws.send(`\nmain.exe exited with code ${code}`);
      });
    }
  });
});

const interval = setInterval(function ping() {
    wss.clients.forEach(function each(ws) {
      if (ws.isAlive === false) return ws.terminate();
  
      ws.isAlive = false;
      ws.ping(noop);
    });
}, 30000);
  
wss.on('close', function close() {
    clearInterval(interval);
});

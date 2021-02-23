'use strict';
const 
  runProgram = require('../service/cppService').runProgram,
  url = require('url'); 
function wsInit (server, wss) {
  server.on('upgrade', (req, socket, head) => {
      wss.handleUpgrade(req, socket, head, socket => {
        wss.emit('connection', socket, req);
      });
  });
  let sockets = [];
  wss.on('connection', function connection(ws, req) {
    ws.id = req.url.replace('/?id=', '');
    sockets.push(ws.id);
    //msgType
    // 1 id
    // 2 input
    ws.on('message', function message(msg) {
      var msgJson = JSON.parse(msg);
      switch(msgJson.msgType) {
        case 1:
          ws.send(JSON.stringify({id:`user id: ${ws.id}`}));
          console.log(`Received message ${ws.id} from user`);
          runProgram(ws, ws.id);
          break;
        case 2:
          if (processes.has(ws.id)) {
            processes.get(ws.id).stdin.write(msgJson.data + "\n");
            console.log(`Received input ${msgJson.data} from user`);
          } else {
            ws.send(JSON.stringify({output:'process not running', stop:1}));
          }
          break;
      }
    });

    ws.on('close', function close() {
        console.log(`${ws.id}disconnected`);
        sockets.splice (sockets.indexOf(ws.id), 1);
    });
  });
}
module.exports = {
  wsInit: wsInit,
};

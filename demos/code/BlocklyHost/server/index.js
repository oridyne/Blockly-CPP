/**
 * @author Noah Plasse
 * @email nplasse@qmail.qcc.edu
 * @version 1.0
 * @copyright 2021
**/

"use strict";
const  WebSocket = require("ws"),
  http = require('http'),
  https = require('https'),
  cors = require('cors');
const cppService = require("./service/cppService");

module.exports = function () {
  let server,
    wss = new WebSocket.Server({
      port:3001,
    }),
    create;

  create = function (config) {    
    server = http.createServer((req, res) => {
      let routes = require("./routes");
      routes.requestHandler(req, res);
    });
    let port = config.localConfig.port,
        hostname = config.localConfig.hostname;
    cppService.wsInit(wss);
    server.listen(port, hostname, () => {
        console.log("server listening on - http://" + hostname + ":" + port);
    });
  };
  return {
    create: create,
    wss: wss
  };
};

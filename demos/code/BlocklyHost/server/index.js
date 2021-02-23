'use strict'
const     
    express = require('express'),
    WebSocket = require('ws');


module.exports = function() {
    let server = express(),
    wss = new WebSocket.Server({ noServer: true }),
    create,
    start;

    create = function(config) {
        let routes = require('./routes');
        //Settings
        //server.set('env', config.env);
        server.set('port', config.localConfig.port);
        server.set('hostname', config.localConfig.hostname);
        server.use(express.json());
        routes.init(server, wss);
    }
    
    start = function() {
        let hostname = server.get('hostname'),
        port = server.get('port');
        server.listen(port, function() {
            console.log('Express server listening on - http://' + hostname + ':' + port);
        });
    }

    return {
        create: create,
        start: start,
        wss: wss
    };
}
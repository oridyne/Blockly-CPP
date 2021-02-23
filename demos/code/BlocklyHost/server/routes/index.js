'use strict';

const
    express = require('express'),
    cppController = require('../controllers/cppController'),
    wsService = require('../ws/wsService');

function init(server, wss) {
    server.get('*', function (req, res, next) {
        console.log('Request was made to: ' + req.originalUrl);
        return next();
    });
    server.get('/', function (req, res) {
            res.json({data:'hi'});
        });
    
    server.use('/cppCompile',cppController);
    wsService.wsInit(server,wss);
}

module.exports = {
    init: init
};

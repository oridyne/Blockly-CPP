'use strict';

const chalk = require('chalk');
const cppService = require('../service/cppService');

function init(server, wss) {
    server.get('*', function (req, res, next) {
        console.log(chalk.magenta('Request was made to: ' + req.originalUrl));
        return next();
    });
    server.post('*', function (req, res, next) {
        console.log(chalk.magenta('Request was made to: ' + req.originalUrl));
        return next();
    });
    server.get('/', function (req, res) {
        res.json({data:'hi'});
    });
    //make router for multi-language in future
    server.post("/cppCompile/saveFile", cppService.saveFile);
    server.get("/cppCompile/id", cppService.getID);
    server.post("/cppCompile/compile", cppService.compileProgram);
    server.post("/stopProgram", cppService.stopProgram); 
    cppService.wsInit(server,wss);
}

module.exports = {
    init: init
};

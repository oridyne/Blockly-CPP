/**
 * @author Noah Plasse
 * @email nplasse@qmail.qcc.edu
 * @version 1.0
 * @copyright 2021
 **/
'use strict';

const
    server = require('./server')(),
    config = require('./config');

server.create(config);

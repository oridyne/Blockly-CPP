/*
  Author: Noah Plasse
  Email: nplasse@qmail.qcc.edu
  Version: 1.0
  2021
*/
'use strict';

const
    server = require('./server')(),
    config = require('./config');

server.create(config);

'use strict';

const
    express = require('express'),
    cppService = require('../service/cppService');

let router = express.Router();

router.get('/id', cppService.getID);
router.post('/compile', cppService.compileProgram);
router.post('/saveFile', cppService.saveFile);
router.post('/stopProgram', cppService.stopProgram);

module.exports = router;

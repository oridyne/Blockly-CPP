/**
 * @author Noah Plasse
 * @email nplasse@qmail.qcc.edu
 * @version 1.0
 * @copyright 2021
 **/

const { spawn } = require("child_process");
const execFile = require("child_process").execFile;
const fs = require('fs-extra');
const path = require("path");
// Edit this to change where files are saved
const compilePath = __dirname + "\\cppCompile";
// Change this to where cxxtestgen is stored
const cxxGenPath = "C:\\cygwin64\\cxxtest\\cxxtestgen.pl";
const flakeIDGen = require("flake-idgen"),
  intformat = require("biguint-format"),
  generator = new flakeIDGen();
const processes = new Map();
const chalk = require('chalk');


/**
* Simple function that writes json responses 
* @param  res   the response object returned by the server
* @param  obj   the json object to be written in the response
*/
function writeJsonRes(res, obj) {
  res.write(JSON.stringify(obj));
  res.end();
}

/**
* Generate new user ID 
* the user id is saved clientside so they can use it in the compilation process
* @param  res   the response object returned by the server
*/
function getID(res) {
  const id6 = intformat(generator.next(), "hex", {prefix: "0x"});
  console.log(chalk.green("Uid made: " + id6));
  res.writeHead(200);
  writeJsonRes(res, id6);
}

/**
* Save files serverside 
* The files are saved to the server in a folder that has the name of the user's ID
* File extensions are checked to make sure they are .cpp or .h files
* @param  req   the request object sent by the user
* @param  res   the response object returned by the server
*/
async function saveFile(req, res) {
  await fs.ensureDir(`${compilePath}\\${req.id}`);
  // Check file ext //
  if((req.filename.match(/\.(cpp|h)$/g) === null) && (req.filename.match(/^.+\.(?=(.+\.|\.))/g) !== null)) {
    res.setHeader('content-type',"application/json");
    res.writeHead(400);
    writeJsonRes(res, {
      filename: req.filename,
      status: "fail"
    });
    return console.log(`${req.filename} didn't save\next is wrong`);
  } 
  // write the file to compilation folder
  fs.writeFile(`${compilePath}\\${req.id}\\${req.filename}`, req.code, function (err) {
    if (err) {
      res.setHeader('content-type',"application/json");
      res.writeHead(400);
      writeJsonRes(res,{file: req.filename, status: "fail" });
      return console.error(err);
    }
    res.setHeader('content-type',"application/json");
    res.writeHead(200);
    writeJsonRes(res, {file: req.filename, status: "success" });
  });
}

/**
* Generates CXX Test  
* uses cxxtest gen to generate a runner file that will be compiled by g++
* @param  req  the request object sent by the user
* @return a promise for the test generation
*/
async function generateTest(req) {

  let cxxArgs =  [ cxxGenPath, "--error-printer", "-o", `runner.cpp`];
  for (let i = 0; i < req.filenames.length; i++) {
    if(req.filenames[i].startsWith("test")) {
      let filename = `${compilePath}\\${req.id}\\${req.filenames[i]}`.replace(/\\/g, '\\\\');
      console.log(chalk.keyword('lime')("Test file: " + filename));
      cxxArgs.push(filename);
    }
  }
  console.log(chalk.greenBright.bold(cxxArgs.join(" ")));
  // spawn cxxtestgen 
  const cxx = spawn("perl", cxxArgs,  { cwd: `${compilePath}\\${req.id}` });
  let genTestPromise = new Promise((resolve, reject) => {
    cxx.stderr.on(("data"), (data) => {
      console.log(data.toString());
    });
    cxx.on("close", (code) => {
      if(code === 0) { 
        resolve(code);
      } else { 
        reject(1);
      }
    });
  });
  return genTestPromise;
}

/**
* Compile user program
* @param  req  the request object sent by the user
* @param  res  the response object
*/
async function compileProgram(req, res) {
  let exeName = req.exeName; 
  let gppOut = "";
  let gppArg = ["-o", `${exeName}.exe`];
  // get args for g++
  req.args.forEach((arg) => gppArg.push(arg));
  if(req.isTest) {
    let genCode = await generateTest(req);
    switch(genCode) {
      case 0:
        gppArg.push(`runner.cpp`);
        break;
      case 1:
        res.setHeader('content-type',"application/json");
        res.writeHead(200);
        writeJsonRes(res,{ gpp: "error occured", status: 1});
        clearDir(compilePath, req.uid);
        return;  
    }
  }

  // get filenames
  req.filenames.forEach(file => gppArg.push(file));

  // Send command executed in response
  let cmdString = "g++ " + gppArg.join(" ");
  console.log(chalk.bold.yellow(cmdString));
  gppOut += cmdString;

  // call g++
  const gpp = spawn("g++", gppArg, { cwd: `${compilePath}\\${req.id}` });
  const compilePromise = await new Promise((resolve) => {
    gpp.stdout.on("data", (data) => gppOut += data);
    gpp.stderr.on("data", (data) => gppOut += data);
    gpp.on("error", (error) => {
      console.error(error);
      resolve(1);
    });
    gpp.on("close", code => resolve(code));
  }); 
  res.setHeader('content-type',"application/json");
  res.writeHead(200);
  writeJsonRes(res,{ gpp: gppOut, status: compilePromise});
  if (compilePromise !== 0) clearDir(compilePath, req.id);
}

/**
* Stop user program
*
* @param  req  the request object sent by the user
* @param  res  the response object
*/
function stopProgram(req, res) {
  res.setHeader('content-type',"application/json");
  // check if process list has the user process in it
  if (processes.has(req.id)) {
    if (!processes.get(req.id)) {
      processes.delete(req.id);
      res.writeHead(200);
      writeJsonRes(res,{output: "program not running / not found", code: 0,});
      return;
    }
    processes.get(req.id).kill("SIGINT");
    res.writeHead(200);
    writeJsonRes(res,{ output: "program stopped", code: 1,});
  } else {
    res.writeHead(200);
    writeJsonRes(res,{ output: "program not running / not found", code: 0,});
  }
}

/**
* Run user program 
*
* @param  req  the request object sent by the user
* @param  res  the response object
*/

function runProgram(ws, uid, exeName) {
  if(processes.has(uid)) {
    ws.send(JSON.stringify({output:"A program is still active\nStop it to run a new one", stop: 1}));
    return;
  }
  const runCompile = execFile(`./${uid}\\${exeName}.exe`, { cwd: compilePath });
  ws.send(JSON.stringify({output: `----Running Program----`, stop:0}));
  processes.set(uid, runCompile);
  runCompile.stdout.on("data", (data) => ws.send(JSON.stringify({ output: data, stop: 0 })));
  runCompile.stderr.on("data", (data) => ws.send(JSON.stringify({ output: data, stop: 0 })));
  runCompile.on("close", (code) => {
    ws.send(JSON.stringify({ output: `Process exited with code ${code}`, stop: 1 }));
    clearDir(compilePath, uid);
    processes.delete(uid);
    ws.terminate();
  });
}

/**
* Initialize Websocket 
* msgType of 1 are for initalizing a program execution
* msgType of 2 are for program input
* @param  wss websocket server object 
*/

function wsInit(wss) {
  wss.on("connection", function connection(ws, req) {
 
    ws.on("message", function message(msg) {
      const msgJson = JSON.parse(msg);
      switch (msgJson.msgType) {
        case 1:
          console.log(chalk.cyanBright(`Starting program run for ${msgJson.id}`));
          runProgram(ws, msgJson.id, msgJson.data);
          break;
        case 2:
          if (processes.has(msgJson.id)) {
            processes.get(msgJson.id).stdin.write(msgJson.data + "\n");
            console.log(chalk.cyanBright(`Program input: ${msgJson.data}`));
          } else {
            ws.send(JSON.stringify({ output: "process not running", stop: 1 }));
          }
          break;
      }
    });
    ws.on("close", function close() {
        console.log(chalk.cyanBright(`Server: client disconnected`));
      });
  });
}

/**
* Clear user files from server 
*
* @param  dir path to directory 
* @param  uid user id 
*/
async function clearDir(dir, uid) {
  try {
    await fs.remove(`${dir}\\${uid}`);
  } catch (err) {
    console.error(err);
  }
}

module.exports = {
  saveFile: saveFile,
  getID: getID,
  compileProgram: compileProgram,
  runProgram: runProgram,
  stopProgram: stopProgram,
  wsInit: wsInit,
};

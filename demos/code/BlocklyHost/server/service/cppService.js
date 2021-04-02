const { spawn } = require("child_process");
const execFile = require("child_process").execFile;
const fs = require("fs");
const path = require("path");
const compilePath = __dirname + "\\cppCompile";
const flakeIDGen = require("flake-idgen"),
  intformat = require("biguint-format"),
  generator = new flakeIDGen();
const processes = new Map();
const chalk = require('chalk');
const { cpuUsage } = require("process");

function writeJsonRes(res, obj) {
  res.write(JSON.stringify(obj));
  res.end();
}

function getID(req, res) {
  // create new user id
  const id6 = intformat(generator.next(), "hex", {prefix: "0x"});
  console.log(chalk.green("Uid made: " + id6));
  res.writeHead(200);
  writeJsonRes(res, id6);
}

function saveFile(req, res) {
  // Check file ext //
  if((req.filename.match(/\.(cpp|h)$/g) === null) && (req.filename.match(/^.+\.(?=(.+\.|\.))/g) !== null)) {
    res.setHeader('content-type',"application/json");
    res.writeHead(200);
    writeJsonRes(res, {
      filename: req.filename,
      status: "fail"
    });
    return console.log(`${req.filename} didn't save\next is wrong`);
  }
  // add uid to file
  let filename = req.filename.replace(".", `${req.id}.`);
  // write the file to compile folder
  fs.writeFile(`${compilePath}\\${filename}`, req.code, function (err) {
    if (err) {
      res.setHeader('content-type',"application/json");
      res.writeHead(200);
      writeJsonRes(res,{file: req.filename, status: "fail" });
      return console.log(err);
    }
    console.log(chalk.green(`File ${filename} written`));
    res.setHeader('content-type',"application/json");
    res.writeHead(200);
    writeJsonRes(res, {file: req.filename, status: "success" });
  });
}
// figure out how to make include statements in test files work with IDs (and also regular files)
async function generateTest(req) {
  let cxxArgs =  ["C:\\cygwin64\\cxxtest\\cxxtestgen.pl", "--error-printer", "-o", `runner${req.id}.cpp`];
  for (let i = 0; i < req.filenames.length; i++) {
    if(req.filenames[i].startsWith("test")) {
      let filename = req.filenames[i].replace(".", `${req.id}.`);
      filename = `${compilePath}\\${filename}`.replace(/\\/g, '\\\\');
      console.log(chalk.keyword('lime')("Test file: " + filename));
      cxxArgs.push(filename);
    }
  }
  console.log(chalk.keyword('magenta')(cxxArgs.join(" ")));
  const cxx = spawn("perl", cxxArgs,  { cwd: compilePath }); 
  let genTestPromise = new Promise((resolve, reject) => {
    cxx.stderr.on(("data"), (data) => console.log(data.toString()));
    cxx.on("close", (code) => {
      if(code === 0) { 
        resolve(code);
      } else { 
        resolve(1);
      }
    });
  });
  return genTestPromise;
}

async function compileProgram(req, res) {
  let exeName = req.exeName; 
  let gppOut = "";
  let gppArg = ["-o", `${compilePath}\\${exeName}${req.id}.exe`];
  var outArg = ["g++", "-o", `${exeName}.exe`];
  // get args for g++
  req.args.forEach((arg) => {
    gppArg.push(arg);
    outArg.push(arg);
  });
  if(req.isTest) {
    exeName = "runner";
    let genCode = await generateTest(req);
    switch(genCode) {
      case 1:
        res.setHeader('content-type',"application/json");
        res.writeHead(200);
        writeJsonRes(res,{ gpp: "error occured", status: 1});
        clearDir(compilePath, req.uid);
        return;  
      case 2:
        res.setHeader('content-type',"application/json");
        res.writeHead(200);
        writeJsonRes(res,{ gpp: "no test files provided", status: 1});
        clearDir(compilePath, req.uid);
        return;
      case 0:
        gppArg.push(`runner${req.id}.cpp`);
        break;
    }
  }

  // get filenames
  for (let i = 0; i < req.filenames.length; i++) {
    outArg.push(req.filenames[i]);
    let filename = req.filenames[i].replace(".", `${req.id}.`);
    gppArg.push(`${compilePath}\\${filename}`);
     console.log(chalk.green(`File ${filename} added`));
  }

  console.log(outArg);
  // Send command executed in response
  gppOut += outArg.join(" ");
  // call g++
  const gpp = spawn("g++", gppArg, { cwd: compilePath });
  const compilePromise = await new Promise((resolve) => {
    gpp.stdout.on("data", (data) => {
      console.log(`g++ stdout: ${data}`);
      gppOut += data;
    });
    gpp.stderr.on("data", (data) => {
      console.log(`g++ stderr: ${data}`);
      gppOut += data;
    });
    gpp.on("error", (error) => {
      console.log(error);
      resolve(1);
    });
    gpp.on("close", (code) => {
      resolve(code);
    });
  }); 
  res.setHeader('content-type',"application/json");
  res.writeHead(200);
  writeJsonRes(res,{ gpp: gppOut, status: compilePromise});
  if (compilePromise !== 0) {
    clearDir(compilePath, req.id);
  }
}

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
    res.writeJsonRes(res,{ output: "program stopped", code: 1,});
  } else {
    res.writeHead(200);
    writeJsonRes(res,{ output: "program not running / not found", code: 0,});
  }
}

function runProgram(ws, uid, exeName) {
  if(processes.has(uid)) {
    ws.send(JSON.stringify({output:"A program is still active\nStop it to run a new one", stop: 1}));
    ws.terminate();
    return;
  }
  const runCompile = execFile(`./${exeName}${uid}.exe`, { cwd: compilePath });
  processes.set(uid, runCompile);
  
  runCompile.stdout.on("data", (data) => {
    console.log(data);
    ws.send(JSON.stringify({ output: data, stop: 0 }));
  });
  
  runCompile.stderr.on("data", (data) => {
    console.log(data);
    ws.send(JSON.stringify({ output: data, stop: 0 }));
  });
  
  runCompile.on("close", (code) => {
    ws.send(
      JSON.stringify({ output: `Process exited with code ${code}`, stop: 1 })
    );
    clearDir(compilePath, uid);
    processes.delete(uid);
    ws.terminate();
  });
}

function wsInit(wss) {
  //let sockets = [];
  wss.on("connection", function connection(ws, req) {
    //ws.id = req.url.replace("/?id=", "");
    //sockets.push(ws.id);
    /*
      msgType
      1 start
      2 input
    */
    ws.on("message", function message(msg) {
      const msgJson = JSON.parse(msg);
      switch (msgJson.msgType) {
        case 1:
          ws.send(JSON.stringify({ id: `${msgJson.id}` }));
          console.log(chalk.cyanBright(`Server received message ${msgJson.id} from user`));
          runProgram(ws, msgJson.id, msgJson.data);
          break;
        case 2:
          if (processes.has(msgJson.id)) {
            processes.get(msgJson.id).stdin.write(msgJson.data + "\n");
            console.log(chalk.cyanBright(`Server Received input ${msgJson.data} from user`));
          } else {
            ws.send(JSON.stringify({ output: "process not running", stop: 1 }));
          }
          break;
      }
    });

    ws.on("close", function close() {
        console.log(chalk.cyanBright(`Server: Client disconnected`));
        //sockets.splice(sockets.indexOf(msgJson.id), 1);
      });
  });
}

function clearDir(dir, uid) {
  fs.readdir(dir, (err, files) => {
    if (err) throw err;
    for (const file of files) {
      if (file.includes(uid)) {
        fs.unlink(path.join(dir, file), (err) => {
          if (err) throw err;
        });
      }
    }
  });
}

module.exports = {
  saveFile: saveFile,
  getID: getID,
  compileProgram: compileProgram,
  runProgram: runProgram,
  stopProgram: stopProgram,
  wsInit: wsInit,
};

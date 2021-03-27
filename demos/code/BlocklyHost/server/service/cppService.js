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
  //console.log("reg ex 1:" +  req.filename.match(/\.(cpp|h)$/g));
  //console.log("reg ex 2:" +  req.filename.match(/^.+\.(?=(.+\.|\.))/g));
  if((req.filename.match(/\.(cpp|h)$/g) === null) && (req.filename.match(/^.+\.(?=(.+\.|\.))/g) !== null)) {
    res.setHeader('content-type',"application/json");
    res.writeHead(200);
    writeJsonRes(res, {
      filename: req.filename,
      status: "fail"
    });
    return console.log(`${req.filename} didn't save\next is wrong`);
  }
  let filename = req.filename.replace(".", `${req.id}.`);
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

function compileProgram(req, res) {
  let gppOut = "";
  const gppArg = ["-o", `${compilePath}\\main${req.id}.exe`];

  fs.readdir(dirPath, function (err, files) {
    if (err) {
        return console.log('Unable to scan dir ' + err);
    } 
    files.forEach(function (file) {
      if(file.includes(req.id)) gppArg.push(file);  
      console.log(file); 
    });
  });
  req.args.forEach((arg) => {
    gppArg.push(arg);
  });
  // for (let i = 0; i < req.filenames.length; i++) {
  //   let filename = req.filenames[i].replace(".", `${req.id}.`);
  //   gppArg.push(`${compilePath}\\${filename}`);
  //    console.log(chalk.green(`File ${filename} added`));
  // }
  //Call g++
  const gpp = spawn("g++", gppArg, { cwd: compilePath });
  (async () => {
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
  })();
}

function runProgram(ws, uid) {
  const runCompile = execFile(`./main${uid}.exe`, { cwd: compilePath });
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

function stopProgram(req, res) {
  res.setHeader('content-type',"application/json");
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

function wsInit(wss) {
  //let sockets = [];
  wss.on("connection", function connection(ws, req) {
    //ws.id = req.url.replace("/?id=", "");
    //sockets.push(ws.id);
    /*
      msgType
      1 id
      2 input
    */
    ws.on("message", function message(msg) {
      const msgJson = JSON.parse(msg);
      switch (msgJson.msgType) {
        case 1:
          ws.send(JSON.stringify({ id: `${msgJson.id}` }));
          console.log(chalk.cyanBright(`Server received message ${msgJson.id} from user`));
          runProgram(ws, msgJson.id);
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

module.exports = {
  saveFile: saveFile,
  getID: getID,
  compileProgram: compileProgram,
  runProgram: runProgram,
  stopProgram: stopProgram,
  wsInit: wsInit,
};

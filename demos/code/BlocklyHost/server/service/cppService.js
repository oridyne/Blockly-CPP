const { spawn } = require("child_process");
const execFile = require('child_process').execFile;
const fs = require('fs');
const path = require('path');
const compilePath = __dirname+"\\cppCompile";
const flakeIDGen = require('flake-idgen'),
intformat = require('biguint-format'),
generator = new flakeIDGen();
const processes = new Map();

function getID(req, res) {
    // create new user id
    var id6 = intformat(generator.next(), 'hex', { prefix: '0x' });
    console.log("Uid made: " + id6);  
    res.json({id: id6});
}

function saveFile(req,res) {
  fs.writeFile( compilePath + `/${req.body.filename}${req.body.id}.${req.body.ext}`, req.body.code, function (err) {
      if (err) {
        res.json({status:'fail'});  
        return console.log(err);
      }
      console.log(`file written`);
      res.json({status:'success'});
  });
}

function compileProgram(req, res) {
  let gppOut = "";
  var gppArg =  ["-o",`./main${req.body.id}.exe`];
  console.log(req.body);
  for (let i = 0; i < req.body.filenames.length; i++) {
      let filename = req.body.filenames[i].replace('.', `${req.body.id}.`)
      gppArg.push(`./${filename}`);   
  }
  //Call g++
  const gpp = spawn("g++", gppArg, {cwd: compilePath });    
  (async () => { 
    const compilePromise = await new Promise((resolve,reject)=> {
      gpp.stdout.on("data", (data)=>{ 
        console.log(`g++ stdout: ${data}`);
        gppOut += data;
      });
      gpp.stderr.on("data", (data)=>{ 
        console.log(`g++ stderr: ${data}`);
        gppOut += data;
      });
      gpp.on("error",(error)=>{
        console.log(error);
        resolve(1);
      });
      gpp.on("close",(code)=>{
        resolve(code);
      });
    });
    if(compilePromise === 0) {
        res.json({
            gpp: gppOut,
            status: 0,
        });
    } else {
        res.json({
            gpp: gppOut,
            status: 1,
        });
        clearDir(compilePath,id6);
    }
  })();	
}

function runProgram(ws, uid) {
  const runCompile = execFile(`./main${uid}.exe`,{cwd: compilePath});
  processes.set(uid, runCompile);
  runCompile.stdout.on("data", (data) => {
    console.log(data);
    ws.send(JSON.stringify({output:data, stop:0}));
  });
  runCompile.stderr.on("data", (data) => {
    console.log(data);
    ws.send(JSON.stringify({output:data, stop:0}));
  });
  runCompile.on("close", (code) => {
    ws.send(JSON.stringify({output:`Process exited with code ${code}`, stop:1}));
    clearDir(compilePath,uid);
    processes.delete(uid);
    ws.terminate();
  });
}

function stopProgram(req, res) {
}

function clearDir(dir,uid) {
  fs.readdir(dir, (err, files) => {
    if (err) throw err;
    for (const file of files) {
      if (file.includes(uid)) {
        fs.unlink(path.join(dir, file), err => {
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
};
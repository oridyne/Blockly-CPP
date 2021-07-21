/**
 * @author Noah Plasse
 * @email nplasse@qmail.qcc.edu
 * @version 1.0
 * @copyright 2021
 **/

let term;
let uid;
let codeRunning = false;

$(function () {
  term = $("#terminal").terminal({},
    { prompt:"", greetings: "Compiler Terminal", outputLimit: 15 }
  );
});

/**
* Starts the code running and compilation process 
*/
async function runCode() {
  let res;
  let request;
  if (codeRunning) return;
  if(compileList.length === 0) {
    term.echo("No files to compile, add them in the compiler options");
    return;
  }
  // Get Id //
  let response = await fetch(`http://localhost:3000/cppCompile/id`);
  if(!response.ok)  {
    const message = `An error has occurred: ${response.status}`;
    throw new Error(message);
  }
  uid = await response.text();
  uid = uid.replace(/"/g,"");
  console.log("id made" + uid);
  // Send Files //  
  let reqFiles = [];
  for (const filename of compileList) {
    const code = Blockly.C.workspaceToCode(allWorkspaces.get(filename));
    request = JSON.stringify({
      "id": uid,
      "filename": filename,
      "code": code,
    });
    console.log(request);
    response = await fetch(`http://localhost:3000/cppCompile/saveFile`, {
        method: "POST",
        body: request,
        headers: {
        "Content-Type": "text/plain"
        }
    });
    if(!response.ok)  {
        const message = `An error has occurred: ${response.status}`;
        throw new Error(message);
    }
    res = await response.json();
    if(res.status !== "success") {
        console.log("sending file failed");
        return;
    } else {
      reqFiles.push(res.file);
    }
    console.log(res);
  }

  // Set Args //
  let argList = ["-O" + setOptimLevels[0], "-std=c++"+setVersion[0]];
  setMiscOpts.forEach((opt) => {
    argList.push(opt);
  });

  // Compile Program //
  request = JSON.stringify({
    id: uid,
    args: argList,
    filenames: reqFiles,
    exeName: "main",
    isTest: false,
  }); 

  response = await fetch(`http://localhost:3000/cppCompile/compile`, {
    method: "POST",
    body: request,
    headers: { "Content-Type": "text/plain" }
  });
  if (!response.ok) {
    const message = `An error has occurred: ${response.status}`;
    throw new Error(message);
  }
  res = await response.json();  
  term.echo(res.gpp);
  console.log(res.gpp);
  //console.log(res.status);
  if (res.status === 0) {
    console.log("webserver running");
    codeRunning = true;
    startWebSocket();
  }
}

/**
* Stops user program execution on the server 
*/
async function stopCodeRun() {
  if (!uid || !codeRunning) {
    term.echo("No code running");
    return;
  }
  const response = await fetch("http://localhost:3000/cppCompile/stop" , {
    method: "POST",
    body: JSON.stringify({ id: uid.toString() }),
    headers: { "Content-Type": "text/plain" }
  });
  if (!response.ok) {
    const message = `An error has occurred: ${response.status}`;
    throw new Error(message);
  }
  const res = await response.json();
  term.echo(res.output);
  codeRunning = res.code ? false : codeRunning;
}

/**
* Starts the websocket connection to the server to recieve and send program data 
* msgType of 1 are for initializing a program execution
* msgType of 2 are for sending program input
*/
function startWebSocket() {
  const ws = new WebSocket(`ws://localhost:3001`, ["json", "xml"]);
  ws.addEventListener("open", () => {
    const data = { msgType: 1, id: uid, data: "main" };
    const json = JSON.stringify(data);
    ws.send(json);
  });
  ws.addEventListener("message", (event) => {
    const data = JSON.parse(event.data);
    console.log(data);
    if (data.output) {
      codeRunning = data.stop ? false : codeRunning;
      if (!codeRunning) term.pop();
      term.echo(data.output);
    }
  });
  (async () => {
    while (codeRunning) {
      await term.read("", function (input) { 
            ws.send(JSON.stringify({ 
              msgType: 2, 
              data: input, 
              id: uid 
            }));
          },
          function () {}).catch((e) => {
            if (e) console.log(e);
        });
    }
  })();
}

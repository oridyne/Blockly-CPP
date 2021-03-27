let term;
let uid;
let codeRunning = false;

$(function () {
  term = $("#terminal").terminal({},
    { prompt: ">", greetings: "Compiler Terminal" }
  );
});
//TODO add notif if code already running and add error reporting for user
async function runCode() {
  let request;
  if (codeRunning) return;
  
  ///GET ID///
  let response = await fetch(`http://localhost:3000/cppCompile/id`);
  if(!response.ok)  {
    const message = `An error has occurred: ${response.status}`;
    throw new Error(message);
  }
  uid = await response.text();
  uid = uid.replace(/"/g,"");
  console.log("id made" + uid);
  
  ///SEND FILES///
  for (const filename of compileList) {
    const code = Blockly.C.workspaceToCode(workspaces.get(filename));
    request = JSON.stringify({
      "id": uid,
      "filename": filename,
      "code": code,
    });
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
    var res = await response.json();
    if(res.status !== "success") {
        console.log("sending file failed");
        continue;
    }
    console.log(res);
  }
  
  let argList = ["-O" + setOptimLevels[0], "-std="+setVersion[0]];
  setMiscOpts.forEach((opt) => {
    argList.push(opt);
  });
  ///COMPILE PROGRAM///
  request = JSON.stringify({
    id: uid,
    args: argList
  }); 
  response = await fetch(`http://localhost:3000/cppCompile/compile`, {
    method: "POST",
    body: request,
    headers: {
      "Content-Type": "text/plain"
    }
  });
  if (!response.ok) {
    const message = `An error has occurred: ${response.status}`;
    throw new Error(message);
  }
  res = await response.json();
  term.echo(res.gpp + "\n");
  console.log(res.gpp+"\n");
  if (!res.compStatus) {
    codeRunning = true;
    startWebSocket();
  }
}

///STOP CODE///
async function stopCodeRun() {
  if (!uid) return;
  const response = await fetch(`http://localhost:3000/cppCompile/stop`, {
    method: "POST",
    body: { id: uid.toString() },
    headers: {
      "Content-Type": "text/plain"
    }
  });
  if (!response.ok) {
    const message = `An error has occurred: ${response.status}`;
    throw new Error(message);
  }
  const res = await response.json();
  term.echo(res.output);
  codeRunning = res.code ? false : codeRunning;
}

//msgType
//1 id | 2 input
function startWebSocket() {
  const ws = new WebSocket(`ws://localhost:3001`, ["json", "xml"]);
  ws.addEventListener("open", () => {
    const data = { msgType: 1, id: uid, data: "" };
    const json = JSON.stringify(data);
    ws.send(json);
  });
  ws.addEventListener("message", (event) => {
    const data = JSON.parse(event.data);
    console.log(data);
    if (data.output) {
      codeRunning = data.stop ? false : codeRunning;
      if (!codeRunning) {
        term.pop();
      }
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
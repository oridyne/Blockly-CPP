var term;
var uid;
var codeRunning = false;

$(function() {
    term = $('#terminal').terminal({
    },{ prompt: '>', greetings: "Compiler Terminal" });
});

//use json objects for multiple blobs?
async function runCode() {
    if (codeRunning) return;
	var code = Blockly.C.workspaceToCode();
	var codeArray = [];
	codeArray.push(code);
    var request =  JSON.stringify({"code": codeArray.toString()});
    const response = await fetch(`http://localhost:4020/compile`, { method:"POST", body: request});
    if (!response.ok) {    
        const message = `An error has occured: ${r2.status}`;    
        throw new Error(message);  
    }
    const res = await response.json();    
    uid = res.uid;
    term.echo( res.gpp + "\n");
    if (!res.compStatus) {
        codeRunning = true;
        startWebSocket();
    }
}

async function stopCodeRun() {
    if(!uid) return;
    const response = await fetch(`http://localhost:4020/stop`, {method: "POST", body: uid.toString()});
    if (!response.ok) {    
        const message = `An error has occured: ${r2.status}`;    
        throw new Error(message);  
    }
    const res = await response.json();
    term.echo(res.output);
    codeRunning = res.code ? false : codeRunning;
}
//msgType
//1 id
//2 input
function startWebSocket() {
    const ws = new WebSocket('ws://localhost:4020', ['json', 'xml']);
    ws.addEventListener('open', () => {
        const data = { msgType:1, id: uid, data:""}
        const json = JSON.stringify(data);
        ws.send(json);
    });
    ws.addEventListener('message', event => {
        const data = JSON.parse(event.data);
        console.log(data);
        if(data.output) {
            codeRunning = data.stop ? false : codeRunning;
            if(!codeRunning) {
                term.pop();
            }
            term.echo(data.output);
        }
    });
    (async () => { 
        while(codeRunning){
            await term.read("",
            function(input) {ws.send(JSON.stringify({msgType:2,data:input,id:uid}));},
            function(){})
            .catch(e => {if(e)console.log(e);
            });
        }
    })();	
}


var term;
var uid;
var codeRunning = false;

$(function() {
    term = $('#terminal').terminal({
        input: async function(uinput) {
        },
    },{ prompt: '>', greetings: "Compiler Terminal" });
});

//use json objects for multiple blobs?
async function runCode() {
	var code = Blockly.C.workspaceToCode();
	var codeArray = [];
	codeArray.push(code);
    var request =  JSON.stringify({"id": uid,"code": codeArray.toString()});
    const r2 = await fetch(`http://localhost:4020/compile`, { method:"POST", body: request});
    if (!r2.ok) {    
        const message = `An error has occured: ${r2.status}`;    
        throw new Error(message);  
    }
    const res = await r2.json();
    uid = res.uid;
    term.echo( res.gpp + "\n");
}

async function stopCodeRun() {
    console.log(uid);
    const response = await fetch(`http://localhost:4020/stop`, {method: "POST", body: uid.toString()});
    if (!response.ok) {    
        const message = `An error has occured: ${r2.status}`;    
        throw new Error(message);  
    }
    const res = await response.text();
    term.echo(res);
}

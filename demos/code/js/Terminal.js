var term;
var uid = 0;

$(function() {
    term = $('#terminal').terminal({
        input: async function(uinput) {
            var request =  JSON.stringify({"id": uid,"input": uinput});
            let res = await fetch(`http://localhost:4020/input`, { method:"POST", body: request});
            return await res.text();
        },
    },{ prompt: '>', greetings: "Compiler Terminal" });
});

//use json objects for multiple blobs?
async function sendCodeToServer() {
    const r1 = await fetch(`http://localhost:4020/userid`, { method:"GET" });
    if (!r1.ok) {    
        const message = `An error has occured: ${r1.status}`;    
        throw new Error(message);  
    }
    uid = await r1.text();

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
    term.echo( res.gpp + "\n" + res.exe + "\n");
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

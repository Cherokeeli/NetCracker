//**************************************************************
//
//                      ioHub control flow
//ioHub mainly is consis of socket event
//Used for handle the worker process messages sending and retransmitt to master
//process.
//************************************************************** 

var ws = undefined
var createWs = function (pid, callback) {
    ws = new WebSocket("ws://localhost:2000/socket");

    ws.onopen = function (evt) {
        console.log("[WEBSOCKET]Thread socket opened.");
        ws.send('{"PID":' + pid + ',"type":"OPEN"}');
    };

    ws.onclose = function (evt) {
        console.log("[WEBSOCKET]Thread socket closed.");
    };

    ws.onmessage = function (evt) {
        console.log("[WEBSOCKET]Received " + evt.data);
        //ws.send(evt.data);
        if (evt.data == "COOL") {
            msgPage.echo("COOL DOWNING, PLEASE WAIT FOR 15 MINUTES");
            msgPage.wait(15*60*1000);
        } else {
            callback(evt.data);
        }
        ws.send('{"PID":' + pid + ',"type":"GET","data":"'+evt.data+'"}');
    };

    ws.onerror = function (evt) {
        console.log("[WEBSOCKET]Error. Retry connected" + evt.data);
        setTimeout(function() {
            createWs(pid);
        },5000);
    };
};
exports.createWs = createWs;

var sendWs = function (msg, options, pid) {
    if (msg != undefined && msg.length != 0) {
        var Transporter = new Object();
        Transporter.PID = pid;
        Transporter.type = options;
        Transporter.data = msg;
        console.log("[WEBSOCKET]Begin to sending data...")
        ws.send(JSON.stringify(Transporter));
        delete msg; //清空对象，释放内存
    } else {
        console.log('Message receive none');
        ws.send('{"PID":' + pid + ',"type":"END"}');
    }
}
exports.sendWs = sendWs;

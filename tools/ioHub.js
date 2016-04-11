var socketMan = function (pid) {

    ws.onopen = function (evt) {
        console.log("[WEBSOCKET]Thread socket opened.");
        ws.send("{PID:"+pid+",type:OPEN");
    };

    ws.onclose = function (evt) {
        console.log("[WEBSOCKET]Thread socket closed.");
    };

    ws.onmessage = function (evt) {
        console.log("[WEBSOCKET]Received uid[" + evt.data + "]");
        //ws.send(evt.data);
        callback(evt.data);
        ws.send("{PID:"+pid+",type:GET");
    };

    ws.onerror = function (evt) {
        console.log("[WEBSOCKET]Error." + evt.data);
    };
};
exports.socketMan = socketMan;

var socketSend = function (msg, options, pid) {
    var Transporter = new Object();
    Transporter.PID = pid;
    Transporter.type = options;
    Transporter.data = msg;
    console.log("[WEBSOCKET]Begin to sending data...")
    ws.send(JSON.stringify(Transporter));
}
exports.socketSend = socketSend;

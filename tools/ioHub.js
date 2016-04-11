var socketMan = function (callback) {

    ws.onopen = function (evt) {
        console.log("[WEBSOCKET]Thread socket opened.");
        ws.send('OPEN');
    };

    ws.onclose = function (evt) {
        console.log("[WEBSOCKET]Thread socket closed.");
    };

    ws.onmessage = function (evt) {
        console.log("[WEBSOCKET]Received pid[" + evt.data + "]");
        //ws.send(evt.data);
        callback(evt.data);
        ws.send('GET');
    };

    ws.onerror = function (evt) {
        console.log("[WEBSOCKET]Error." + evt.data);
    };
};

var socketSend = function (msg, options, pid) {
    var Transporter = new Object();
    Transporter.PID = pid;
    Transporter.type = options;
    Transporter.data = msg;
    console.log("[WEBSOCKET]Begin to sending data...")
    ws.send(JSON.stringify(Transporter));
}

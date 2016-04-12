var WebSocketServer = require('ws').Server,
    wss = new WebSocketServer({
        port: 2000
    });

wss.on('connection', function connection(ws) {
    ws.on('message', function incoming(message) {
        var parse = JSON.parse(message);
        console.log('[WEBSOCKET]Received: %s', message);
        if (parse.type=="OPEN")
            ws.send('2106855375');
    });
});

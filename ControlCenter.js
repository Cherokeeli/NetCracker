var filter = require('./tools/uidFilter');
var execFile = require('child_process').execFile;
var state = 'casperjs mainThread.js';
const cluster = require('cluster'); //负载均衡模块
var numCPUs = require('os').cpus().length; //cpu核心数量
var NUM_OF_WORKERS = 3;
var worker_list = [];

var WebSocketServer = require('ws').Server,
    wss = new WebSocketServer({
        port: 2000
    });

function myWorkerFork(num) {
    var child;
    if (num != 0) {

        for (var i = 0; i < num; i++) {
            (function (i) {
                child = execFile(state, [i]);
                console.log("spawn process "+i);
                worker_list[i] = new Object();
                worker_list[i].worker = child;
                worker_list[i].isAlive = 1;
            })(i);
        } // for

    } else {
        for (var i = 0; i < num; i++) {
            (function (i) {
                if (worker_list[i].isAlive == 0) {
                    child = execFile(state, [i]);
                    worker_list[i].worker = child;
                }
            })(i);
        } // for
    }
    return worker_list;
}

function addDataPool(message) {
    console(message.type + " add Data pool");
}

function taskDistribute() {
    var task = filter.restore();
    ws.send(task);
}

function taskKill(pid) {
    worker_list[message.pid].worker.kill();
    worker_list[message.pid].isAlive = 0;
}

function resolveMessages(message) {
    switch (message.type) {
    case "OPEN":
        taskDistribute(message.pid);
        break;
    case "GET":
        console.log("Worker:" + message.pid + " task got");
        break;
    case "END":
        taskKill(message.pid);
        break;
    case "messages":
        addDataPool(message);
        break;
    case "focus":
        addDataPool(message);
        filter.store(message.data);
        break;
    case "user":
        addDataPool(message);
        break;
    }
}

myWorkerFork(NUM_OF_WORKERS);

wss.on('connection', function connection(ws) {
    ws.on('message', function incoming(message) {
        console.log('[WEBSOCKET]Received: %s', message);
        resolveMessages(message);
        myWorkerFork(0);
    });
    //ws.send('something');
});

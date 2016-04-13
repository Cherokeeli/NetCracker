var filter = require('./tools/uidFilter');
var execFile = require('child_process').execFile;
var log4js = require('log4js');
log4js.configure({
    "appenders": [
        {
            "type": "console",
            "category": "console"
            },
        {
            "category": "log_file",
            "type": "console",
            "filename": "./log/workerEmitter.log",
            "maxLogSize": 104800,
            "backups": 100
            }
        ],
    "replaceConsole": true,
    "levels": {
        "log_file": "ALL",
        "console": "ALL",
    }
});

var state = 'casperjs'
var thread = 'mainThread.js';

var fs = require('fs');
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
                child = execFile(state, [thread, i]);
                child.stdout.on('data', function (data) {
                    console.log('PID ' + i + ':' + data);
                    //Here is where the output goes
                });
                child.stderr.on('data', function (data) {
                    console.log('PID ' + i + ':' + data);
                    //Here is where the error output goes
                });
                child.on('close', function (code) {
                    console.log('PID ' + i + ':' + code);
                    //Here you can get the exit code of the script
                });
                console.log("spawn process " + i);
                worker_list[i] = new Object();
                worker_list[i].worker = child;
                worker_list[i].isAlive = 1;
                console.log(worker_list[i].worker.pid);
            })(i);
        } // for

    } else {
        console.log("check fork");
        for (var i = 0; i < NUM_OF_WORKERS; i++) {
            (function (i) {
                if (worker_list[i].isAlive == 0) {
                    console.log("create replace worker PID:" + i);
                    child = execFile(state, [thread, i]);
                    child.stdout.on('data', function (data) {
                        console.log('PID ' + i + ':' + data);
                        //Here is where the output goes
                    });
                    child.stderr.on('data', function (data) {
                        console.log('PID ' + i + ':' + data);
                        //Here is where the error output goes
                    });
                    child.on('close', function (code) {
                        console.log('PID ' + i + ':' + code);
                        //Here you can get the exit code of the script
                    });
                    worker_list[i].worker = child;
                    worker_list[i].isAlive = 1;
                }
            })(i);
        } // for
    }
    return worker_list;
}

function addDataPool(message) {
    console.log(message.type + " add Data pool");
}

function taskDistribute(ws) {
    var task = filter.restore();
    if (task == undefined) {
        setTimeout(function(){
            taskDistribute(ws);
        }, 30000);
    } else {
        console.log("task distributed:" + task);
        ws.send(task);
    }
    //return task;
}

function taskKill(pid) {
    console.log("PID:" + pid + " killed");
    worker_list[pid].worker.kill();
    worker_list[pid].isAlive = 0;
}

function resolveMessages(message, ws) {
    switch (message.type) {
    case "OPEN":
        taskDistribute(ws);
        break;
    case "GET":
        console.log("Worker:" + message.PID + " task got");
        break;
    case "END":
        taskKill(message.PID);
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
        var parMessage = JSON.parse(message)
        console.log('[WEBSOCKET]Received: %s', message);
        resolveMessages(parMessage, ws);
        myWorkerFork(0);
    });
    //ws.send('something');
});

var filter = require('./tools/uidFilter');
var spawn = require('child_process').spawn;
var log4js = require('log4js');
var util = require('util');
const EventEmitter = require('events');
var config = require('./NetCrackerConfig');
var fs = require('fs');
var user_index = 0;

function CoolDown() {
    EventEmitter.call(this);
}
util.inherits(CoolDown, EventEmitter);

const cooldown = new CoolDown();


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

var state = 'casperjs'; //启动命令
var thread = 'mainThread.js'; //进程文件

var NUM_OF_WORKERS = config.workerNum;
var worker_list = [];
var NumOfUser = 0;

var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var url = 'mongodb://localhost:27017/' + config.dbName;


var WebSocketServer = require('ws').Server,
    wss = new WebSocketServer({
        port: config.sockPort
    });

wss.broadcast = function broadcast(data) {
    wss.clients.forEach(function each(client) {
        client.send(data);
    });
};

cooldown.on('cool.down', () => {
    if (NumOfUser % config.coolLimitUser == 0 && NumOfUser != 0) {
        wss.broadcast("COOL");
        updateCookie();
        filter.backup();
    }
});

function updateCookie() {
    spawn('casperjs', ['CookieCollector.js', user_index]);
    var len = config.userFlow.length;
    console.log("Updating cookies " +user_index);
    user_index == (len-1) ? user_index = 0 : user_index++;
}

function myWorkerFork(num) {
    var child;
    if (num != 0) {

        for (var i = 0; i < num; i++) {
            (function (i) {
                child = spawn(state, [thread, i]);
                child.stdout.on('data', function (data) {
                    console.log('WORKER ' + i + ' ' + child.pid + ':' + data);
                    //Here is where the output goes
                });
                child.stderr.on('data', function (data) {
                    console.log('WORKER ' + i + ' ' + child.pid + ':' + data);
                    //Here is where the error output goes
                });
                child.on('close', function (code) {
                    console.log('WORKER ' + i + ' ' + child.pid + ':' + code);
                    //Here you can get the exit code of the script
                });
                console.log("Spawn process " + i);
                worker_list[i] = new Object();
                worker_list[i].worker = child;
                worker_list[i].isAlive = 1;
                worker_list[i].job = [];
                console.log(worker_list[i].worker.pid);
            })(i);
        } // for

    } else {
        //console.log("check fork");
        for (var i = 0; i < NUM_OF_WORKERS; i++) {
            (function (i) {
                if (worker_list[i].isAlive == 0) {
                    console.log("Create replace worker PID:" + i);
                    child = spawn(state, [thread, i]);
                    child.stdout.on('data', function (data) {
                        console.log('WORKER ' + i + ' ' + child.pid + ':' + data);
                        //Here is where the output goes
                    });
                    child.stderr.on('data', function (data) {
                        console.log('WORKER ' + i + ' ' + child.pid + ':' + data);
                        //Here is where the error output goes
                    });
                    child.on('close', function (code) {
                        console.log('WORKER ' + i + ' ' + child.pid + ':' + code);
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

var insertDocument = function (db, message, callback) {
    if (message.type == "messages") {
        db.collection('Weibo_Messages').insert(message.data, function (err, result) {
            assert.equal(err, null);
            console.log("Inserted a document into the Weibo_Messages collection.");
            callback();
        });
    } else if (message.type == "user") {
        db.collection('User_Info').insertOne(message.data, function (err, result) {
            assert.equal(err, null);
            console.log("Inserted a document into the User_Info collection.");
            callback();
        });
    }
};

function addDataPool(message) {
    console.log(message.type + " add Data pool");
    MongoClient.connect(url, function (err, db) {
        assert.equal(null, err);
        insertDocument(db, message, function () {
            db.close();
        });
    });
}

function taskDistribute(ws) {
    var task = filter.restore();
    if (task == undefined) {
        setTimeout(function () {
            taskDistribute(ws);
        }, 30000);
    } else {
        console.log("Task distributed:" + task);
        ws.send(task);
    }
    //return task;
}

function taskKill(pid) {
    console.log("WORKER " + pid + ": killed");
    worker_list[pid].worker.kill();
    worker_list[pid].isAlive = 0;
}


function resolveMessages(message, ws) {
    switch (message.type) {
    case "OPEN":
        taskDistribute(ws);
        NumOfUser++;
        cooldown.emit('cool.down');
        break;
    case "GET":
        console.log("WORKER " + message.PID + ": task got");
        worker_list[message.PID].job.push(message.data);
        break;
    case "END":
        taskKill(message.PID);
        break;
    case "WTIMEOUT":
        filter.store(worker_list[message.PID].job);
        taskKill(message.PID);
        break;
    case "JUMPOUT":
        filter.store(worker_list[message.PID].job);
        taskKill(message.PID);
        updateCookie();
        break;
    case "MSGNONE":
        break;
    case "messages":
        addDataPool(message);
        break;
    case "focus":
        //addDataPool(message);
        filter.store(message.data);
        break;
    case "user":
        addDataPool(message);
        break;
    }
}
//cook.updateCookies();
filter.readBuff(() => {
    myWorkerFork(NUM_OF_WORKERS);
});

//setInterval(cook.updateCookies,10*(60*60*1000));
//module.exports = {
//start: function () {
wss.on('connection', function connection(ws) {
    ws.on('message', function incoming(messages) {
        var parMessage = JSON.parse(messages);
        if (util.isArray(parMessage.data)) {
            console.log('[WEBSOCKET]MASTER Received: ' + parMessage.data.length + ' ' + parMessage.type);
        } else {
            console.log('[WEBSOCKET]MASTER Received: ' + parMessage.type);
        }
        resolveMessages(parMessage, ws);
        myWorkerFork(0); //检测队列中死亡的进程重新进行激活
    });
    //ws.send('something');
});

//}//start
//}

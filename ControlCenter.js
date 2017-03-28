var filter = require('./tools/uidFilter');
var spawn = require('child_process').spawn;
var log4js = require('log4js');
var util = require('util');
//var cook = require('./CookieCollector');
const EventEmitter = require('events');
var fs = require('fs');
var ReadWriteLock = require('rwlock');
var lock = new ReadWriteLock();
var user_index = 0;
var flag_index = 0;
var total_message = 0;

function CoolDown() {
    EventEmitter.call(this);
}
util.inherits(CoolDown, EventEmitter);

const cooldown = new CoolDown();
//const statuscheck = new CoolDown();


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

var NUM_OF_WORKERS = process.argv[2] || 4;
var worker_list = [];
var task_list = [];
var NumOfUser = 1;
var pre = 0;

var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var url = 'mongodb://localhost:27017/Weibo';


var WebSocketServer = require('ws').Server,
    wss = new WebSocketServer({
        port: 2000
    });

wss.broadcast = function broadcast(data) {
    wss.clients.forEach(function each(client) {
        client.send(data);
    });
};

cooldown.on('cool.down', () => {
    if (NumOfUser % 30 == 0) {
        wss.broadcast("COOL");
        spawn('casperjs', ['CookieCollector.js', user_index]);
        user_index = user_index == 1 ? 0 : 1;
        filter.backup();
    }
});

function initTask(callback) { // initialize task queue
    for (var i = 0; i < NUM_OF_WORKERS; i++) {
        task_list[i] = i * 50;
        process.stdout.write('Initializing ' + i + ' tasks...\r');
    }
    task_list[0] = -1;
    callback();
}

function statusCheck() { //check the child process is alive or not, if not, kill and recreate

    var curTime = Date.now();
    for (var i = 0; i < NUM_OF_WORKERS; i++) {
        //console.log('Status Checking...' + i);
        if (curTime - worker_list[i].preTime >= 15000) { // if 10s no response
            taskKill(i, 0);
            myWorkerFork(0);
        }
    }
    return;
}

function messageCounter(pre) {
    //lock.readLock(function (release) { // lock task_list 
    total_message++;
    process.stdout.write('Downloading ' + total_message + ' messages... Speed: ' + (Date.now() - pre) / 1000 + 's/file... \r');
    //release();
    //});
    return Date.now();
}


function myWorkerFork(num) {
    var child;
    if (num != 0) {

        for (var i = 0; i < num; i++) {
            (function (i) {
                child = spawn(state, [thread, i]);
                child.stdout.on('data', function (data) {
                    console.log('PID ' + i + ':' + data);
                    process.stdout.write('Downloading ' + total_message + ' messages... Speed: ' + (Date.now() - pre) / 1000 + 's/file... \r');

                    //Here is where the output goes
                });
                child.stderr.on('data', function (data) {
                    console.log('PID ' + i + 'err: ' + data);
                    //Here is where the error output goes
                });
                child.on('close', function (code) {
                    console.log('PID ' + i + 'closed: ' + code);
                    //Here you can get the exit code of the script
                });
                console.log("Spawn process " + i);
                worker_list[i] = new Object();
                worker_list[i].worker = child;
                worker_list[i].isAlive = 1;
                worker_list[i].preTime = Date.now();
                //worker_list[i].job = [];
                //console.log("New worker created " + worker_list[i].worker.pid);
            })(i);
        } // for

    } else {
        //console.log("check fork");
        for (var i = 0; i < NUM_OF_WORKERS; i++) {
            (function (i) {
                if (worker_list[i].isAlive == 0) {
                    //console.log("Create replace worker PID:" + i);
                    child = spawn(state, [thread, i]);
                    child.stdout.on('data', function (data) {
                        console.log('PID ' + i + ':' + data);
                        process.stdout.write('Downloading ' + total_message + ' messages... Speed: ' + (Date.now() - pre) / 1000 + 's/file... \r');

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
                    worker_list[i].preTime = Date.now();
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
            //console.log("Inserted a document into the Weibo_Messages collection.");
            callback();
        });
    } else if (message.type == "user") {
        db.collection('User_Info').insertOne(message.data, function (err, result) {
            assert.equal(err, null);
            //console.log("Inserted a document into the User_Info collection.");
            callback();
        });
    }
};

function addDataPool(message) {
    //console.log(message.type + " add Data pool");
    MongoClient.connect(url, function (err, db) {
        assert.equal(null, err);
        insertDocument(db, message, function () {
            db.close();
        });
    });
}

function taskDistribute(ws, PID) {
    lock.readLock(function (release) { // lock task_list 
        flag_index = parseInt(task_list[0]);
        lock.writeLock(function (release) {
            // you can write here
            task_list = task_list.slice(1); // remove first element
            var new_node = parseInt(task_list[task_list.length - 1]) + 50;
            task_list.push(new_node);
            worker_list[PID].job = flag_index;
            //console.log("Task distributed:" + flag_index);
            ws.send(flag_index); // distribute task
            release();

            // everything is now released.
        });


        release();
    });

    //done();



    //flag_index += 50;

}

function taskKill(pid, status) {

    if (status) { // if normal exit
        //console.log("PID:" + pid + "normally killed");
        //total_message += 50;
        //process.stdout.write('Downloading '+total_message+' messages...\r');
    } else { // if timeout exit
        var task = worker_list[pid].job; // add unfinish task to task list
        task_list.push(task);
        //console.log("PID:" + pid + "killed with no response");
    }
    worker_list[pid].worker.kill();
    worker_list[pid].isAlive = 0;
    worker_list[pid].job = '';
}


function resolveMessages(message, ws) {
    switch (message.type) {
        case "OPEN":
            taskDistribute(ws, message.PID);
            NumOfUser++;

            //cooldown.emit('cool.down');
            break;
        case "GET":
            //console.log("Worker:" + message.PID + " task got");
            worker_list[message.PID].job = message.data;
            break;
        case "END":
            taskKill(message.PID, 1);
            break;
        case "WTIMEOUT":
            filter.store(worker_list[message.PID].job);
            taskKill(message.PID, 0);
            break;
        case "JUMPOUT":
            setTimeout(function () {
                filter.store(worker_list[message.PID].job);
                taskKill(message.PID);
            }, 5 * 60 * 1000);
            break;
        case "MSGNONE":
            break;
        case "COUNT":
            pre = messageCounter(pre);
            break;
        case "LIVE":
            worker_list[message.PID].preTime = Date.now();
            //console.log("Getting LIVE");
            break;
        case "messages":
            addDataPool(message);
            break;
        case "focus":
            //addDataPool(message);
            filter.store(message.data); //message.data:Array
            break;
        case "user":
            addDataPool(message);
            break;
    }
}
//cook.updateCookies();
//filter.readBuff();
initTask(function () {
    myWorkerFork(NUM_OF_WORKERS);

}); //init task list
setInterval(statusCheck, 5000);
//console.log(NUM_OF_WORKERS);

//setInterval(cook.updateCookies,10*(60*60*1000));
//module.exports = {
//start: function () {
wss.on('connection', function connection(ws) {
    ws.on('message', function incoming(messages) {
        //console.log('receive');
        var parMessage = JSON.parse(messages);
        if (util.isArray(parMessage.data)) {
            //console.log('[WEBSOCKET]Received: ' + parMessage.data.length + ' ' + parMessage.type);
        } else {
            //console.log('[WEBSOCKET]Received: ' + parMessage.type);
        }
        resolveMessages(parMessage, ws);
        myWorkerFork(0);
    });
    //ws.send('something');
});

    //}//start
//}

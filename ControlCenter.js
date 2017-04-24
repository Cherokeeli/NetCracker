//**************************************************************
//
//                  Master control flow
//Master process for controling worker process. Control and Distribute worker.
//************************************************************** 

var filter = require('./tools/filter');
var spawn = require('child_process').spawn;
var log4js = require('log4js');
var util = require('util');
const EventEmitter = require('events');
var fs = require('fs');
var ReadWriteLock = require('rwlock');
var lock = new ReadWriteLock(); // initialize process lock
var user_index = 0;
var flag_index = -1;
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
var dateset = [2017, 3, 14, 2017, 3, 15];
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


function statusCheck() { //check the child process is alive or not, if not, kill and recreate

    var curTime = Date.now();
    for (var i = 0; i < NUM_OF_WORKERS; i++) {
        //console.log('Status Checking...' + i);
        if (curTime - worker_list[i].preTime >= 15000) { // if 10s no response
            Task.kill(i, 0);
            //myWorkerFork(0);
            Worker.check()
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

function Dateset(set) {
    this.data = set.slice(0);
}

Dateset.prototype = {
    get: function () {
        return this.data;
    },
    next: function () {
        
        if (this.data[2] - 1 > 0) { // if day-1 not equal 0
            this.data[2]--;

        } else { // if day-1 equal 0,shift to last month
            if (this.data[1] - 1 > 0) { // if month -1 not equal 0
                this.data[1]--;
                if ([1, 3, 5, 7, 8, 10, 12].indexOf(this.data[1]) != -1) { this.data[2] = 31; }
                else {
                    if (this.data[1] == 2) { // if 2month
                        if ((this.data[0] % 100 == 0 && this.data[0] % 400 == 0) || this.data[0] % 4 == 0)
                            this.data[2] = 29;
                        else
                            this.data[2] = 28;
                    } else { // not 2month
                        this.data[2] = 30;
                    }
                }
            } else { // if month -1 ==0, shift to last year
                this.data[0]--;
                this.data[1] = 12;
                this.data[2] = 31;
            }

        }

        if (this.data[5] - 1 > 0) { // if day-1 not equal 0
            this.data[5]--;

        } else { // if day-1 equal 0,shift to last month
            if (this.data[4] - 1 > 0) { // if month -1 not equal 0
                this.data[4]--;
                if ([1, 3, 5, 7, 8, 10, 12].indexOf(this.data[4]) != -1) { this.data[5] = 31; }
                else {
                    if (this.data[4]== 2) { // if 2month
                        if ((this.data[3] % 100 == 0 && this.data[3] % 400 == 0) || this.data[3] % 4 == 0)
                            this.data[5] = 29;
                        else
                            this.data[5] = 28;
                    } else { // not 2month
                        this.data[5] = 30;
                    }
                }
            } else { // if month -1 ==0, shift to last year
                this.data[3]--;
                this.data[4] = 12;
                this.data[5] = 31;
            }

        }

        return this.data;
    }
};
var x = [2016, 4, 20, 2016, 4, 20];
//var x = [2017,3,15,2017,3,15];
var dateset = new Dateset(x);

var Task = {

    kill: function (pid, status) {

        if (!status) { // if normal exit
            //console.log("PID:" + pid + "normally killed");
            //total_message += 50;
            //process.stdout.write('Downloading '+total_message+' messages...\r');
            //} else { // if timeout exit
            var task = worker_list[pid].job; // add unfinish task to task list
            task_list.push(task);
            //console.log("PID:" + pid + "killed with no response");
        }
        worker_list[pid].worker.kill();
        worker_list[pid].isAlive = 0;
        worker_list[pid].job = '';
    },

    initialize: function (callback) {
        for (var i = 0; i < NUM_OF_WORKERS; i++) {
            task_list[i] = i * 50;
            process.stdout.write('Initializing ' + i + ' tasks...\r');
        }
        task_list[0] = -1;
        callback();
    }
}


var Worker = {
    generate: function (NUM_OF_WORKERS) { //check unworked slot in workerlist
        for (var i = 0; i < NUM_OF_WORKERS; i++) {
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
    },

    check: function () {
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
    },

    distribute: function (ws, PID) {
        lock.readLock(function (release) { // lock task_list 
            // ws.send(flag_index);
            // worker_list[PID].job = flag_index;
            // console.log("Task distributed:" + flag_index);
            //var sdata = [2017,3,14,2017,3,15];
            var sdata = dateset.get();
            console.log('distribute date ' + sdata)
            ws.send(JSON.stringify(sdata));
            lock.writeLock(function (release) {

                dateset.next();
                // you can write here
                // task_list = task_list.slice(1); // remove first element
                // var new_node = parseInt(task_list[task_list.length - 1]) + 50;
                // task_list.push(new_node);
                // worker_list[PID].job = flag_index;
                // //console.log("Task distributed:" + flag_index);
                // ws.send(flag_index); // distribute task
                release();
                // everything is now released.
            });
            release();
        });
        //done();
        //flag_index += 50;

    }
}

var Message = {
    insertDocument: function (db, message, callback) {
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
    },
    addDataPool: function (message) {

        filter.store(message, (ok, err) => {
            if (err) console.log(err);
            if (ok) {
                console.log("Store SUCCESSFULLY");
                pre = messageCounter(pre);
            } else {
                console.log("Finding duplicated item!");
            }
        })

    },

    addMongoDB: function (message) {
        console.log(message.type + " add Data pool");
        MongoClient.connect(url, function (err, db) {
            assert.equal(null, err);
            insertDocument(db, message, function () {
                db.close();
            });
        });
    }
}

function resolveMessages(message, ws) {
    switch (message.type) {
        case "OPEN":
            Worker.distribute(ws, message.PID);
            NumOfUser++;

            //cooldown.emit('cool.down');
            break;
        case "GET":
            //console.log("Worker:" + message.PID + " task got");
            worker_list[message.PID].get = message.data;
            break;
        case "END":
            console.log("getting end");
            Task.kill(message.PID, 1);
            Worker.check();
            break;
        case "WTIMEOUT":
            //filter.store(worker_list[message.PID].job);
            Task.kill(message.PID, 0);
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
        case "MESSAGE":
            Message.addDataPool(message.data);
            break;
        case "ERR":
            break;
    }
}
//cook.updateCookies();
//filter.readBuff();
Task.initialize(() => Worker.generate(NUM_OF_WORKERS)); //You should initiailize task first then worker

setInterval(statusCheck, 5000); // initialize the worker status checker
//console.log(NUM_OF_WORKERS);

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
        Worker.check();
    });
});

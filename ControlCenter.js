var filter = require('./tools/uidFilter');
var exec = require('child_process');
const cluster = require('cluster'); //负载均衡模块
var numCPUs = require('os').cpus().length;

var NUM_OF_WORKERS = 10;


if (cluster.isWorker) { //如果是子进程
    var WebSocketServer = require('ws').Server,
        wss = new WebSocketServer({
            port: 2000
        });

    wss.on('connection', function connection(ws) {
        ws.on('message', function incoming(message) {
            console.log('received: %s', message);
        });
        //ws.send('something');
    });
}

if (cluster.isMaster) { //如果是主进程
    for (var i = 0; i < numCPUs; i++) {
        cluster.fork();
    } //创建子进程

    cluster.on('death', function (worker) {
        console.log('worker ' + worker.pid + ' died');
        cluster.fork();
    }); //监听子进程死亡再重新生成
}

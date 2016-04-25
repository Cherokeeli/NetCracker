function getNowTime() {
    var date = new Date();
    var d = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
    console.log(d);
    return d;
}


exports.configure = function (casper) {


    casper.on('scroll.timeout', function (NumOfLoaded) {
        var now = casper.evaluate(getNowTime);
        this.echo("Scroll Timeout,get " + NumOfLoaded + " items");
        this.capture('./data/scrollTimeout ' + now + '.png');
    });

    casper.on('waitselector.timeout', function (self_PID) {
        var now = casper.evaluate(getNowTime);
        this.echo("Wait for selector timeout");
        this.wait(2000, function () {
            this.capture('./data/waitSelectorTimeout ' + now + '.png');
        });
        socket.sendWs(0, "WTIMEOUT", self_PID);

    });

    casper.on('url.jumpout', function (self_PID) {
        var now = casper.evaluate(getNowTime);
        this.echo("URL check incorrect,waiting");
        this.wait(2000, function () {
            this.capture('./data/URLjumpout ' + now + '.png');
        });

        socket.sendWs(0, "JUMPOUT", self_PID);
    });

    casper.on('message.none', function (self_PID) {
        socket.sendWs(0, "MSGNONE", self_PID);
        this.echo("Receive Msg length zero");
    });

    casper.on("remote.message", function (msg) {
        this.echo("Console: " + msg);
    });

    //    casper.on("page.error", function (msg, trace) {
    //        this.echo("Error: " + msg);
    //    });

    //    casper.on("resource.error", function (resourceError) {
    //        this.echo("ResourceError: " + JSON.stringify(resourceError, undefined, 4));
    //    });

    // http://docs.casperjs.org/en/latest/events-filters.html#page-initialized
    casper.on("page.initialized", function (page) {
        page.onResourceTimeout = function (request) {
            console.log('Response Timeout (#' + request.id + '): ' + JSON.stringify(request));
        };
    });
}

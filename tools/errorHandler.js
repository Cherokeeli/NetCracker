var SRCOLL_NUM = 0;
var PreOfLoaded = 0;

exports.configure = function (casper) {
    casper.on('scroll.timeout', function (NumOfLoaded) {
        if (SRCOLL_NUM <= 4) {
            if (PreOfLoaded == NumOfLoaded)
                SRCOLL_NUM++;
            this.echo("Scroll Timeout,reScroll");
            PreOfLoaded = NumOfLoaded;
            tryAndScroll(casper);
        } else {
            this.echo("Scroll Timeout,reScroll times maxinum");
            SRCOLL_NUM = 0;
            PreOfLoaded = 0;
        }
    });

    casper.on('waitselector.timeout', function (self_PID) {
        socket.sendWs(0, "WTIMEOUT", self_PID);
        this.echo("Wait for selector timeout");
        this.capture('./data/waitSelectorTimeout.png');

    });

    casper.on('url.jumpout', function (self_PID) {
        socket.sendWs(0, "JUMPOUT", self_PID);
        this.echo("URL check incorrect,waiting");
    });

    casper.on('message.none',function (self_PID) {
        socket.sendWs(0, "MSGNONE", self_PID);
        this.echo("Receive Msg length zero");
    });
}

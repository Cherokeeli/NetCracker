var casper = require("casper").create({
    pageSettings: {
        loadImages: false,
        loadPlugins: false,
        userAgent: 'Mozilla/5.0 (iPhone; U; CPU iPhone OS 4_3_3 like Mac OS X; en-us) AppleWebKit/533.17.9 (KHTML, like Gecko) Version/5.0.2 Mobile/8J2 Safari/6533.18.5',
        webSecurityEnabled: false
    },
    verbose: true,
    logLevel: "debug"
});

casper.on("page.error", function (msg, trace) {
    this.echo("Error: " + msg);
});

casper.on("resource.error", function (resourceError) {
    this.echo("ResourceError: " + JSON.stringify(resourceError, undefined, 4));
});

// http://docs.casperjs.org/en/latest/events-filters.html#page-initialized
casper.on("page.initialized", function (page) {
    page.onResourceTimeout = function (request) {
        console.log('Response Timeout (#' + request.id + '): ' + JSON.stringify(request));
    };
});

function getInnerHTML(selector) {
    var nodes = document.querySelectorAll(selector);
    return Array.prototype.map.call(nodes, function (e) {
        return e.innerHTML;
    });
}

function getAttriValue(selector, attribute) {
    var nodes = document.querySelectorAll(selector);
    return Array.prototype.map.call(nodes, function (e) {
        return e.getAttribute(attribute);
    });
}

//function pageChanger() {
//
//}

function torrentDownload(url, call) {
    var number = url.split('ref=');
    casper.echo(number[1]);
    casper.then(function () {
        this.download('http://www.jandown.com/fetch.php', './movie/' + call + '.torrent', 'POST', {
            code: number[1]
        });
    });
}

function previewDownload(urls, call, callback) {
    var images;
    var load_torrent;
    casper.thenOpen(urls, function () {
        this.echo(call);
        images = casper.evaluate(getAttriValue, 'div#read_tpc.tpc_content img', 'src');
        load_torrent = casper.evaluate(getAttriValue, 'div#read_tpc.tpc_content a', 'href');
        //callback(download);
    }).then(function () {
        if (images.length > 0) {
            for (var x in images) {
                this.download(images[x], './movie/' + call + x + '.jpg');
            }
        }

        if (load_torrent.length >= 1) {
            for (var x in load_torrent) {
                if (load_torrent[x].indexOf('jandown') && load_torrent[x] != undefined) {
                    callback(load_torrent[x], call);
                    //break;
                }
            }

        } else {
            callback(0);
        }
    });
}

function startCollect() {
    casper.start('http://ac88.info/bt/thread.php?fid=16&page=1', function () {
        this.wait(3000, function () {
            this.capture('./pic.png');
        }).then(function () {
            var indexs = casper.evaluate(getAttriValue, 'tr.tr3.t_one h3 a', 'href');
            var names = casper.evaluate(getInnerHTML, 'tr.tr3.t_one h3 a font');
            for (var x in names) {
                this.echo(names[x]);
                this.echo(names.length);
            }
            for (var i = 0; i < indexs.length; i++) {
                var urls = 'http://ac88.info/bt/' + indexs[i];
                var call = String(names[i]).replace(/\//g, ' ');

                //var urls = 'http://ac88.info/bt/htm_data/16/1605/841036.html';
                previewDownload(urls, call, function (url, call) {
                    if (url != 0) {
                        torrentDownload(url, call);
                    } else {
                        return;
                    }
                });
                //torrentDownload('http://www.jandown.com/link.php?ref=b44mJv7R7p');
            }
        })
    }).run(function () {
        this.echo("Completed");
    });
}

startCollect()


//**************************************************************
//
//                  DOM getter function 
//
//************************************************************** 

function getInnerHTMLs(selector) { //s
    try {
        var nodes = document.querySelectorAll(selector);
    } catch (err) {
        console.log(err);
    }

    console.log(nodes.length);
    return Array.prototype.map.call(nodes, function (e) {
        return e.innerHTML;
    });
}

function getInnerHTML(selector) {
    try {
        var node = document.querySelector(selector);
    } catch (err) {
        console.log(err);
    }

    return node.innerHTML;

}

function getAttriValues(selector, attribute) { //s
    try {
        var nodes = document.querySelectorAll(selector);
    } catch (err) {
        console.log(err);
    }
    console.log(nodes.length);
    return Array.prototype.map.call(nodes, function (e) {
        return e.getAttribute(attribute);
    });
}

function getAttriValue(selector, attribute) {
    try {
        var node = document.querySelector(selector);
    } catch (err) {
        console.log(err);
    }
    node.getAttribute(attribute);
}

//**************************************************************
//
//                 internal casper function 
//
//************************************************************** 

//var pageURL = 'http://libwisenews.wisers.net.lib-ezproxy.hkbu.edu.hk/wisenews/content.do?wp_dispatch=menu-content&menu-id=/commons/CFT-HK/DA000-DA003-DA010-/DA000-DA003-DA010-65107-&cp&cp_s=0&cp_e=50';
var baseURL = 'http://libwisenews.wisers.net.lib-ezproxy.hkbu.edu.hk'

var getHref = function (casper, callback) { //get message href
    var hrefs = [];
    hrefs = casper.evaluate(getAttriValues, 'tr.ClipItemRow td:nth-child(3) a', 'href');
    callback(hrefs);
}

var extractMessages = function (casper, callback) { //extract information
    var message = {};
    message.pubName = casper.evaluate(getInnerHTML, 'td.pubName');
    message.headline = casper.evaluate(getInnerHTML, 'td.headline');
    message.content = casper.evaluate(getInnerHTML, 'td.content');
    message.content = message.content.replace(/\r?\n|\r/g, "");
    var temp = casper.evaluate(getInnerHTML, 'td.info~td.info');
    temp = temp.slice(6).split('<br>'); //cut &nbsp and divide time and author by <br>
    message.time = temp[1];
    //casper.echo("time: "+message.time);
    message.author = temp[0];
    //casper.echo("author: "+message.author);
    callback(JSON.stringify(message));
}

var getRandomWait = function (casper, min, max) {
    var time = 1000 * Math.random() * (max - min) + min;
    casper.wait(time);
}

//**************************************************************
//
//                 external casper function 
//
//************************************************************** 

var pageProcessing = function (pageURL, casper) {
    casper.thenOpen(pageURL, function () {
        this.echo('Pageing in: ' + pageURL);
        getHref(casper, function (href) {
            //casper.echo(href[0]);
            for (var i = 0; i < href.length; i++) {
                var url = baseURL + href[i];
                (function (i, url) {
                    
                    //casper.echo("url: " + href[i]);
                    casper.thenOpen(url, function () {
                        this.echo("getting in: " + url);
                    }).wait(3000, function () {
                        this.capture('./data/getttingPage'+self_PID+'.png')
                        extractMessages(casper, function (msg) {
                            var dd = msg.replace(/<\/?.+?>/g, "");
                            casper.echo(dd);
                        });
                    })
                })(i, url); //closure
            } //for
        });
    })
}
exports.pageProcessing = pageProcessing;

var configSetting = function (casper) {
    var url = 'http://libwisenews.wisers.net.lib-ezproxy.hkbu.edu.hk/wisenews/content.do?wp_dispatch=menu-content&srp_save&menu-id=/commons/CFT-HK/DA000-DA003-DA010-/DA000-DA003-DA010-65107-'
    casper.thenOpen(url, function () {
    }).waitForSelector('#FilterFromMonth', function () {
        this.capture('./data/setting1.png');
        this.evaluate(function () {
            document.querySelector('select#FilterFromMonth').selectedIndex = 1;
        }); //select past one month data
    }).thenClick('#FilterBar > button', function () {
        this.capture('./data/setting2.png');
    })
}
exports.configSetting = configSetting;

var login = function (USER, PASS, casper) //wisenews login
{

    if (!cookies.checkCookies()) {
        casper.waitForSelector('.content_text', function () {
            casper.capture('./data/newslogin.png'); //网页打开页面截图
            casper.echo(this.getTitle());
        }).then(function () {
            casper.capture('./data/new2.png');
            casper.fillSelectors('form', {
                'input[name="user"]': USER,
                'input[name="pass"]': PASS
            }, true); //filling the form and submit

            casper.capture('./data/newsfilling.png');
        });

        casper.wait(2000, function () {
            casper.echo(casper.getCurrentUrl()); //登录成功标志
            casper.capture("./data/login.png");
            cookies.displayCookies();
            cookies.saveCookies();
        });
    } else {
        casper.reload(function () {
            //casper.echo('reload!');
            casper.wait(3000, function () {
                casper.capture('./data/reload.png');
            });

        });
    }
    //return true;
} //caspWeibo.login
exports.login = login;
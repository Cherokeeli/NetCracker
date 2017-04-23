
//**************************************************************
//
//                  DOM getter function 
//function should be called in evaluate(), which is run on the page 
//environment, mainly for extracting content
//************************************************************** 

function getCurrentInfosNum(selector) {
    var n = document.querySelectorAll(selector).length;
    return n.length;
} //getCurrentInfosNum

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
//Internl casper based function which is called by module function
//************************************************************** 

//var pageURL = 'http://libwisenews.wisers.net.lib-ezproxy.hkbu.edu.hk/wisenews/content.do?wp_dispatch=menu-content&menu-id=/commons/CFT-HK/DA000-DA003-DA010-/DA000-DA003-DA010-65107-&cp&cp_s=0&cp_e=50';
var baseURL = 'http://libwisenews.wisers.net.lib-ezproxy.hkbu.edu.hk';
var retry = 5;

var getHref = function (casper, callback) { //get message href
    var hrefs = [];
    hrefs = casper.evaluate(getAttriValues, 'tr.ClipItemRow td:nth-child(3) a', 'href');
    callback(hrefs);
}

var extractMessages = function (casper, callback) { //extract information
    var message = {};
    var re = /\^\d+\(/g;
    var temp_id = re.exec(casper.getCurrentUrl())
    message.id = temp_id[0];
    message.pubName = casper.evaluate(getInnerHTML, 'td.pubName');
    message.pubName = message.pubName.replace(/<\/?.+?>/g, "").replace(/[\'\"\\\/\b\f\n\r\t&nbsp;]/g, '').trim();
    message.headline = casper.evaluate(getInnerHTML, 'td.headline');
    message.headline = message.headline.replace(/<\/?.+?>/g, "").replace(/[\'\"\\\/\b\f\n\r\t&nbsp;]/g, '').trim();
    message.content = casper.evaluate(getInnerHTML, 'td.content');
    message.content = message.content.replace(/<\/?.+?>/g, "").replace(/[\'\"\\\/\b\f\n\r\t&nbsp;]/g, '').trim();
    var temp = casper.evaluate(getInnerHTML, 'td.info~td.info');
    temp = temp.slice(6).split('<br>'); //cut &nbsp and divide time and author by <br>
    message.time = temp[1];
    //casper.echo("time: "+message.time);
    message.author = temp[0];
    //casper.echo("author: "+message.author);
    callback(JSON.stringify(messasetting3ge));
}

var getRandomWait = function (casper, min, max) {
    var time = 1000 * Math.random() * (max - min) + min;
    casper.wait(time);
}

var openMessagePage = function (url, casper) { //open message page function attach reconnect
    return casper.thenOpen(url, function () {
        this.echo("getting in: " + url);
        casper.waitFor(function check() {
            return this.exists('.content');
        }, function success() {
            extractMessages(casper, function (msg) {
                var dd = msg.replace(/<\/?.+?>/g, ""); //delete html tag
                fs.write('./data/result101.json', dd + ',', 'a+');
                //casper.emit('thread.send',dd);
                casper.echo(dd);
                casper.capture('./data/fail'+self_PID+'.png');
            });
        }, function onFail() {
            this.echo('FAILED to getting in '+url+' Reconnecting...');
            openMessagePage(url, casper);
        }, 6000)
    });
}


//**************************************************************
//
//                 external casper function 
//Casper-based function, mainly exports to worker process to control work flow
//************************************************************** 

var pageProcessing = function (pageURL, casper) {
    return casper.thenOpen(pageURL, function () {
        this.echo('Pageing in: ' + pageURL);
        casper.emit('thread.check');
        casper.waitFor(function check() {
            this.capture('./data/setting3.png')
            //this.echo("")
            //return this.evaluate(getCurrentInfosNum,'.ClipItemRow') >= 50;
            return this.exists('.ClipItemRow');
        }, function success() {
            this.capture('./data/page'+self_PID+'.png');
            this.echo('Current URL is'+this.getCurrentUrl());
            getHref(casper, function (href) {
                //casper.echo(href[0]);
                for (var i = 0; i < href.length; i++) {
                    var url = baseURL + href[i];
                    (function (i, url) {
                        //casper.echo("url: " + href[i]);
                        
                        casper.wait(4000, function() {
                            casper.emit('thread.check');
                            openMessagePage(url, casper);
                            casper.emit('thread.tasksfinished');
                        });
                        casper.capture('./data/fail'+self_PID+'.png');
                    })(i, url); //closure
                } //for
            });
        }, function onFail() {     
                this.echo('FAILED to Pageing in '+pageURL+' Reconnecting...');
                this.capture('./data/fail'+self_PID+'.png');
                pageProcessing(pageURL, casper);
        }, 6000);
    });
}
exports.pageProcessing = pageProcessing;

var configSetting = function (casper) {
    var url = 'http://libwisenews.wisers.net.lib-ezproxy.hkbu.edu.hk/wisenews/content.do?wp_dispatch=menu-content&srp_save&menu-id=/commons/CFT-HK/DA000-DA003-DA010-/DA000-DA003-DA010-65107-'
    return casper.thenOpen(url, function () {
        casper.emit('thread.check');
    }).waitFor(function check() {
        //this.capture('./data/setting1.png');
        return casper.exists('#FilterFromDay');
    }, function success() {
        casper.evaluate(function () {
            document.querySelector('select#FilterFromYear').selectedIndex = 15;// set 2015
            document.querySelector('select#FilterFromDay').selectedIndex = 14;  // from day
            document.querySelector('select#FilterFromMonth').selectedIndex = 2;
            document.querySelector('select#FilterToDay').selectedIndex = 14; //to day
            document.querySelector('select#FilterToMonth').selectedIndex = 2;
            this.capture('./data/setting2.png');
        }); //select past one month data
    },function onTimeout() {
        if (retry) {
            this.echo("Timeout when connect" + url + ' Need Reconnecting...');
            configSetting(casper);
            retry--; // infinite retry time or count times
        } else {
            casper.emit('thread.retrytimeout');
        }
        
    }, 10000).thenClick('#FilterBar > button', function () {
        //this.capture('./data/setting2.png');
    })
}
exports.configSetting = configSetting;

var login = function (USER, PASS, casper) //wisenews login
{

    if (!cookies.checkCookies()) {
        casper.waitForSelector('.content_text', function () {
            //casper.capture('./data/newslogin.png'); //网页打开页面截图
            casper.echo(this.getTitle());
        }).then(function () {
            //casper.capture('./data/new2.png');
            casper.fillSelectors('form', {
                'input[name="user"]': USER,
                'input[name="pass"]': PASS
            }, true); //filling the form and submit

            //casper.capture('./data/newsfilling.png');
        });

        casper.wait(2000, function () {
            casper.echo(casper.getCurrentUrl()); //登录成功标志
            //casper.capture("./data/login.png");
            cookies.displayCookies();
            //cookies.saveCookies();
        });
    } else {
        casper.reload(function () {
            //casper.echo('reload!');
            casper.wait(3000, function () {
                //casper.capture('./data/reload.png');
            });

        });
    }
    //return true;
} //caspWeibo.login
exports.login = login;
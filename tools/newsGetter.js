
var getMsg = function (userID, casper, callback) {
    callback(1)
}

var configSetting = function (casper) {
    var url = 'http://libwisenews.wisers.net.lib-ezproxy.hkbu.edu.hk/wisenews/content.do?wp_dispatch=menu-content&srp_save&menu-id=/commons/CFT-HK/DA000-DA003-DA010-/DA000-DA003-DA010-65107-'
    casper.thenOpen(url,function() { 
    }).then(function() {
        this.capture('./data/setting1.png');
        this.evaluate(function() {
            document.querySelector('select#FilterFromMonth').selectedIndex = 1;
        }); //select past one month data
    }).thenClick('#FilterBar > button',function() {      
            this.capture('./data/setting2.png');      
    }).thenOpen(url, function() { //open filter result in whole broswer frame
        this.wait(2000, function() {
            this.capture('./data/result.png')
        });
    });
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
            }, true);

            casper.capture('./data/newsfilling.png');
            //casper.click(x('#tab-page-1 > form > p > table > tbody > tr:nth-child(4) > td > a')); //点击登录按钮
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
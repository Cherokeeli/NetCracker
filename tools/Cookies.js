//*****************************
//cookies模块
//*****************************
//var path='./data/cookies.txt';
//var fs = require('fs');
var displayCookies = function () //显示当前cookies
    {
        console.log('---------------------------------------------------------------');
        var cookies = phantom.cookies;
        for (var i = 0, len = cookies.length; i < len; i++) {
            console.log(cookies[i].name + ': ' + cookies[i].value);
        }
        console.log('---------------------------------------------------------------');
    } 

var checkCookies = function () {

    if (fs.exists('./data/cookies.txt')) {
        try {
            var data = fs.read('./data/cookies.txt');
            phantom.cookies = JSON.parse(data);
        } catch (err) {
            console.log(err);
        }
    } else {
        return false;
    }
    return true;
}

var saveCookies = function () {
    var cookies = JSON.stringify(phantom.cookies);
    fs.write('./data/cookies.txt', cookies, 644);
    return true;
}

exports.checkCookies = checkCookies;
exports.saveCookies = saveCookies;
exports.displayCookies = displayCookies;
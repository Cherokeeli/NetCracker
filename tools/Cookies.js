//*****************************
//cookies模块
//*****************************
//var path='./data/cookies.txt';
//var fs = require('fs');
var checkCookies = function() {

    if(fs.exists('./data/cookies.txt')) {
        try {
        var data = fs.read('./data/cookies.txt');
        phantom.cookies = JSON.parse(data); }
        catch(err) {
            console.log(err);
        }
    } else {
        return false;
    }
    return true;
}

var saveCookies = function() {
    var cookies = JSON.stringify(phantom.cookies); fs.write('./data/cookies.txt', cookies, 644);
    return true;
}

exports.checkCookies = checkCookies;
exports.saveCookies = saveCookies;

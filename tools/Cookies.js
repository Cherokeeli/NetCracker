//**************************************************************
//
//                      Cookies module
//Mainly for handling cookie like store and check.
//************************************************************** 

module.exports = {
    displayCookies: function () //显示当前cookies
    {
        console.log('---------------------------------------------------------------');
        var cookies = phantom.cookies;
        for (var i = 0, len = cookies.length; i < len; i++) {
            console.log(cookies[i].name + ': ' + cookies[i].value);
        }
        console.log('---------------------------------------------------------------');
    },

    checkCookies: function () {

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
    },

    saveCookies: function () {
        var cookies = JSON.stringify(phantom.cookies);
        fs.write('./data/cookies.txt', cookies, 644);
        return true;
    }
}
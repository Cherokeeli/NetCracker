var uid_set = ['5894256487'];
var cann_restore= [0];

module.exports = {
    restore: function() {
        console.log("restore!!");
        var length = uid_set.length;
        for(var i = 0; i < length; i++) {
            if(!cann_restore[i]) {
                cann_restore[i] = 1;
                return uid_set[i];
            }
        }

    },

    store: function(msg) {
        var length = msg.length;
        Array.prototype.push.apply(uid_set, msg);
        for(var i = 0; i < length; i++)
            cann_restore.push(0);
        //var zeroArray = new Int8Array(length);
        //console.log(zeroArray);
        //cann_restore.push(zeroArray);
        console.log("push into pool");
        console.log("now pool is");
        console.log(cann_restore);
    }
}

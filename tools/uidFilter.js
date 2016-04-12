var uid_set = ['5894256487','5428286619','5622122976','5684434457'];
var cann_restore= [0,0,0,0];

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
        uid_set.push(msg);
        var zeroArray = new Int8Array(length);
        cann_restore.push(zeroArray);
        console.log("push into pool");
        console.log("now pool is");
        for(var i = 0; i < uid_set.length; i++)
            console.log(uid_set[i]+",");
    }
}

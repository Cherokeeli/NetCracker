var uid_set = ['5894256487', '5745465725', '1914100420', '1553184325', '2138405303'];
var cann_restore = [0, 0, 0, 0, 0];
var fs = require('fs');
var bf = require("./bloomfilter"),
    BloomFilter = bf.BloomFilter,
    fnv_1a = bf.fnv_1a,
    fnv_1a_b = bf.fnv_1a_b;
var bloom = new BloomFilter(
  32 * 256, // number of bits to allocate.
  16        // number of hash functions.
);


module.exports = {
    restore: function () {
        console.log("restore!!");
        var length = uid_set.length;
        for (var i = 0; i < length; i++) {
            if (!cann_restore[i]) {
                cann_restore[i] = 1;
                return uid_set[i];
            }
        }

    },

    store: function (msg) {
        var length = msg.length;
        for (var x in msg) {
            if(bloom.test(msg[x])) {
                bloom.add(msg[x]);
                uid_set.push(msg[x]);
                cann_restore.push(0);
            } else {
                console.log("UID exist");
                return false;
            }
        }
        //Array.prototype.push.apply(uid_set, msg); //合并两个数组
        return true;
    },

    backup: function () {
        fs.writeFile('./data/uid_set.json', JSON.stringify(uid_set), 'utf8', (err) => {
            if (err) throw err;
            console.log('It\'s saved!');
        });
    },

    readBuff: function (callback) {
        fs.readFile('./data/uid_set.json', 'utf8', (err, data) => {
            if (err) throw err;
            if (data.length != 0)
                uid_set = JSON.parse(data);
            //console.log(uid_set);
            for (var x in uid_set)
                bloom.add(uid_set[x]);
        });
        callback();
    }
}

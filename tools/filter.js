//**************************************************************
//
//                      Filter module
//Mainly for handling retriving data filtering and store.
//************************************************************** 
var fs = require('fs');
var bf = require("./bloomfilter"),
    BloomFilter = bf.BloomFilter,
    fnv_1a = bf.fnv_1a,
    fnv_1a_b = bf.fnv_1a_b;
var bloom = new BloomFilter(
    32 * 256, // number of bits to allocate.
    16 // number of hash functions.
); // bloom filter

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
        Array.prototype.push.apply(uid_set, msg); //合并两个数组
        for (var i = 0; i < length; i++)
            cann_restore.push(0);
    },

    backup: function () {
        fs.writeFile('./data/uid_set.json',JSON.stringify(uid_set),'utf8',(err) => {
            if (err) throw err;
            console.log('It\'s saved!');
        });
    },

    readBuff: function () {
        fs.readFile('./data/uid_set.json', 'utf8',(err, data) => {
            if (err) throw err;
            if (data.length!=0)
            uid_set = data;
            console.log(data);
        });
    }
}

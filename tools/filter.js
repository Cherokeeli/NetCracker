//**************************************************************
//
//                      Filter module
//Mainly for handling retriving data filtering and store.
//************************************************************** 
var fs = require('fs');
var bf = require("../lib//bloomfilter"),
    BloomFilter = bf.BloomFilter,
    fnv_1a = bf.fnv_1a,
    fnv_1a_b = bf.fnv_1a_b;
var bloom = new BloomFilter( //initialize bloom filter
    32 * 256, // number of bits to allocate.
    16 // number of hash functions.
); // bloom filter
module.exports = {
    store: function (msg,callback) {
        if (!bloom.test(msg.id)) {
            bloom.add(msg.id);
            fs.writeFile('./data/result101.json',JSON.stringify(msg)+',','utf8','a+',(err) => {
                if (err) return callback(err);
                //console.log("Store in cache successfully");
                callback(true);
            });
        }
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

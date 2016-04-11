var uid_set=[];

module.exports = {
    restore: function() {
        var length = uid_set.length;
        return uid_set[length];
    },

    store: function(msg) {
        uid.push(msg);
    }
}

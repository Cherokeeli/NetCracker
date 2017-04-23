function Dateset(set) {
    this.data = set.slice(0);
}

Dateset.prototype = {
    get: function () {
        return this.data;
    },
    next: function () {
        console.log('list function')
        console.log(this.data[1])
        if (this.data[1] - 1 > 0) {
            this.data[1]-=1;

        } else {
            this.data[0]-=1;
            this.data[1] = 11;
        }

        if (this.data[4] - 1 > 0) {
            this.data[4]-=1;
        } else {
            this.data[3]-=1;
            this.data[4] = 11;
        }
        return this.data;
    }
};
var x = [2017, 2, 15, 2017, 3, 15];
var dateset = new Dateset(x);
console.log(dateset.next());
console.log(dateset.next());
console.log(dateset.next());
console.log(dateset.next());
console.log(dateset.next());
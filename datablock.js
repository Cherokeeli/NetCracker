function Dateset(set) {
    this.data = set.slice(0);
}

Dateset.prototype = {
    get: function () {
        return this.data;
    },
    next: function () {
        
        if (this.data[2] - 1 > 0) { // if day-1 not equal 0
            this.data[2]--;

        } else { // if day-1 equal 0,shift to last month
            if (this.data[1] - 1 > 0) { // if month -1 not equal 0
                this.data[1]--;
                if ([1, 3, 5, 7, 8, 10, 12].indexOf(this.data[1]) != -1) { this.data[2] = 31; }
                else {
                    if (this.data[1] == 2) { // if 2month
                        if ((this.data[0] % 100 == 0 && this.data[0] % 400 == 0) || this.data[0] % 4 == 0)
                            this.data[2] = 29;
                        else
                            this.data[2] = 28;
                    } else { // not 2month
                        this.data[2] = 30;
                    }
                }
            } else { // if month -1 ==0, shift to last year
                this.data[0]--;
                this.data[1] = 12;
                this.data[2] = 31;
            }

        }

        if (this.data[5] - 1 > 0) { // if day-1 not equal 0
            this.data[5]--;

        } else { // if day-1 equal 0,shift to last month
            if (this.data[4] - 1 > 0) { // if month -1 not equal 0
                this.data[4]--;
                if ([1, 3, 5, 7, 8, 10, 12].indexOf(this.data[4]) != -1) { this.data[5] = 31; }
                else {
                    if (this.data[4]== 2) { // if 2month
                        if ((this.data[3] % 100 == 0 && this.data[3] % 400 == 0) || this.data[3] % 4 == 0)
                            this.data[5] = 29;
                        else
                            this.data[5] = 28;
                    } else { // not 2month
                        this.data[5] = 30;
                    }
                }
            } else { // if month -1 ==0, shift to last year
                this.data[3]--;
                this.data[4] = 12;
                this.data[5] = 31;
            }

        }

        return this.data;
    }
};
var x = [2017, 3, 15, 2017, 3, 15];
//var x = [2017,3,15,2017,3,15];
var dateset = new Dateset(x);
console.log(dateset.get())
for(var i = 0; i < 300; i++) {
    console.log(dateset.next());
}
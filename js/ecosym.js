

class ContinuousExponential {
    b = 0.11
    d = 0.1
    N0 = 100

    constructor() {
        this.r = this.b - this.d
    }

    population(t) {
        return this.N0*Math.exp(this.r*t)
    }

    doublingTime() {
        return Math.log(2)/this.r
    }
}


$(document).ready(function() {
    'use strict'
})

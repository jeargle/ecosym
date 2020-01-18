

const range = (start, stop, step = 1) =>
      Array(Math.ceil((stop - start) / step)).fill(start).map((x, y) => x + y * step)


class Continuous {
    b = 0.11
    d = 0.1
    N0 = 100
    r = Math.log(2)

    constructor() {
    }

    population(t) {
        return this.N0
    }

    applyToTimespan(timespan) {
        return timespan.map((t) => this.population(t))
    }

    doublingTime() {
        return Math.log(2)/this.r
    }
}


class Discrete {
    b = 0.11
    d = 0.1
    N0 = 100

    constructor() {
        this.r = this.b - this.d
    }

    population(t) {
        return
    }

    applyToTimespan(timespan) {
        return timespan.map((t) => this.population(t))
    }

    doublingTime() {
        return Math.log(2)/this.r
    }
}


class ContinuousExponential extends Continuous {
    b = 0.11
    d = 0.1
    N0 = 100

    constructor() {
        super()
        this.r = this.b - this.d
    }

    population(t) {
        return this.N0*Math.exp(this.r*t)
    }
}


class DiscreteExponential {
    b = 0.11
    d = 0.1
    N0 = 100

    constructor() {
        this.r = this.b - this.d
    }

    population(t) {
        return
    }

    applyToTimespan(timespan) {
        return timespan.map((t) => this.population(t))
    }

    doublingTime() {
        return Math.log(2)/this.r
    }
}

class EnvironmentalStochasticity {
    b = 0.11
    d = 0.1
    N0 = 100

    constructor() {
        this.r = this.b - this.d
    }

    population(t) {
        return
    }

    applyToTimespan(timespan) {
        return timespan.map((t) => this.population(t))
    }

    doublingTime() {
        return Math.log(2)/this.r
    }
}


class DemographicStochasticity {
    b = 0.11
    d = 0.1
    N0 = 100

    constructor() {
        this.r = this.b - this.d
    }

    population(t) {
        return
    }

    applyToTimespan(timespan) {
        return timespan.map((t) => this.population(t))
    }

    doublingTime() {
        return Math.log(2)/this.r
    }
}




$(document).ready(function() {
    'use strict'
})

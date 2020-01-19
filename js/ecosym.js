

const range = (start, stop, step = 1) =>
      Array(Math.ceil((stop - start) / step)).fill(start).map((x, y) => x + y * step)


/**
 * Abstract continuous model.
 */
class Continuous {
    b = 0.11   // birth rate
    d = 0.1    // death rate
    N0 = 100   // population size at time 0
    r = Math.log(2)   // instantaneous rate of increase

    constructor() {
    }

    /**
     * population at time t
     * @param t {number} - time
     * @return {number}
     */
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


/**
 * Abstract discrete model.
 */
class Discrete {
    b = 0.11
    d = 0.1
    N0 = 100
    rd = null   // discrete growth factor
    lambda = null   // finite rate of increase

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


/**
 * Continuous exponential model
 * assumptions:
 *   constant birth and death rates
 *   no genetic structure
 *   no age or size structure
 *   continuous growth with no time lags
 */
class ContinuousExponential extends Continuous {
    // b = 0.11   // birth rate
    // d = 0.1    // death rate
    // N0 = 100   // population size at time 0
    // r = null   // instantaneous rate of increase

    constructor() {
        super()
        this.r = this.b - this.d
    }

    population(t) {
        return this.N0*Math.exp(this.r*t)
    }
}


/**
 * Discrete exponential model
 * assumptions:
 *   constant birth and death rates
 *   non-overlapping generations
 *   no age or size structure
 *   discrete growth with no time lags
 */
class DiscreteExponential {
    // b = 0.11
    // d = 0.1
    // N0 = 100
    // rd = null
    // lambda = null

    constructor() {
        super()
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

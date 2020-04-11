

const range = (start, stop, step = 1) =>
      Array(Math.ceil((stop - start) / step)).fill(start).map((x, y) => x + y * step)

/**
 * Gaussian distribution sample using Box-Muller transform
 */
const randGaussian = (mean=0.0, stdev=1.0) => {
    let r1 = 0, r2 = 0
    while (r1 === 0) r1 = Math.random()  // Converting [0,1) to (0,1)
    while (r2 === 0) r2 = Math.random()
    return mean + Math.sqrt( -2.0 * Math.log( r1 ) ) * Math.cos( 2.0 * Math.PI * r2 ) * stdev
}


/**
 * Abstract continuous-time model.
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
}


/**
 * Abstract discrete-time model.
 */
class Discrete {
    b = 0.11
    d = 0.1
    N0 = 100
    rd = null   // discrete growth factor
    lambda = null   // finite rate of increase

    constructor() {
    }

    population(t) {
        return this.N0
    }

    applyToTimespan(timespan) {
        return timespan.map((t) => this.population(t))
    }
}


/**
 * Continuous exponential model
 * assumptions:
 *   constant birth and death rates
 *   no genetic structure
 *   no age or size structure
 *   continuous-time growth with no time lags
 */
class ContinuousExponential extends Continuous {

    constructor() {
        super()
        this.r = this.b - this.d
    }

    /**
     * population at time t
     * @param t {number} - time
     * @return {number}
     */
    population(t) {
        return this.N0*Math.exp(this.r*t)
    }

    doublingTime() {
        return Math.log(2)/this.r
    }
}


/**
 * Discrete exponential model
 * assumptions:
 *   constant birth and death rates
 *   non-overlapping generations
 *   no age or size structure
 *   discrete-time growth with no time lags
 */
class DiscreteExponential extends Discrete {

    constructor() {
        super()
        this.r = this.b - this.d
        this.lambda = this.r + 1
    }

    /**
     * population at time t
     * @param t {number} - time
     * @return {number}
     */
    population(t) {
        return this.N0 * this.lambda**t
    }

    doublingTime() {
        return Math.log(2)/this.r
    }
}


/**
 * Environment stochasticity model
 * assumptions:
 *   birth and death rates fluctuate about mean
 *   non-overlapping generations
 *   no age or size structure
 *   discrete-time growth with no time lags
 */
class EnvironmentalStochasticity extends Discrete {
    b = 0.11
    d = 0.1
    N0 = 100
    rMean = 0.01
    rStdev = 0.05

    constructor(rMean=0.01, rStdev=0.05) {
        super()
        this.rMean = rMean
        this.rStdev = rStdev
    }

    /**
     * population based on growth since previous timestep
     * @param prevPop {number} - previous population count
     * @param timestep {number} - amount of time passed
     * @return {number} - next population count
     */
    populationNext(prevPop, timestep) {
        let model = this
        let rRand = randGaussian(model.rMean, model.rStdev)
        return prevPop + prevPop * rRand * timestep
    }

    applyToTimespan(timespan) {
        let model = this
        let popSpan = new Array(timespan.length).fill(0)
        popSpan[0] = model.N0

        let timestep = 0
        if (timespan.length > 1) {
            timestep = timespan[1] - timespan[0]
        }
        for (let i=1; i<timespan.length; i++) {
            popSpan[i] = model.populationNext(popSpan[i-1], timestep)
        }

        return popSpan
    }
}


/**
 * Demographic stochasticity model
 * assumptions:
 *   probabilistic birth and death events
 *   non-overlapping generations
 *   no age or size structure
 *   discrete-time growth with no time lags
 */
class DemographicStochasticity extends Discrete {
    b = 0.11
    d = 0.1
    N0 = 100

    constructor() {
        super()
        this.r = this.b - this.d
        this.eventRate = this.b + this.d
    }

    /**
     * population based on growth since previous timestep
     * @param prevPop {number} - previous population count
     * @param timestep {number} - amount of time passed
     * @return {number} - next population count
     */
    populationNext(prevPop, timestep) {
        let model = this
        let rRand = randGaussian(model.rMean, model.rStdev)
        let floatEvents = model.eventRate * prevPop * timestep
        let numEvents = Math.floor(floatEvents)
        let eventRemainder = floatEvents - numEvents
        numEvents += Math.random() < eventRemainder ? 1 : 0
        let nextPop = prevPop
        let birthProbability = model.b / model.eventRate
        let eventString = ''

        for (let i=0; i<numEvents; i++) {
            if (Math.random() < birthProbability) {
                nextPop += 1
                eventString += 'B'
            } else {
                nextPop -= 1
                eventString += 'D'
            }
        }
        console.log('events: ' + eventString)

        return nextPop
    }

    applyToTimespan(timespan) {
        let model = this
        let popSpan = new Array(timespan.length).fill(0)
        popSpan[0] = model.N0

        let timestep = 0
        if (timespan.length > 1) {
            timestep = timespan[1] - timespan[0]
        }
        for (let i=1; i<timespan.length; i++) {
            popSpan[i] = model.populationNext(popSpan[i-1], timestep)
        }

        return popSpan
    }
}

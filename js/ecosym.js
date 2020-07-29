

/**
 * Build Array of numbers evenly spaced across a range
 * @param start {number} - starting point (included)
 * @param stop {number} - stopping pint (not included)
 * @param step {number} - time; default 1
 * @return {Array[number]}
 */
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
    // b = 0.11   // birth rate
    // d = 0.1    // death rate
    // N0 = 100   // population size at time 0
    // r = Math.log(2)   // instantaneous rate of increase

    constructor(N0=100, b=0.11, d=0.1) {
        this.N0 = N0
        this.b = b
        this.d = d
        this.r = this.b - this.d
    }

    /**
     * Population at time t
     * @param t {number} - time
     * @return {number}
     */
    population(t) {
        return this.N0
    }

    /**
     * Calculate population at all points in a timespan
     * @param timespan {Array[number]} - array of timepoints
     * @return {Array[number]} - array of population counts
     */
    applyToTimespan(timespan) {
        return timespan.map((t) => this.population(t))
    }
}


/**
 * Abstract discrete-time model.
 */
class Discrete {
    // b = 0.11   // birth rate
    // d = 0.1    // death rate
    // N0 = 100   // population size at time 0
    // r = null   // discrete growth factor
    // lambda = null   // finite rate of increase

    constructor(N0=100, b=0.11, d=0.1) {
        this.N0 = N0
        this.b = b
        this.d = d
        this.r = this.b - this.d
        this.lambda = this.r + 1
    }

    /**
     * Population based on growth since previous timestep
     * @param prevPop {number} - previous population count
     * @param timestep {number} - amount of time passed
     * @return {number} - next population count
     */
    populationNext(prevPop, timestep) {
        return prevPop
    }

    /**
     * Calculate population at all points in a timespan
     * @param timespan {Array[number]} - array of timepoints
     * @return {Array[number]} - array of population counts
     */
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
 * Continuous exponential model
 * assumptions:
 *   constant birth and death rates
 *   no genetic structure
 *   no age or size structure
 *   continuous-time growth with no time lags
 */
class ContinuousExponential extends Continuous {

    constructor(N0=100, b=0.11, d=0.1) {
        super(N0, b, d)
    }

    population(t) {
        return this.N0*Math.exp(this.r*t)
    }

    doublingTime() {
        return Math.log(2)/this.r
    }

    parameters() {
        return [
            { name: 'N0', value: this.N0 },
            { name: 'b', value: this.b },
            { name: 'd', value: this.d }
        ]
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

    constructor(N0=100, b=0.11, d=0.1) {
        super(N0, b, d)
    }

    population(t) {
        return this.N0 * this.lambda**t
    }

    applyToTimespan(timespan) {
        return timespan.map((t) => this.population(t))
    }

    doublingTime() {
        return Math.log(2)/this.r
    }

    parameters() {
        return [
            { name: 'N0', value: this.N0 },
            { name: 'b', value: this.b },
            { name: 'd', value: this.d }
        ]
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
    // rMean = 0.01    // mean growth rate
    // rStdev = 0.05   // standard deviation of growth rate

    constructor(rMean=0.01, rStdev=0.05, N0=100, b=0.11, d=0.1) {
        super(N0, b, d)
        this.rMean = rMean
        this.rStdev = rStdev
    }

    populationNext(prevPop, timestep) {
        let model = this
        let rRand = randGaussian(model.rMean, model.rStdev)
        return prevPop + prevPop * rRand * timestep
    }
}


/**
 * Demographic stochasticity model
 * assumptions:
 *   stochastic, discrete birth and death events
 *   non-overlapping generations
 *   no age or size structure
 *   discrete-time growth with no time lags
 */
class DemographicStochasticity extends Discrete {

    constructor(rMean=0.01, rStdev=0.05, N0=100, b=0.11, d=0.1) {
        super(N0, b, d)
        this.rMean = rMean
        this.rStdev = rStdev
        this.eventRate = this.b + this.d
    }

    populationNext(prevPop, timestep) {
        let model = this
        // let rRand = randGaussian(model.rMean, model.rStdev)
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
}


/**
 * Continuous logistic model
 * assumptions:
 *   density dependent birth (b') and death (d') rates
 *   no genetic structure
 *   no age or size structure
 *   continuous-time growth with no time lags
 */
class ContinuousLogistic extends Continuous {
    // K = 150    // carrying capacity K = (b - d) / (a + c)

    constructor(K=150, N0=100, b=0.11, d=0.1) {
        super(N0, b, d)
        this.K = K
    }

    population(t) {
        return this.K / (1 + ((this.K-this.N0)/this.N0) * Math.exp(-this.r*t))
    }
}

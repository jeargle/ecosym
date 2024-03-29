

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


const mean = (valList) => valList.reduce((x, y) => x+y) / valList.length


/**
 * Abstract continuous-time model
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
        this.refresh()
    }

    refresh() {
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

    parameters() {
        return [
            { name: 'N0', value: this.N0 },
            { name: 'b', value: this.b },
            { name: 'd', value: this.d }
        ]
    }

    clone() {
        return new Continuous(this.N0, this.b, this.d)
    }
}


/**
 * Abstract discrete-time model
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
        this.refresh()
    }

    refresh() {
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

    parameters() {
        return [
            { name: 'N0', value: this.N0 },
            { name: 'b', value: this.b },
            { name: 'd', value: this.d }
        ]
    }

    clone() {
        return new Discrete(this.N0, this.b, this.d)
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

    clone() {
        return new ContinuousExponential(this.N0, this.b, this.d)
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

    clone() {
        return new DiscreteExponential(this.N0, this.b, this.d)
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

    constructor(rMean=0.01, rStdev=0.05, N0=100, b=0.11, d=0.1) {
        super(N0, b, d)
        this.rMean = rMean
        this.rStdev = rStdev
    }

    populationNext(prevPop, timestep) {
        let model = this
        const rRand = randGaussian(model.rMean, model.rStdev)
        const nextPop = prevPop + prevPop * rRand * timestep

        return nextPop > 0 ? nextPop : 0
    }

    parameters() {
        return [
            { name: 'N0', value: this.N0 },
            { name: 'b', value: this.b },
            { name: 'd', value: this.d },
            { name: 'rMean', value: this.rMean },
            { name: 'rStdev', value: this.rStdev }
        ]
    }

    clone() {
        return new EnvironmentalStochasticity(
            this.rMean, this.rStdev, this.N0, this.b, this.d
        )
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
    }

    populationNext(prevPop, timestep) {
        // TODO - check model specifications.  looks like rMean and rStdev
        // are not being used here.
        let model = this
        // let rRand = randGaussian(model.rMean, model.rStdev)
        const eventRate = model.b + model.d
        let floatEvents = eventRate * prevPop * timestep
        let numEvents = Math.floor(floatEvents)
        const eventRemainder = floatEvents - numEvents
        numEvents += Math.random() < eventRemainder ? 1 : 0
        let nextPop = prevPop
        let birthProbability = model.b / eventRate
        let eventString = ''

        let births = 0
        let deaths = 0
        for (let i=0; i<numEvents; i++) {
            if (Math.random() < birthProbability) {
                nextPop += 1
                eventString += 'B'
                births += 1
            } else {
                nextPop -= 1
                eventString += 'D'
                deaths += 1
            }
        }
        // console.log('events: ' + eventString)
        console.log('  births: ' + births)
        console.log('  deaths: ' + deaths)

        return nextPop > 0 ? nextPop : 0
    }

    parameters() {
        return [
            { name: 'N0', value: this.N0 },
            { name: 'b', value: this.b },
            { name: 'd', value: this.d },
            { name: 'rMean', value: this.rMean },
            { name: 'rStdev', value: this.rStdev }
        ]
    }

    clone() {
        return new DemographicStochasticity(
            this.rMean, this.rStdev, this.N0, this.b, this.d
        )
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

    constructor(K=150, N0=100, b=0.11, d=0.1) {
        super(N0, b, d)
        this.K = K
    }

    population(t) {
        return this.K / ( 1 + ( (this.K-this.N0) / this.N0 ) * Math.exp(-this.r*t) )
    }

    clone() {
        return new ContinuousLogistic(
            this.K, this.N0, this.b, this.d
        )
    }
}


/**
 * Continuous logistic model with stochastic carrying capacity
 * assumptions:
 *   density dependent birth (b') and death (d') rates
 *   no genetic structure
 *   no age or size structure
 *   continuous-time growth with no time lags
 *   stochastic carrying capacity
 */
class StochasticCapacity extends Continuous {

    extinct = false

    constructor(Kmean=150, Kstdev=10, N0=100, b=0.11, d=0.1) {
        super(N0, b, d)
        this.Kmean = Kmean
        this.Kstdev = Kstdev
        this.K = []
    }

    carryingCapacity(t) {
        return randGaussian(this.Kmean, this.Kstdev)
    }

    population(t) {
        if (this.extinct) {
            return 0
        }

        let K = this.carryingCapacity(t)
        this.K.push(K)

        let pop = K / ( 1 + ( (K-this.N0) / this.N0 ) * Math.exp(-this.r*t) )
        if (pop < 0) {
            pop = 0
            this.extinct = true
        }

        return pop
    }

    /**
     * Calculate population at all points in a timespan
     * @param timespan {Array[number]} - array of timepoints
     * @return {Array[number]} - array of population counts
     */
    applyToTimespan(timespan) {
        this.K = []
        this.extinct = false
        return super.applyToTimespan(timespan)
    }

    parameters() {
        return [
            { name: 'N0', value: this.N0 },
            { name: 'b', value: this.b },
            { name: 'd', value: this.d },
            { name: 'Kmean', value: this.Kmean },
            { name: 'Kstdev', value: this.Kstdev }
        ]
    }

    clone() {
        return new StochasticCapacity(
            this.Kmean, this.Kstdev, this.N0, this.b, this.d
        )
    }
}


/**
 * Continuous logistic model with periodic carrying capacity
 * assumptions:
 *   density dependent birth (b') and death (d') rates
 *   no genetic structure
 *   no age or size structure
 *   continuous-time growth with no time lags
 *   periodic carrying capacity
 */
class PeriodicCapacity extends Continuous {

    extinct = false

    constructor(Kmean=150, Kamp=20, Klen=80, N0=100, b=0.11, d=0.1) {
        super(N0, b, d)

        this.Kmean = Kmean  // mean carrying capacity
        this.Kamp = Kamp    // amplitude of carrying capacity change
        this.Klen = Klen    // wavelength of carrying capacity change
        this.K = []
    }

    carryingCapacity(t) {
        return this.Kmean + this.Kamp * ( Math.cos(2.0*Math.PI*t / this.Klen) )
    }

    population(t) {
        if (this.extinct) {
            return 0
        }

        let K = this.carryingCapacity(t)
        this.K.push(K)

        let pop = K / ( 1 + ( (K-this.N0) / this.N0 ) * Math.exp(-this.r*t) )
        if (pop < 0) {
            pop = 0
            this.extinct = true
        }

        return pop
    }

    /**
     * Calculate population at all points in a timespan
     * @param timespan {Array[number]} - array of timepoints
     * @return {Array[number]} - array of population counts
     */
    applyToTimespan(timespan) {
        this.K = []
        this.extinct = false
        return super.applyToTimespan(timespan)
    }

    parameters() {
        return [
            { name: 'N0', value: this.N0 },
            { name: 'b', value: this.b },
            { name: 'd', value: this.d },
            { name: 'Kmean', value: this.Kmean },
            { name: 'Kamp', value: this.Kamp },
            { name: 'Klen', value: this.Klen }
        ]
    }

    clone() {
        return new PeriodicCapacity(
            this.Kmean, this.Kamp, this.Klen, this.N0, this.b, this.d
        )
    }
}


/**
 * Discrete logistic model
 * assumptions:
 *   discrete birth and death events
 *   density dependent birth (b') and death (d') rates
 *   non-overlapping generations
 *   no age or size structure
 *   discrete-time growth with no time lags
 */
class DiscreteLogistic extends Discrete {

    constructor(K=150, N0=100, b=0.11, d=0.1) {
        super(N0, b, d)
        this.K = K
    }

    populationNext(prevPop, timestep) {
        const nextPop = prevPop + this.r * prevPop * (1.0 - prevPop/this.K)
        return nextPop > 0 ? nextPop : 0
    }

    parameters() {
        return [
            { name: 'N0', value: this.N0 },
            { name: 'b', value: this.b },
            { name: 'd', value: this.d },
            { name: 'K', value: this.K }
        ]
    }

    clone() {
        return new DiscreteLogistic(
            this.K, this.N0, this.b, this.d
        )
    }
}


/**
 * LifeTable
 * Hold initial and calculated data about different age categories for
 * a species.
 */
class LifeTable {

    constructor() {
    }
}


/**
 * LeslieMatrix
 * Transition probability matrix between different life stages.
 */
class LeslieMatrix {

    constructor() {
    }
}

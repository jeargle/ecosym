/* JSLint */
/*global console: false, ecosym: false, extend: false*/

var test = test || {}

test.testRange = function() {
    'use strict'

    console.log('\n\n***** range Test *****\n')
    console.log('range(0, 10): ' + range(0, 10))
    console.log('range(0, 10, 2): ' + range(0, 10, 2))
    console.log('range(1, 10, 2): ' + range(1, 10, 2))
    console.log('range(0, 100, 10): ' + range(0, 100, 10))
}


test.testContinuousExponential = function() {
    'use strict'

    console.log('\n\n***** ContinuousExponential Test *****\n')

    let ce1 = new ContinuousExponential()
    let times1 = range(0, 101, 10)
    times1.forEach(t => {
        console.log('population(' + t + '): ' + ce1.population(t))
    })
    console.log('\n')
    console.log('doublingTime(): ' + ce1.doublingTime())
}


test.testDiscreteExponential = function() {
    'use strict'

    console.log('\n\n***** DiscreteExponential Test *****\n')

    let de1 = new DiscreteExponential()
    let times1 = range(0, 101, 10)
    times1.forEach(t => {
        console.log('population(' + t + '): ' + de1.population(t))
    })
    console.log('\n')
    console.log('doublingTime(): ' + de1.doublingTime())

}


test.testEnvironmentalStochasticity = function() {
    'use strict'

    console.log('\n\n***** EnvironmentalStochasticity Test *****\n')

    let es1 = new EnvironmentalStochasticity()
    let times1 = range(0, 31)
    let popSpan1 = es1.applyToTimespan(times1)
    for (let i=0; i<times1.length; i++) {
        console.log('population(' + times1[i] + '): ' + popSpan1[i])
    }
    console.log('\n')
}


test.testDemographicStochasticity = function() {
    'use strict'

    console.log('\n\n***** DemographicStochasticity Test *****\n')

    let ds1 = new DemographicStochasticity()
    let times1 = range(0, 31)
    let popSpan1 = ds1.applyToTimespan(times1)
    for (let i=0; i<times1.length; i++) {
        console.log('population(' + times1[i] + '): ' + popSpan1[i])
    }
    console.log('\n')
}


test.testContinuousLogistic = function() {
    'use strict'

    console.log('\n\n***** ContinuousLogistic Test *****\n')

    let cl1 = new ContinuousLogistic()
    let times1 = range(0, 501, 20)
    let popSpan1 = cl1.applyToTimespan(times1)
    for (let i=0; i<times1.length; i++) {
        console.log('population(' + times1[i] + '): ' + popSpan1[i])
    }
    console.log('\n')

    let cl2 = new ContinuousLogistic(150, 200)
    let times2 = range(0, 501, 20)
    let popSpan2 = cl2.applyToTimespan(times2)
    for (let i=0; i<times2.length; i++) {
        console.log('population(' + times2[i] + '): ' + popSpan2[i])
    }
    console.log('\n')
}


test.testDiscreteLogistic = function() {
    'use strict'

    console.log('\n\n***** DiscreteLogistic Test *****\n')

    let dl1 = new DiscreteLogistic()
    let times1 = range(0, 501, 20)
    let popSpan1 = dl1.applyToTimespan(times1)
    for (let i=0; i<times1.length; i++) {
        console.log('population(' + times1[i] + '): ' + popSpan1[i])
    }
    console.log('\n')

    let K = 500
    let N0 = 200
    let b = 3.52   // 2.8, 3.25, 3.52
    let d = 1.0
    let dl2 = new DiscreteLogistic(K, N0, b, d)
    let times2 = range(0, 501, 20)
    let popSpan2 = dl2.applyToTimespan(times2)
    for (let i=0; i<times2.length; i++) {
        console.log('population(' + times2[i] + '): ' + popSpan2[i])
    }
    console.log('\n')
}


test.testRange()
test.testContinuousExponential()
test.testDiscreteExponential()
test.testEnvironmentalStochasticity()
test.testDemographicStochasticity()
test.testContinuousLogistic()
test.testDiscreteLogistic()

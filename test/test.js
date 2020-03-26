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


test.testRange()
test.testContinuousExponential()
test.testDiscreteExponential()

/* JSLint */
/*global console: false, ecosym: false, extend: false*/


/**
 * Abstract continuous-time model.
 */
class Plotter {
    plotId = 'plot'
    ecoModel = null   // ecosym model
    timespan = []     // set of timepoints (x-axis)

    constructor(plotId='plot', ecoModel=null, timespan=[]) {
        this.plotId = plotId
        this.ecoModel = ecoModel
        this.timespan = timespan
    }

    /**
     * Set ecosym model
     * @param ecoModel {Object} - ecosym model
     */
    setEcoModel(ecoModel) {
        this.ecoModel = ecoModel
    }

    /**
     * Set timespan
     * @param timespan {array}
     */
    setTimespan(timespan) {
        this.timespan = timespan
    }

    /**
     * Plot the ecosym model
     */
    plot() {
        let model = this
        let plotDiv = document.getElementById(model.plotId)
        let population = model.ecoModel.applyToTimespan(model.timespan)
        Plotly.newPlot(
            plotDiv,
            [{x: model.timespan, y: population}],
            {margin: { t: 0 } }
        )
    }

}


$(document).ready(function() {
    'use strict'

    let plotter1 = new Plotter(
        'plot',
        new ContinuousExponential(),
        range(0, 201, 20)
    )
    plotter1.plot()
})

/* JSLint */
/*global console: false, ecosym: false, extend: false*/


/**
 * ModelRow
 */
class ModelRow {
    el = null
    model = null
    plotter = null

    constructor(model, list) {
        if (model == null) {
            console.error('model required')
            // model = new Polynomial([0, 1])
        }
        this.model = model
        this.list = list
    }

    setEl(el) {
        this.el = el
    }

    render() {
        let view = this

        let terms = this.el.selectAll('span')
            .data(view.model.coeffs)
        terms.enter()
            .append('div')
            .classed('term', true)
            .each(function(d, i) {
                // view.addTerm.apply(view, [this, d, i])
            })
        terms.exit().remove()
    }

    /**
     * Add editable term to model display
     * @param span {span} - span element
     * @param coeff {number} - coefficient for this term
     * @param idx {number} - index into coefficient list
     */
    // addTerm(span, coeff, idx) {
    //     let view = this
    //     let term = d3.select(span)
    //     if (idx > 0) {
    //         term.append('div')
    //             .classed('term-sign', true)
    //             .text('+')
    //     }
    //     term.append('input')
    //         .classed('term-coefficient', true)
    //         .property('type', 'text')
    //         .property('value', coeff)
    //         .on('blur', function() {
    //             view.model.setCoeff(this.value, idx)
    //             view.list.plot()
    //         })
    //         .on('keydown', function (d, e) {
    //             if (d3.event.code == 'Enter') {
    //                 // Enter key pressed
    //                 $(this).blur()
    //             }
    //         })
    //     term.append('div')
    //         .classed('term-order', true)
    //         .text('x')
    //         .append('sup')
    //         .text(parseInt(idx))
    // }
}


/**
 * ModelList
 */
class ModelList {
    elId = '#model-list'
    el = null
    rows = null
    plotter = null

    constructor(models=[], elId) {
        this.rows = []
        for (let i=0; i<models.length; i++) {
            this.rows.push(new ModelRow(models[i], this))
        }
        if (elId != null) {
            this.elId = elId
        }
        this.el = d3.select(this.elId)

        this.plotter = new Plotter(
            'plot',
            this.rows.map(r => r.model),
            range(-5, 5.5, 0.5)
        )

        this.render()
    }

    render() {
        let view = this
        let ul = view.el.selectAll('#models')
        let li = ul.selectAll('li')
            .data(view.rows)
        li.enter()
            .append('li')
            .each(function(d) {
                view.addRow.apply(view, [this, d])
            })
        li.exit().remove()
        // li.order()

        view.plot()
    }

    plot() {
        this.plotter.plot()
    }

    /**
     * Add Model to list
     * @param model {Model}
     * @param idx {number} - index into model list
     */
    addRow(li, row) {
        let view = this

        let rowLi = d3.select(li)
            .append('div')
            .classed('model-row', true)
        row.setEl(rowLi)
        row.render()
    }

    /**
     * Add Model to list
     * @param model {Model}
     * @param idx {number} - index into model list
     */
    addModel(model, idx) {
        let view = this

        view.render()
    }

    /**
     * Remove Model from list
     * @param idx {number} - index into model list
     */
    removeModel(idx) {
        let view = this

        view.render()
    }

    /**
     * Remove all Models from list
     */
    clear() {
        let view = this

        view.render()
    }
}


/**
 * Plotter
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

    // let ml = new ModelList([
    //     new Model([0, 1, 4]),
    //     new Model([0, 1, 2, 1])
    // ])
})

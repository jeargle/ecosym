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
        console.log('ModelRow.render()')
        let view = this

        console.log(view.model.parameters())

        let params = this.el.selectAll('span')
            .data(view.model.parameters())
        params.enter()
            .append('div')
            .classed('term', true)
            .each(function(d, i) {
                // console.log(d)
                // console.log(i)
                view.addParam.apply(view, [this, d, i])
            })
        params.exit().remove()
    }

    /**
     * Add editable param to model display
     * @param span {span} - span element
     * @param param {number} - parameter data
     * @param idx {number} - index into parameter list
     */
    addParam(span, param, idx) {
        let view = this
        let paramSpan = d3.select(span)
        // if (idx > 0) {
        paramSpan.append('div')
            .classed('term-sign', true)
            .text(param.name + ':')
        // }
        paramSpan.append('input')
            .classed('term-coefficient', true)
            .property('type', 'text')
            .property('value', param.value)
            .on('blur', function() {
                // view.model.setCoeff(this.value, idx)
                view.list.plot()
            })
            .on('keydown', function (d, e) {
                if (d3.event.code == 'Enter') {
                    // Enter key pressed
                    $(this).blur()
                }
            })
        // paramSpan.append('div')
        //     .classed('term-order', true)
        //     .text('x')
        //     .append('sup')
        //     .text(parseInt(idx))
    }
}


/**
 * ModelList
 */
class ModelList {
    elId = '#model-list'
    el = null
    rows = null
    plotter = null

    constructor(models=[], timespan, elId) {
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
            // range(-5, 5.5, 0.5)
            timespan
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
    ecoModels = []   // ecosym models
    timespan = []     // set of timepoints (x-axis)

    constructor(plotId='plot', ecoModels=[], timespan=[]) {
        this.plotId = plotId
        this.ecoModels = ecoModels
        this.timespan = timespan
    }

    /**
     * Set ecosym model
     * @param ecoModel {Object} - ecosym model
     */
    // setEcoModel(ecoModel) {
    //     this.ecoModel = ecoModel
    // }

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
        let populations = []

        for (let i=0; i<model.ecoModels.length; i++) {
            populations.push({
                x: model.timespan,
                y: model.ecoModels[i].applyToTimespan(model.timespan)
            })
        }

        Plotly.newPlot(
            plotDiv,
            populations,
            { margin: { t: 0 } }
        )
    }

}


$(document).ready(function() {
    'use strict'

    // let plotter1 = new Plotter(
    //     'plot',
    //     [new ContinuousExponential(100, 0.11, 0.1),
    //      new ContinuousExponential(50, 0.115, 0.1),
    //      new DiscreteExponential(100, 0.11, 0.1),
    //      new DiscreteExponential(50, 0.115, 0.1)],
    //     range(0, 201, 20)
    // )
    // plotter1.plot()

    let ml = new ModelList(
        [new ContinuousExponential(100, 0.11, 0.1),
         new ContinuousExponential(50, 0.115, 0.1),
         new DiscreteExponential(100, 0.11, 0.1),
         new DiscreteExponential(50, 0.115, 0.1)],
        range(0, 201, 20)
    )
})

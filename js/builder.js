/* JSLint */
/*global console: false, ecosym: false, extend: false*/


/**
 * ModelRow
 */
class ModelRow {
    el = null
    model = null
    plotter = null
    active = true
    id = 0

    constructor(model, list, id) {
        if (model == null) {
            console.error('model required')
            // model = new Polynomial([0, 1])
        }
        this.model = model
        this.list = list
        this.id = id
    }

    setEl(el) {
        this.el = el
    }

    updateActive() {
        let view = this
        view.active = view.el.select('.row-active-checkbox')
            .property('checked')
        view.list.plot()
    }

    remove() {
        console.log('ModelRow.remove()')
        let view = this

        view.list.removeModel(view)
        view.list.plot()
    }

    render() {
        console.log('ModelRow.render()')
        let view = this

        let equation = this.el.append('div')
            .classed('row-equation', true)

        let params = equation.selectAll('span')
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

        let controls = this.el.append('div')
            .classed('row-controls', true)

        // Delete button
        controls.append('button')
            .classed('row-delete', true)
            .on('click', view.remove.bind(view))
            .text('Delete')

        // Checkbox to activate plot
        controls.append('div')
            .classed('row-active', true)
            .append('input')
            .classed('row-active-checkbox', true)
            .property('type', 'checkbox')
            .property('checked', view.active)
            .on('change', view.updateActive.bind(view))
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

        paramSpan.append('div')
            .classed('term-sign', true)
            .text(param.name + ':')

        paramSpan.append('input')
            .classed('term-coefficient', true)
            .property('type', 'text')
            .property('value', param.value)
            .on('blur', function() {
                view.list.plot()
            })
            .on('keydown', function (d, e) {
                if (d3.event.code == 'Enter') {
                    // Enter key pressed
                    $(this).blur()
                }
            })
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
    idSequence = 1
    timespan = null

    constructor(models=[], timespan, elId) {
        this.rows = []

        for (let i=0; i<models.length; i++) {
            this.rows.push(new ModelRow(models[i], this, 'model-row-' + this.idSequence))
            this.idSequence++
        }

        if (elId != null) {
            this.elId = elId
        }
        this.el = d3.select(this.elId)
        this.timespan = timespan

        this.plotter = new Plotter(
            'plot',
            this.rows,
            this.timespan
        )

        this.render()
    }

    render() {
        let view = this
        let ul = view.el.selectAll('#models')
        let li = ul.selectAll('li')
            .data(view.rows, function(d, i) {
                return d.id;
            });
        li.enter()
            .append('li')
            .each(function(d) {
                view.addRow.apply(view, [this, d])
            })
        li.exit().remove()
        li.order()

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
            .attr('id', row.id)
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

        view.plotter.setEcoModels(view.rows)
        view.render()
    }

    /**
     * Remove Model from list
     * @param idx {number} - index into model list
     */
    removeModel(model) {
        let view = this

        for (let i=0; i<view.rows.length; i++) {
            if (model.id == view.rows[i].id) {
                view.rows.splice(i, 1)
                break
            }
        }

        view.plotter.setEcoModels(view.rows)
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
    ecoModels = []   // ModelRows
    timespan = []    // set of timepoints (x-axis)
    colors = [       // default Plotly colors
        'rgb(31, 119, 180)',
        'rgb(255, 127, 14)',
        'rgb(44, 160, 44)',
        'rgb(214, 39, 40)',
        'rgb(148, 103, 189)',
        'rgb(140, 86, 75)',
        'rgb(227, 119, 194)',
        'rgb(127, 127, 127)',
        'rgb(188, 189, 34)',
        'rgb(23, 190, 207)'
    ]

    constructor(plotId='plot', ecoModels=[], timespan=[]) {
        this.plotId = plotId
        this.ecoModels = ecoModels
        this.timespan = timespan
    }

    /**
     * Set ecosym model
     * @param ecoModels {Array} - array of ecosym models
     */
    setEcoModels(ecoModels) {
        this.ecoModels = ecoModels
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
        let populations = []

        // console.log(model.ecoModels)

        for (let i=0; i<model.ecoModels.length; i++) {
            if (model.ecoModels[i].active) {
                populations.push({
                    x: model.timespan,
                    y: model.ecoModels[i].model.applyToTimespan(model.timespan),
                    line: { color: model.colors[i] }
                })
            }
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

    let ml = new ModelList(
        [new ContinuousExponential(100, 0.11, 0.1),
         new ContinuousExponential(50, 0.115, 0.1),
         new DiscreteExponential(100, 0.11, 0.1),
         new DiscreteExponential(50, 0.115, 0.1)],
        range(0, 201, 20)
    )
})

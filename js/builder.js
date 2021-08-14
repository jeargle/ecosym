/* JSLint */
/*global console: false, ecosym: false, extend: false*/


/**
 * ControlBar
 * This div sits above the ModelList and hold controls for adding new
 * ModelRows.
 */
class ControlBar {
    elId = '#control-bar'
    el = null
    modelTypes = null
    modelList = null
    rowTypeMenu = null
    rowButton = null
    rowsActiveCheckbox = null

    constructor(modelTypes, modelList) {
        let view = this

        if (modelTypes == null) {
            console.error('modelTypes required')
        }
        view.modelTypes = modelTypes

        if (modelList == null) {
            console.error('modelList required')
        }
        view.modelList = modelList

        view.el = d3.select(view.elId)

        view.rowTypeMenu = view.el.select('#row-type-menu')
        let rowTypes = view.rowTypeMenu.selectAll('option')
            .data(view.modelTypes)
        rowTypes.enter()
            .append('option')
            .each(function(d) {
                d3.select(this)
                    .property('value', d.name)
                    .text(d.name)
            })
            .property('value', )
        rowTypes.exit().remove()

        view.rowButton = view.el.select('#add-row-btn')
            .on('click', view.addModelRow.bind(view))

        view.rowsActiveCheckbox = view.el.select('#rows-active-checkbox')
            .on('change', view.setModelsActive.bind(view))
    }

    /**
     * Add a new ModelRow with the selected type to the ModelList.
     */
    addModelRow() {
        // console.log('ControlBar.addRow()')
        let view = this

        let modelName = view.rowTypeMenu.property('value')
        let modelType = view.modelTypes.find(mt => mt.name == modelName)
        let modelRow = new modelType.modelClass()

        view.modelList.addModel(modelRow)
    }

    /**
     * Set all Models either active or inactive
     */
    setModelsActive()  {
        let view = this
        // console.log('ControlBar.setModelsActive()')
        view.modelList.setModelsActive(view.rowsActiveCheckbox.property('checked'))
    }
}


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
        }
        this.model = model
        this.list = list
        this.id = id
    }

    setEl(el) {
        this.el = el
    }

    /**
     * Set active status and checkbox.
     * @param active {boolean} - whether to activate or deactivate
     */
    setActive(active=true) {
        console.log('ModelRow.setActive()')
        let view = this
        view.el.select('.row-active-checkbox')
            .property('checked', active)
        view.active = active
    }

    /**
     * Update active status based on checkbox and replot.
     */
    updateActive() {
        // console.log('ModelRow.updateActive()')
        let view = this
        view.active = view.el.select('.row-active-checkbox')
            .property('checked')

        let allActive = true
        let allInactive = true
        let activeCheckboxes = d3.selectAll('.row-active-checkbox')
            .each((checkbox) => {
                if (checkbox.active) {
                    allInactive = false
                } else {
                    allActive = false
                }
            })

        // Update rows-active-checkbox in ControlBar
        let rowsActiveCheckbox = d3.select('#rows-active-checkbox')
        if (allActive) {
            rowsActiveCheckbox.property('checked', true)
            rowsActiveCheckbox.property('indeterminate', false)
        } else if (allInactive) {
            rowsActiveCheckbox.property('checked', false)
            rowsActiveCheckbox.property('indeterminate', false)
        } else {
            rowsActiveCheckbox.property('checked', false)
            rowsActiveCheckbox.property('indeterminate', true)
        }
        view.list.plot()
    }

    /**
     * Remove model from the list.
     */
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
                view.model[param.name] = parseFloat(d3.select(this).property('value'))
                view.model.refresh()
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
     * @param li {li}
     * @param row {number} - index into model list
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
     */
    addModel(model) {
        console.log('ModelList.addModel()')
        let view = this

        console.log('rows.length: ' + view.rows.length + ', ' + view.idSequence)

        view.rows.push(new ModelRow(model, view, 'model-row-' + view.idSequence))
        view.idSequence++
        console.log('rows.length: ' + view.rows.length + ', ' + view.idSequence)

        view.plotter.setEcoModels(view.rows)
        view.render()
    }

    /**
     * Remove Model from list
     * @param model {Model}
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
     * Set all Models either active or inactive
     * @param active {boolean}
     */
    setModelsActive(active=true) {
        console.log('ModelList.setModelsActive()')
        let view = this
        view.active = view.el.select('.row-active-checkbox')
            .property('checked')
        view.rows.forEach(row => row.setActive(active))
        view.plot()
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

    let modelTypes = [
        {
            name: 'Continuous Exponential',
            modelClass: ContinuousExponential
        },
        {
            name: 'Discrete Exponential',
            modelClass: DiscreteExponential
        },
        {
            name: 'Environmental Stochasticity',
            modelClass: EnvironmentalStochasticity
        },
        {
            name: 'Demographic Stochasticity',
            modelClass: DemographicStochasticity
        },
        {
            name: 'Continuous Logistic',
            modelClass: ContinuousLogistic
        },
        {
            name: 'Stochastic Capacity',
            modelClass: StochasticCapacity
        },
        {
            name: 'Periodic Capacity',
            modelClass: PeriodicCapacity
        },
        {
            name: 'Discrete Logistic',
            modelClass: DiscreteLogistic
        }
    ]

    let cb = new ControlBar(modelTypes, ml)
})

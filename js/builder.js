/* JSLint */
/*global console: false, ecosym: false, extend: false*/


$(document).ready(function() {
    'use strict'

    let ce1 = new ContinuousExponential()
    let times1 = range(0, 201, 20)
    let populations1 = ce1.applyToTimespan(times1)

    let plot = document.getElementById('plot')
    Plotly.newPlot(
        plot,
        [{x: times1,
	  y: populations1}],
        {margin: { t: 0 } }
    )
})

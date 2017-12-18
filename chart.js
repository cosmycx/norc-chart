function makeChart (dataObj,  lookupObj, compareStr, settingsObj, chartMountNodeIdStr) {

	// console.log('dataObj: ', dataObj)
	// console.log('lookupObj: ', lookupObj)
	// console.log('compareStr: ', compareStr)
	// console.log('settingsObj: ', settingsObj)
	// console.log('chartMountNodeIdStr: ', chartMountNodeIdStr)


  if(_){} // needs _ (lodash)


  // sorting of dataObj by lookup sort
  let locations = lookupObj.filter(function(el){
  	return el.type === 'Location'
  })
  let dataObjAdded = _.mapValues(dataObj, function(o) {
  	o.sort = _.find(locations, {id:o.loc})['sort']
  	o.locName = _.find(locations, {id:o.loc})['name']
  	return o
  })
  let dataObjSorted = _.sortBy(dataObjAdded, [function(o) { return o.sort }])

  // get chart node for width and clear out
  let chartMountNode = document.getElementById(chartMountNodeIdStr)
  let tentvSvgWidth = (chartMountNode.clientWidth || 375)
  console.log(tentvSvgWidth)
  if (tentvSvgWidth > 1200) {
    tentvSvgWidth = 1200
  } else if (tentvSvgWidth < 375) {
    tentvSvgWidth = 375
  }
  console.log(tentvSvgWidth)

	// settings
	let barMargin = 10
	let barThickness = 15
	let barColor = '#377eb8'

	let paddingTextToChart = 15
	let spaceLeftForText = 140 + paddingTextToChart
	let fontSize = 12

	let intervalLineColor = 'Black'
	let intervalStrokeWidth = 1

	let spaceAtTop = 25
	let axisColor = 'Gray'

  // calculated width settings
  let barSvgWidth = tentvSvgWidth - tentvSvgWidth/4 - spaceLeftForText

  let svgChartWidth = spaceLeftForText + barSvgWidth
  console.log(svgChartWidth)


	let maxHci = d3.max(dataObj, function(d){ return parseFloat(d.hci) })
	let maxDv = d3.max(dataObj, function(d){ return parseFloat(d.dv) })
	let max = Math.max(maxHci, maxDv)

	var xScale = d3.scaleLinear()
									.domain([0, max])
									.range([0, barSvgWidth - intervalStrokeWidth])

	let svgChartHeight = spaceAtTop + dataObj.length * (barMargin + barThickness) + barMargin


  // clear out the chart div for a new chart
  while(chartMountNode.firstChild) {
    chartMountNode.removeChild(chartMountNode.firstChild)
  }

	// titles
	let chartTitle = settingsObj.chartTitleStr || ''
	d3.select('#' + chartMountNodeIdStr)
		.append('h4')
		.text(chartTitle)
		.style('text-align', 'center')
    .style('width', svgChartWidth + 'px')



	// chart
	let svgChart = d3.select('#' + chartMountNodeIdStr)
									.append('svg')
									.attr('width', svgChartWidth)
									.attr('height', svgChartHeight)


	let barTooltip = d3.select('#' + chartMountNodeIdStr)
											.append('div')
											.style('opacity', 0)
											.attr('id', 'barTooltip')


	// bars
	svgChart.selectAll('rect')
		.data(dataObjSorted)
		.enter()
		.append('rect')
		.attr('x', spaceLeftForText)
		.attr('y', function(data, index){

			return spaceAtTop + (barThickness + barMargin) * index + barMargin
		})
		.attr('width', function(data, index) {

			return xScale(data.dv)
		})
		.attr('height', barThickness)
		.attr('fill', barColor)
		.on('mouseover', function(d) {
			// console.log(d)
			barTooltip.transition()
									.duration(450)
									.style('opacity', .90)
			barTooltip.html('<strong>' + d.locName + '<br>' + parseFloat(d.dv) + d.dvu + '</strong><br>CI:(' + d.lci + ' - ' + d.hci + ')')
								.style('left', (d3.event.pageX + 15) + 'px')
								.style('top', (d3.event.pageY - 20) + 'px')
		})
		.on('mouseout', function(d) {
			// console.log('out')
			barTooltip.transition()
									.duration(250)
									.style('opacity', 0)
		})

		let intervalLines = svgChart.selectAll('intervalBarsG')
												.data(dataObjSorted)
												.enter()
												.append('g')
		intervalLines // interval bars
				.append('line')
				.attr('x1', function(data, index) {
					return xScale(data.lci) + spaceLeftForText
				})
				.attr('y1', function(data, index) {
					return spaceAtTop + barMargin * (index + 1) + barThickness * index + barThickness/2
				})
				.attr('x2', function(data, index) {
					return xScale(data.hci) + spaceLeftForText
				})
				.attr('y2', function(data, index) {
					return spaceAtTop + barMargin * (index + 1) + barThickness * index + barThickness/2
				})
				.attr('stroke', intervalLineColor)
				.attr('stroke-width', intervalStrokeWidth)

		intervalLines // interval left line
				.append('line')
				.attr('x1', function(data, index) {
					return xScale(data.lci) + spaceLeftForText
				})
				.attr('y1', function(data, index) {
					return spaceAtTop + barMargin * (index + 1) + barThickness * index + barThickness/2 - barThickness/8
				})
				.attr('x2', function(data, index) {
					return xScale(data.lci) + spaceLeftForText
				})
				.attr('y2', function(data, index) {
					return spaceAtTop + barMargin * (index + 1) + barThickness * index + barThickness/2 + barThickness/8
				})
				.attr('stroke', intervalLineColor)
				.attr('stroke-width', intervalStrokeWidth)

			intervalLines // interval right line
				.append('line')
				.attr('x1', function(data, index) {
					return xScale(data.hci) + spaceLeftForText
				})
				.attr('y1', function(data, index) {
					return spaceAtTop + barMargin * (index + 1) + barThickness * index + barThickness/2 - barThickness/8
				})
				.attr('x2', function(data, index) {
					return xScale(data.hci) + spaceLeftForText
				})
				.attr('y2', function(data, index) {
					return spaceAtTop + barMargin * (index + 1) + barThickness * index + barThickness/2 + barThickness/8
				})
				.attr('stroke', intervalLineColor)
				.attr('stroke-width', intervalStrokeWidth)

			intervalLines
				.on('mouseover', function(d) {
					//console.log(d)
					barTooltip.transition()
											.duration(450)
											.style('opacity', .90)
					barTooltip.html('<strong>' + d.locName + '<br>' + parseFloat(d.dv) + d.dvu + '</strong><br>CI:(' + d.lci + ' - ' + d.hci + ')')
										.style('left', (d3.event.pageX + 15) + 'px')
										.style('top', (d3.event.pageY - 20) + 'px')
				})
				.on('mouseout', function(d) {
					// console.log('out')
					barTooltip.transition()
											.duration(250)
											.style('opacity', 0)
				})



	// grid vertical lines
	let gridArr = [], i = 0
	while (i < maxDv + 1) {
		gridArr.push(i)
		i++
	}
	svgChart.selectAll('vertGridLines')
		.data(gridArr)
		.enter()
		.append('line')
		.attr('x1', function(data, index) {
				return xScale(data) + spaceLeftForText
			})
		.attr('x2', function(data, index) {
				return xScale(data) + spaceLeftForText
			})
			.attr('y1', spaceAtTop + barMargin/2)
			.attr('y2', svgChartHeight - barMargin/2)
			.attr('stroke-dasharray', function(data, index) {
				if (index !== 0) return '3, 10'
			})
			.attr('stroke-width', '1')
			.attr('stroke', axisColor)

	svgChart.selectAll('vertGridLinesText')
		.data(gridArr)
		.enter()
		.append('text')
		.text(function(data, index) {

			return index
		})
		.attr('font-family', 'Lato')
		.attr('text-anchor', 'center')
		.attr('font-size', fontSize)
		.attr('x', function(data, index){
			return spaceLeftForText + xScale(index) - fontSize/3
		})
		.attr('y', spaceAtTop - fontSize)

		svgChart.selectAll('horizTickLines')
			.data(dataObjSorted)
			.enter()
			.append('line')
			.attr('x1', spaceLeftForText - 7)
			.attr('x2', spaceLeftForText)
			.attr('y1', function(data, index) {
					return spaceAtTop + barMargin * (index ) + barThickness  * index + barMargin/2
				})
			.attr('y2', function(data, index) {
					return spaceAtTop + barMargin * (index ) + barThickness * index + barMargin/2
				})
			.attr('stroke-width', '1')
			.attr('stroke', axisColor)
		svgChart.append('line') // adding last tick at bottom of chart
					.attr('x1', spaceLeftForText - 7)
					.attr('x2', spaceLeftForText)
					.attr('y1', function(data, index) {
							return  svgChartHeight - barMargin/2
						})
					.attr('y2', function(data, index) {
							return  svgChartHeight - barMargin/2
						})
					.attr('stroke-width', '1')
					.attr('stroke', axisColor)


	// state text
	svgChart.selectAll('locationText')
		.data(dataObjSorted)
		.enter()
		.append('text')
		.text(function(data) {

			return data.locName
		})
		.attr('font-family', 'Lato')
		.attr('text-anchor', 'end')
		.attr('font-size', fontSize)
		.attr('x', spaceLeftForText - paddingTextToChart)
		.attr('y', function(data, index) {
				return spaceAtTop + barMargin * (index+1) + barThickness * index + barThickness/2 + fontSize/3
		 })

}

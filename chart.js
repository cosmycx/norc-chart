d3.json('./data.json', function(data) {
	//console.log(data)


	// settings
	let barMargin = 7
	let barThickness = 15
	let barColor = 'Olive'
	let barSvgWidth = 400

	let spaceLeftForText = 30
	let fontSize = 14


	let intervalLineColor = 'Purple'
	let intervalStrokeWidth = 1

	// calculated settings
	let svgChartWidth = barSvgWidth + spaceLeftForText

	// let minLci = d3.min(data, function(d){ return d.lci })
	// let minDv = d3.min(data, function(d){ return d.dv })
	// let min = Math.min(minLci, minDv)




	let maxHci = d3.max(data, function(d){ return d.hci })
	let maxDv = d3.max(data, function(d){ return d.dv })
	let max = Math.max(maxHci, maxDv)

	var xScale = d3.scaleLinear()
									.domain([0, max])
									.range([0, barSvgWidth - intervalStrokeWidth])

	let svgChartHeight = data.length * (barMargin + barThickness) + barMargin


	// chart
	let svgChart = d3.select('#chartMount')
	                .append('svg')
	                .attr('width', svgChartWidth)
	                .attr('height', svgChartHeight)


	let barTooltip = d3.select('#chartMount')
											.append('div')
											.style('opacity', 0)
											.attr('id', 'barTooltip')



	// bars
	svgChart.selectAll('rect')
	  .data(data)
	  .enter()
	  .append('rect')
	  .attr('x', spaceLeftForText)
	  .attr('y', function(data, index){

	    return (barThickness + barMargin) * index + barMargin
	  })
	  .attr('width', function(data, index) {

	    return xScale(data.dv)
	  })
	  .attr('height', barThickness)
	  .attr('fill', barColor)
		.on('mouseover', function(d) {
			console.log(d)
			barTooltip.transition()
									.duration(450)
									.style('opacity', .90)
			barTooltip.html('<p>Data</p><p>dv: ' + d.dv + '</p>')
									.style('left', (d3.event.pageX) + 'px')
									.style('top', (d3.event.pageY - 20) + 'px')
		})
		.on('mouseout', function(d) {
			console.log('out')
			barTooltip.transition()
									.duration(250)
									.style('opacity', 0)
		})

		let intervalLines = svgChart.selectAll('intervalBarsG')
												.data(data)
												.enter()
												.append('g')
		intervalLines // interval bars
				.append('line')
				.attr('x1', function(data, index) {
					return xScale(data.lci) + spaceLeftForText
				})
				.attr('y1', function(data, index) {
					return barMargin * (index + 1) + barThickness * index + barThickness/2
				})
				.attr('x2', function(data, index) {
					return xScale(data.hci) + spaceLeftForText
				})
				.attr('y2', function(data, index) {
					return barMargin * (index + 1) + barThickness * index + barThickness/2
				})
				.attr('stroke', intervalLineColor)
				.attr('stroke-width', intervalStrokeWidth)

		intervalLines // interval left line
				.append('line')
				.attr('x1', function(data, index) {
					return xScale(data.lci) + spaceLeftForText
				})
				.attr('y1', function(data, index) {
					return barMargin * (index + 1) + barThickness * index + barThickness/2 - barThickness/10
				})
				.attr('x2', function(data, index) {
					return xScale(data.lci) + spaceLeftForText
				})
				.attr('y2', function(data, index) {
					return barMargin * (index + 1) + barThickness * index + barThickness/2 + barThickness/10
				})
				.attr('stroke', intervalLineColor)
				.attr('stroke-width', intervalStrokeWidth)

			intervalLines // interval right line
				.append('line')
				.attr('x1', function(data, index) {
					return xScale(data.hci) + spaceLeftForText
				})
				.attr('y1', function(data, index) {
					return barMargin * (index + 1) + barThickness * index + barThickness/2 - barThickness/10
				})
				.attr('x2', function(data, index) {
					return xScale(data.hci) + spaceLeftForText
				})
				.attr('y2', function(data, index) {
					return barMargin * (index + 1) + barThickness * index + barThickness/2 + barThickness/10
				})
				.attr('stroke', intervalLineColor)
				.attr('stroke-width', intervalStrokeWidth)

			intervalLines
				.on('mouseover', function(d) {
					console.log(d)
					barTooltip.transition()
											.duration(450)
											.style('opacity', .90)
					barTooltip.html('<p>Data</p><p>lci: ' + d.lci + '</p><p>hci: ' + d.hci + '</p>')
											.style('left', (d3.event.pageX) + 'px')
											.style('top', (d3.event.pageY - 20) + 'px')
				})
				.on('mouseout', function(d) {
					console.log('out')
					barTooltip.transition()
											.duration(250)
											.style('opacity', 0)
				})



	// grid vertical lines
	let gridArr = [], i = 1
	while (i < maxDv) {
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
			.attr('y1', 0)
			.attr('y2', svgChartHeight)
			.attr('stroke-dasharray', '2, 7')
			.attr('stroke-width', '1')
			.attr('stroke', 'Gray')

	// state text
	svgChart.selectAll('text')
	  .data(data)
	  .enter()
	  .append('text')
	  .text(function(data) {
	    return data.loc
	  })
	  .attr('font-family', 'Lato')
	  .attr('text-anchor', 'start')
	  .attr('font-size', fontSize)
	  .attr('x', 0)
	  .attr('y', function(data, index) {
	      return barMargin * (index+1) + barThickness * index + barThickness/2 + fontSize/3
	   })



}) // .end read json of data

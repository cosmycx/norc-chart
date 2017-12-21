function makeChart (dataObj,  lookupObj, compareStr, settingsObj, chartMountNodeIdStr) {

	// console.log('dataObj: ', dataObj)
	// console.log('lookupObj: ', lookupObj)
	// console.log('compareStr: ', compareStr)
	// console.log('settingsObj: ', settingsObj)
	// console.log('chartMountNodeIdStr: ', chartMountNodeIdStr)


  if(_){} // needs _ (lodash)

  // adding location sort and location name
  let locations = lookupObj.filter(function(el){
  	return el.type === 'Location'
  })
  let dataObjAdded = _.forEach(dataObj, function(o) {
  	o.sort = _.find(locations, {id:o.loc})['sort']
  	o.locName = _.find(locations, {id:o.loc})['name']
  	return o
  })


  let dataObjSorted = []
  let colorsObj = {}
  let groupMapping = {
    'Overall': 'Overall',
    'Year': 'yr',
    'Response': 'rs',
    'AgeGroup': 'ag',
    'Gender': 'ge',
    'RaceEthnicity': 're',
    'RiskFactorResponse': 'rfr'
  }
  let totalBarsArr = []
  let emptyLocArr = []
  let groupTypes = []
  let allLocationsArr = []


  if (compareStr === 'Overall') {

    dataObjSorted = _.sortBy(dataObjAdded, [function(o) { return o.sort }])

  } else { // Not Overall

    // adding type name and type sort
    groupTypes = lookupObj.filter(function(el) {
      return el.type === compareStr
    })
    dataObjAdded = _.forEach(dataObjAdded, function(o) {
    	o.sortGroup = _.find(groupTypes, {id:o.ag})['sort']
    	o.groupName = _.find(groupTypes, {id:o.ag})['name']
    	return o
    })


    // total number of bars
    let allGroups = _.map(dataObjAdded, groupMapping[compareStr])
    totalBarsArr = _.uniq(allGroups)
    let totalBars = totalBarsArr.length

    // locations to check for total bars
    let allLocations = _.map(dataObjAdded, 'loc')
    allLocationsArr = _.uniq(allLocations)

    _.forEach(allLocationsArr, function(value) {

      let thisLocationArr = _.filter(dataObjAdded, function(el){
        return el.loc === value
      })

      // eliminating locations with no bars
      let emptyLocation = true
      _.forEach(thisLocationArr, function(el) {
        if (typeof el.dv !== 'undefined') {
          emptyLocation = false
        }
      })

      if (emptyLocation) { emptyLocArr.push(value) }


      // adding missing bars to location when needed
      if (_.size(thisLocationArr) != totalBars) {
        //console.log(thisLocationArr)

        _.forEach(totalBarsArr, function(el) {

            let missingBar = _.find(thisLocationArr, [groupMapping[compareStr], el])

            if (typeof missingBar === 'undefined') {
              let mBarObj = {}
              mBarObj['loc'] = thisLocationArr[0].loc
              mBarObj[groupMapping[compareStr]] = el
              mBarObj['locName'] = thisLocationArr[0].locName
              mBarObj['sort'] = thisLocationArr[0].sort
              mBarObj['sortGroup'] = thisLocationArr[0].sortGroup

              dataObjAdded.push(mBarObj)
            }
        })
      }// .adding missing bars to location
    })

    // removing empty state locations with no bars
    let dataObjAddedRem = _.filter(dataObjAdded, function(el) {
      return !_.includes(emptyLocArr, el.loc)
    })


    // sorting by location and group
    dataObjSorted = _.sortBy(dataObjAddedRem, ['sort', 'sortGroup'])


    // extending colors if not enough
    while (settingsObj.colorsArrStr.length < totalBarsArr.length) {
      settingsObj.colorsArrStr.push(settingsObj.colorsArrStr[0])
    }
    // making bars color object
    for (let i = 0; i < totalBarsArr.length; i++) {
      colorsObj[totalBarsArr[i]] = settingsObj.colorsArrStr[i]
    }

  } // Not Overall


  // get chart node for width and clear out
  let chartMountNode = document.getElementById(chartMountNodeIdStr)
  let tentvSvgWidth = (chartMountNode.clientWidth || 375)

  if (tentvSvgWidth > 800) {
    tentvSvgWidth = 800
  } else if (tentvSvgWidth < 375) {
    tentvSvgWidth = 375
  }

	// settings
	let barMargin = 7
	let barThickness = 15

	let paddingTextToChart = 15
	let spaceLeftForText = 140 + paddingTextToChart
	let fontSize = 12

	let intervalLineColor = 'Black'
	let intervalStrokeWidth = 1

	let spaceAtTop = 25
	let axisColor = 'Gray'

  // calculated width settings
  let barSvgWidth = tentvSvgWidth - spaceLeftForText - fontSize

  let svgChartWidth = tentvSvgWidth


	let maxHci = d3.max(dataObj, function(d){ return parseFloat(d.hci) })
	let maxDv = d3.max(dataObj, function(d){ return parseFloat(d.dv) })
	let maxHoriz = Math.max(maxHci, maxDv)

	var xScale = d3.scaleLinear()
									.domain([0, maxHoriz + 1])
									.range([0, barSvgWidth])

	let svgChartHeight = spaceAtTop + dataObjSorted.length * (barMargin + barThickness) + barMargin //+ allLocationsArr.length * barMargin


  // clear out the chart div for a new chart
  while(chartMountNode.firstChild) {
    chartMountNode.removeChild(chartMountNode.firstChild)
  }

	// title
	let chartTitle = settingsObj.chartTitleStr || ''
	d3.select('#' + chartMountNodeIdStr)
		.append('h4')
		.text(chartTitle)
		.style('text-align', 'center')
    .style('width', svgChartWidth + 'px')


  // legend
  let legendWidth = 250
  if (compareStr !== 'Overall') {

    d3.select('#' + chartMountNodeIdStr)
      .append('div')
      .attr('id', 'legend')
      .style('width', legendWidth + 'px')
      .html(getLegendStr())
  }

  function getLegendStr() {
      console.log(groupTypes)
    let legendStr = compareStr

    _.forEach(totalBarsArr, function(groupId, index) {
      legendStr += '<br><svg width="20" height="15"><rect style="fill:' + colorsObj[totalBarsArr[index]] + ';" width="15" height="15"/></svg>'
      legendStr += _.find(groupTypes, {'id':groupId})['name']
    })
    return legendStr
  }


	// chart
	let svgChart = d3.select('#' + chartMountNodeIdStr)
									.append('svg')
									.attr('width', svgChartWidth)
									.attr('height', svgChartHeight)
                  .attr('id', 'svgChart')


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
      if(typeof data.dv !== 'undefined') {
			  return xScale(data.dv)
      }
		})
		.attr('height', function(data, index) {
      if (typeof data.dv !== 'undefined') {
        return barThickness
      }
    })
		.attr('fill', function(data, index) {

      if (compareStr === 'Overall') { return settingsObj.colorsArrStr[0] }

      return colorsObj[data[groupMapping[compareStr]]]

    })
		.on('mouseover', function(d) {
			// console.log(d)
			barTooltip.transition()
									.duration(450)
									.style('opacity', .90)
			barTooltip.html(getTooltipStr(d))
        .style('left', (d3.event.pageX + 15) + 'px')
        .style('top', (d3.event.pageY - 20) + 'px')
		})
		.on('mouseout', function(d) {
			// console.log('out')
			barTooltip.transition()
									.duration(250)
									.style('opacity', 0)
		})


    // interval bars
		let intervalLines = svgChart.selectAll('intervalBarsG')
												.data(dataObjSorted)
												.enter()
												.append('g')
		intervalLines
				.append('line')
				.attr('x1', function(data, index) {
          if(typeof data.lci !== 'undefined' && typeof data.hci !== 'undefined') {
            return xScale(data.lci) + spaceLeftForText
          }
				})
				.attr('y1', function(data, index) {
          if(typeof data.lci !== 'undefined' && typeof data.hci !== 'undefined') {
            return spaceAtTop + barMargin * (index + 1) + barThickness * index + barThickness/2
          }
				})
				.attr('x2', function(data, index) {
          if(typeof data.lci !== 'undefined' && typeof data.hci !== 'undefined') {
            return xScale(data.hci) + spaceLeftForText
          }
				})
				.attr('y2', function(data, index) {
          if(typeof data.lci !== 'undefined' && typeof data.hci !== 'undefined') {
            return spaceAtTop + barMargin * (index + 1) + barThickness * index + barThickness/2
          }
				})
				.attr('stroke', intervalLineColor)
				.attr('stroke-width', intervalStrokeWidth)

		intervalLines // interval left line
				.append('line')
				.attr('x1', function(data, index) {
          if(typeof data.lci !== 'undefined' && typeof data.hci !== 'undefined') {
					  return xScale(data.lci) + spaceLeftForText
          }
				})
				.attr('y1', function(data, index) {
          if(typeof data.lci !== 'undefined' && typeof data.hci !== 'undefined') {
					  return spaceAtTop + barMargin * (index + 1) + barThickness * index + barThickness/2 - barThickness/8
          }
				})
				.attr('x2', function(data, index) {
          if(typeof data.lci !== 'undefined' && typeof data.hci !== 'undefined') {
					  return xScale(data.lci) + spaceLeftForText
          }
				})
				.attr('y2', function(data, index) {
          if(typeof data.lci !== 'undefined' && typeof data.hci !== 'undefined') {
					  return spaceAtTop + barMargin * (index + 1) + barThickness * index + barThickness/2 + barThickness/8
          }
				})
				.attr('stroke', intervalLineColor)
				.attr('stroke-width', intervalStrokeWidth)

			intervalLines // interval right line
				.append('line')
				.attr('x1', function(data, index) {
          if(typeof data.lci !== 'undefined' && typeof data.hci !== 'undefined') {
					  return xScale(data.hci) + spaceLeftForText
          }
				})
				.attr('y1', function(data, index) {
          if(typeof data.lci !== 'undefined' && typeof data.hci !== 'undefined') {
					  return spaceAtTop + barMargin * (index + 1) + barThickness * index + barThickness/2 - barThickness/8
          }
				})
				.attr('x2', function(data, index) {
          if(typeof data.lci !== 'undefined' && typeof data.hci !== 'undefined') {
					  return xScale(data.hci) + spaceLeftForText
          }
				})
				.attr('y2', function(data, index) {
          if(typeof data.lci !== 'undefined' && typeof data.hci !== 'undefined') {
					  return spaceAtTop + barMargin * (index + 1) + barThickness * index + barThickness/2 + barThickness/8
          }
				})
				.attr('stroke', intervalLineColor)
				.attr('stroke-width', intervalStrokeWidth)

			intervalLines
				.on('mouseover', function(d) {
					//console.log(d)
					barTooltip.transition()
											.duration(450)
											.style('opacity', .90)
					barTooltip.html(getTooltipStr(d))
            .style('left', (d3.event.pageX + 15) + 'px')
            .style('top', (d3.event.pageY - 20) + 'px')
				})
				.on('mouseout', function(d) {
					// console.log('out')
					barTooltip.transition()
											.duration(250)
											.style('opacity', 0)
				})

  function getTooltipStr(d) {
    let tooltipStr = '<strong>' + d.locName + '<br>' + parseFloat(d.dv) + d.dvu

    if (compareStr !== 'Overall') {
      tooltipStr += '</strong><br>Group: ' + d.groupName + '</strong>'
    }


    if (typeof d.lci !== 'undefined' && typeof d.hci !== 'undefined') {
      tooltipStr += '</strong><br>CI:(' + d.lci + ' - ' + d.hci + ')'
    }

    return tooltipStr
  }


	// grid vertical lines
	let gridArr = [], i = 0
	while (i < maxHoriz + 1) {
		gridArr.push(i)
		i++
	}
  let maxForGridLines = 15

	svgChart.selectAll('vertGridLines')
		.data(gridArr)
		.enter()
		.append('line')
		.attr('x1', function(data, index) {
      if (maxHoriz + 1 < maxForGridLines) {
        return xScale(data) + spaceLeftForText
      }
      if (index % 5 === 0) { return xScale(data) + spaceLeftForText }
			})
		.attr('x2', function(data, index) {
      if (maxHoriz + 1 < maxForGridLines) {
        return xScale(data) + spaceLeftForText
      }
      if (index % 5 === 0) { return xScale(data) + spaceLeftForText }
			})
			.attr('y1', function(data, index) {
        if (maxHoriz + 1 < maxForGridLines) {
          return spaceAtTop + barMargin/2
        }
        if (index % 5 === 0) { return spaceAtTop + barMargin/2 }
      })
			.attr('y2', function(data, index) {
        if (maxHoriz + 1 < maxForGridLines) {
          return svgChartHeight - barMargin/2
        }
        if (index % 5 === 0) { return svgChartHeight - barMargin/2 }
      })
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
      if (maxHoriz + 1 < maxForGridLines) {
        return index
      }
      if (index % 5 === 0) { return index }
		})
		.attr('font-family', 'Lato')
		.attr('text-anchor', 'center')
		.attr('font-size', fontSize)
		.attr('x', function(data, index){
			return spaceLeftForText + xScale(index) - fontSize/3
		})
		.attr('y', spaceAtTop - fontSize)


    // y axis horiz tick lines
    let tickLineLen = 8
		svgChart.selectAll('horizTickLines')
			.data(dataObjSorted)
			.enter()
			.append('line')
			.attr('x1', function(data, index) {
        if ( data[groupMapping[compareStr]] === totalBarsArr[0] ) {
          return spaceLeftForText - tickLineLen
        }
      })
			.attr('x2', function(data, index) {
        if ( data[groupMapping[compareStr]] === totalBarsArr[0] ) {
          return spaceLeftForText
        }
      })
			.attr('y1', function(data, index) {
          if ( data[groupMapping[compareStr]] === totalBarsArr[0] ) {
            return spaceAtTop + barMargin * (index ) + barThickness  * index + barMargin/2
          }
				})
			.attr('y2', function(data, index) {
          if ( data[groupMapping[compareStr]] === totalBarsArr[0] ) {
            return spaceAtTop + barMargin * (index ) + barThickness * index + barMargin/2
          }
				})
			.attr('stroke-width', '1')
			.attr('stroke', axisColor)
		svgChart.append('line') // adding last tick at bottom of chart
					.attr('x1', spaceLeftForText - tickLineLen)
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
      if ( data[groupMapping[compareStr]] === totalBarsArr[Math.floor(totalBarsArr.length/2)] ) {
        return data.locName
      }
		})
		.attr('font-family', 'Lato')
		.attr('text-anchor', 'end')
		.attr('font-size', fontSize)
		.attr('x', spaceLeftForText - paddingTextToChart)
		.attr('y', function(data, index) {
				return spaceAtTop + barMargin * (index+1) + barThickness * index + barThickness/2 + fontSize/3
		 })

}

function isNumber(val) {
  return !isNaN(parseFloat(val)) && isFinite(val)
}

function makeChart (dataObj,  lku, compareStr, settingsObj, chartMountNodeIdStr) {

  let compareStrOverall = 'Overall' //- one bar per State
  let dataCompareColumn = settingsObj.dataCompareColumn
  let legendTitleStr = settingsObj.legendTitleStr
  let decimalPlaces = settingsObj.decimalPlaces

	// console.log('dataObj: ', dataObj)
	// console.log('lookupObj: ', lookupObj)
	// console.log('compareStr: ', compareStr)
	// console.log('settingsObj: ', settingsObj)
	// console.log('chartMountNodeIdStr: ', chartMountNodeIdStr)


  if(_){} // needs _ (lodash)

  // adding location sort and location name
  let dataObjAdded = _.forEach(dataObj, function (o) {
    o.sort = lku.Location[o.loc].sort
    o.locName = lku.Location[o.loc].name
  	return o
  })


  let dataObjSorted = []
  let colorsObj = {}
  let totalBarsArr = []
  let emptyLocArr = []
  let groupTypes = {}
  let allLocationsArr = []
  let totalBars = 0


  if (compareStr === compareStrOverall) {

    // locations to check for bars
    let allLocations = _.map(dataObjAdded, 'loc')
    allLocationsArr = _.uniq(allLocations)

    _.forEach(allLocationsArr, function(value) {

      let thisLocationArr = _.filter(dataObjAdded, function(el){
        return el.loc === value
      })

      // eliminating locations with no bars
      let emptyLocation = true
      _.forEach(thisLocationArr, function(el) {
        if (isNumber(el.dv)) {
          emptyLocation = false
        }
      })

      if (emptyLocation) { emptyLocArr.push(value) }
    })

    // removing empty state locations with no bars
    let dataObjAddedRem = _.filter(dataObjAdded, function(el) {
      return !_.includes(emptyLocArr, el.loc)
    })

    // sorting by location and group
    dataObjSorted = _.sortBy(dataObjAddedRem, ['sort'])
    //dataObjSorted = _.sortBy(dataObjAdded, [function(o) { return o.sort }])

  } else { // Not Overall

    // adding type name and type sort
    groupTypes = lku[compareStr]

    dataObjAdded = _.forEach(dataObjAdded, function(o) {
      o.sortGroup = groupTypes[o[dataCompareColumn]].sort
      o.groupName = groupTypes[o[dataCompareColumn]].name
    	return o
    })


    // total number of bars, sorted by group sort order
    let allGroups = _.map(dataObjAdded, dataCompareColumn)
    totalBarsArr = _.sortBy(_.uniq(allGroups), [function(o) {
      return groupTypes[o].sort
    }])
    totalBars = totalBarsArr.length


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
        if (isNumber(el.dv)) {
          emptyLocation = false
        }
      })

      if (emptyLocation) { emptyLocArr.push(value) }


      // adding missing bars to location when needed
      if (_.size(thisLocationArr) != totalBars) {
        //console.log(thisLocationArr)

        _.forEach(totalBarsArr, function(el) {

            let missingBar = _.find(thisLocationArr, [dataCompareColumn, el])

            if (typeof missingBar === 'undefined') {
              let mBarObj = {}
              mBarObj['loc'] = thisLocationArr[0].loc
              mBarObj[dataCompareColumn] = el
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
  let chartMaxWidth = 800
  if (compareStr === compareStrOverall) { chartMaxWidth = 1200 }
  let chartMountNode = document.getElementById(chartMountNodeIdStr)
  let tentvSvgWidth = (chartMountNode.clientWidth || 375)

  if (tentvSvgWidth > chartMaxWidth) {
    tentvSvgWidth = chartMaxWidth
  } else if (tentvSvgWidth < 375) {
    tentvSvgWidth = 375
  }

	// settings
	let barMargin = 12
  let stateBarMargin = 25

  if(compareStr !== compareStrOverall) { barMargin = 0 }
  if(compareStr === compareStrOverall) { stateBarMargin = barMargin }

	let barThickness = 18

	let paddingTextToChart = 15
	let spaceLeftForText = 140 + paddingTextToChart
	let fontSize = 12

	let intervalLineColor = 'Black'
	let intervalStrokeWidth = 1

	let spaceAtTop = 70
	let axisColor = '#CCC'

  // calculated width settings
  let barSvgWidth = tentvSvgWidth - spaceLeftForText - 3 * fontSize

  let svgChartWidth = tentvSvgWidth


	let maxHci = d3.max(dataObj, function(d){ return parseFloat(d.hci) })
	let maxDv = d3.max(dataObj, function(d){ return parseFloat(d.dv) })
	let maxHoriz = Math.max(maxHci, maxDv)

  let scaleExtend = 1 - maxHoriz % 1
  if (maxHoriz < 1) { scaleExtend = 0.1 }

  let _maxForGridLines = 15 // maximum for maxHoriz val after grid lines are at 5 interval
  if (maxHoriz + 1 > _maxForGridLines) { scaleExtend = 5 - maxHoriz % 5 }

	var xScale = d3.scaleLinear()
									.domain([0, maxHoriz + scaleExtend])
									.range([0, barSvgWidth])

  let statesSpacingFactor = 3

	let svgChartHeight = spaceAtTop + dataObjSorted.length * (barMargin + barThickness) + barMargin + allLocationsArr.length * stateBarMargin //+ allLocationsArr.length * barMargin
  if(compareStr === compareStrOverall) {
    svgChartHeight = spaceAtTop + dataObjSorted.length * (barMargin + barThickness) + barMargin
  }


  // clear out the chart div for a new chart
  while(chartMountNode.firstChild) {
    chartMountNode.removeChild(chartMountNode.firstChild)
  }

	// title
	// let chartTitle = settingsObj.chartTitleStr || ''
	// d3.select('#' + chartMountNodeIdStr)
	// 	.append('h4')
	// 	.text(chartTitle)
	// 	.style('text-align', 'center')
  //   .style('width', svgChartWidth + 'px')


  // legend
  let legendWidth = 250
  if (compareStr !== compareStrOverall) {

    d3.select('#' + chartMountNodeIdStr)
      .append('div')
      .attr('id', 'legend')
      .style('width', legendWidth + 'px')
      .html(getLegendStr())
  }

  function getLegendStr() {

    let legendStr = '<div id="legendTitle">' + legendTitleStr + '</div>'

    _.forEach(totalBarsArr, function(groupId, index) {
      legendStr += '<div class="legendLine"><div class="legendSquare"><svg width="20" height="15"><rect style="fill:' + colorsObj[totalBarsArr[index]] + ';" width="15" height="15"/></svg></div>'
      legendStr += '<div class="legendSquareText">' + groupTypes[groupId].name + '</div></div>'
    })
    return legendStr
  }


	// chart
	let svgChart = d3.select('#' + chartMountNodeIdStr)
									.append('svg')
									.attr('width', svgChartWidth)
									.attr('height', svgChartHeight)
                  .attr('id', 'svgChart')


  // chart tiltle
  svgChart.append('text')
		      .text(settingsObj.chartTitleStr || '')
		      .attr('font-family', 'Lato')
		      .attr('text-anchor', 'middle')
		      .attr('font-size', '14px')
          .attr('font-weight', 'bold')
	        .attr('x', spaceLeftForText - paddingTextToChart + (svgChartWidth - spaceLeftForText) / 2)
		      .attr('y', 25)


	let barTooltip = d3.select('#' + chartMountNodeIdStr)
											.append('div')
											.style('opacity', 0)
											.attr('id', 'barTooltip')


  // grid vertical lines
  let maxForGridLines = _maxForGridLines
  let minForGridLines = 1

  let gridAdjust = 1
  if (maxHoriz + 1 > maxForGridLines) { gridAdjust = 5 }

	let gridArr = [], i = 0

  if (maxHoriz < minForGridLines) {  // microscale
    gridAdjust = 0.1

    while (i < maxHoriz + gridAdjust) {
      gridArr.push(i)
      i = i + gridAdjust
    }

  } else {
    while (i < maxHoriz + gridAdjust) {
      gridArr.push(i)
      i++
    }
  }


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

          if ( compareStr !== compareStrOverall ) { return spaceAtTop - stateBarMargin/2 }
          return spaceAtTop + stateBarMargin/2
        }
        if (index % 5 === 0) { return spaceAtTop - stateBarMargin/2 }
      })
			.attr('y2', function(data, index) {
        if (maxHoriz + 1 < maxForGridLines) {
          return svgChartHeight - stateBarMargin/2
        }
        if (index % 5 === 0) { return svgChartHeight - stateBarMargin/2 }
      })
			// .attr('stroke-dasharray', function(data, index) {
			// 	if (index !== 0) return '3, 10'
			// })
			.attr('stroke-width', '1')
			.attr('stroke', axisColor)

	svgChart.selectAll('vertGridLinesText')
		.data(gridArr)
		.enter()
		.append('text')
		.text(function(data, index) {
      if (maxHoriz < minForGridLines) { return index/10 } // microscale
      if (maxHoriz + 1 < maxForGridLines) {
        return index
      }
      if (index % 5 === 0) { return index }
		})
		.attr('font-family', 'Lato')
		.attr('text-anchor', 'center')
		.attr('font-size', fontSize)
		.attr('x', function(data, index){
      if (maxHoriz < minForGridLines) { return spaceLeftForText + xScale(data) - fontSize/3} // microscale
			return spaceLeftForText + xScale(index) - fontSize/3
		})
		.attr('y', spaceAtTop - fontSize - stateBarMargin / 2)



	// bars
	svgChart.selectAll('rect')
		.data(dataObjSorted)
		.enter()
		.append('rect')
		.attr('x', spaceLeftForText)
		.attr('y', function(data, index){
      if ( compareStr !== compareStrOverall ) {
        return spaceAtTop + (barThickness + barMargin) * index + barMargin + stateBarMargin * Math.floor(index / totalBarsArr.length)
      }
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

      if (compareStr === compareStrOverall) { return settingsObj.colorsArrStr[0] }

      return colorsObj[data[dataCompareColumn]]

    })
		.on('mouseover', function(d) {
			// console.log(d)
			barTooltip.transition()
									.duration(450)
									.style('opacity', 1)
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
            if ( compareStr !== compareStrOverall ) {
              return spaceAtTop + barMargin * (index + 1) + barThickness * index + barThickness/2 + stateBarMargin * Math.floor(index / totalBarsArr.length)
            }
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
            if ( compareStr !== compareStrOverall ) {
              return spaceAtTop + barMargin * (index + 1) + barThickness * index + barThickness/2 + stateBarMargin * Math.floor(index / totalBarsArr.length)
            }
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
            if ( compareStr !== compareStrOverall ) {
              return spaceAtTop + barMargin * (index + 1) + barThickness * index + barThickness/2 - barThickness/8 + stateBarMargin * Math.floor(index / totalBarsArr.length)
            }
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
            if ( compareStr !== compareStrOverall ) {
              return spaceAtTop + barMargin * (index + 1) + barThickness * index + barThickness/2 + barThickness/8 + stateBarMargin * Math.floor(index / totalBarsArr.length)
            }
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
            if ( compareStr !== compareStrOverall ) {
              return spaceAtTop + barMargin * (index + 1) + barThickness * index + barThickness/2 - barThickness/8 + stateBarMargin * Math.floor(index / totalBarsArr.length)
            }
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
            if ( compareStr !== compareStrOverall ) {
              return spaceAtTop + barMargin * (index + 1) + barThickness * index + barThickness/2 + barThickness/8 + stateBarMargin * Math.floor(index / totalBarsArr.length)
            }
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
											.style('opacity', 1)
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

  function getTooltipStr (d) {
    const groupName = compareStr !== compareStrOverall ? '<br>' + d.groupName : ''

    let tooltipStr = '<strong>' + d.locName + groupName + '<br>' + Number(d.dv).toFixed(decimalPlaces) + d.dvu + '</strong>'

    if (isNumber(d.lci) && isNumber(d.hci)) {
      tooltipStr += '<br>' + settingsObj.confidenceIntervalLabel + ' (' + Number(d.lci).toFixed(decimalPlaces)
      + ' - ' + Number(d.hci).toFixed(decimalPlaces) + ')'
    }

    if (isNumber(d.ss)) {
      tooltipStr += '<br>n = ' + Number(d.ss).toLocaleString()
    }

    return tooltipStr
  }


    // y axis horiz tick lines
    let tickLineLen = 8
		svgChart.selectAll('horizTickLines')
			.data(dataObjSorted)
			.enter()
			.append('line')
			.attr('x1', function(data, index) {
        if ( data[dataCompareColumn] === totalBarsArr[0] ) {
          return spaceLeftForText - tickLineLen
        }
      })
			.attr('x2', function(data, index) {
        if ( data[dataCompareColumn] === totalBarsArr[0] ) {
          return spaceLeftForText
        }
      })
			.attr('y1', function(data, index) {
          if ( data[dataCompareColumn] === totalBarsArr[0] ) {
            if ( compareStr !== compareStrOverall ) {
              // if (index === 0) {
              //   return spaceAtTop + barMargin * index + barThickness  * index + barMargin/2 + stateBarMargin * Math.floor(index / totalBarsArr.length) - (stateBarMargin / 2)
              // }
              return spaceAtTop + barMargin * index + barThickness  * index + barMargin/2 + stateBarMargin * Math.floor(index / totalBarsArr.length) - (stateBarMargin / 2)
            }
            return spaceAtTop + barMargin * index + barThickness  * index + barMargin/2
          }
				})
			.attr('y2', function(data, index) {
          if ( data[dataCompareColumn] === totalBarsArr[0] ) {
            if ( compareStr !== compareStrOverall ) {
              // if (index === 0) {
              //   return spaceAtTop + barMargin * index + barThickness  * index + barMargin/2 + stateBarMargin * Math.floor(index / totalBarsArr.length) - (stateBarMargin / 2)
              // }
              return spaceAtTop + barMargin * index + barThickness  * index + barMargin/2 + stateBarMargin * Math.floor(index / totalBarsArr.length) - (stateBarMargin / 2)
            }
            return spaceAtTop + barMargin * index + barThickness * index + barMargin/2
          }
				})
			.attr('stroke-width', '1')
			.attr('stroke', axisColor)
		svgChart.append('line') // adding last tick at bottom of chart
					.attr('x1', spaceLeftForText - tickLineLen)
					.attr('x2', spaceLeftForText)
					.attr('y1', function(data, index) {
							return  svgChartHeight - stateBarMargin/2
						})
					.attr('y2', function(data, index) {
							return  svgChartHeight - stateBarMargin/2
						})
					.attr('stroke-width', '1')
					.attr('stroke', axisColor)

	// state text
	svgChart.selectAll('locationText')
		.data(dataObjSorted)
		.enter()
		.append('text')
		.text(function(data) {
      if ( ( compareStr != compareStrOverall ) && ( data[dataCompareColumn] === totalBarsArr[Math.floor(totalBarsArr.length/2)] ) ) {
        return data.locName
      }
      if ( compareStr === compareStrOverall) { return data.locName }
		})
		.attr('font-family', 'Lato')
		.attr('text-anchor', 'end')
		.attr('font-size', fontSize)
		.attr('x', spaceLeftForText - paddingTextToChart)
		.attr('y', function(data, index) {
      if ( compareStr !== compareStrOverall ) {
        return spaceAtTop + barMargin * (index + 1) + barThickness * index + barThickness/2 + fontSize/3 + stateBarMargin * Math.floor(index / totalBarsArr.length)
      }
				return spaceAtTop + barMargin * (index+1) + barThickness * index + barThickness/2 + fontSize/3
		 })

}

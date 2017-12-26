// loading the response json
let data_1 = new Promise(function(resolve, reject){
	d3.json('./respOver_1.json', function(data) {
		resolve(data)
	})
})
let data_2 = new Promise(function(resolve, reject){
	d3.json('./respOver_2.json', function(data) {
		resolve(data)
	})
})
let data_multiple = new Promise(function(resolve, reject){
	d3.json('./respMultBars.json', function(data) {
		resolve(data)
	})
})
let data_4 = new Promise(function(resolve, reject){
	d3.json('./resp_data_4.json', function(data) {
		resolve(data)
	})
})

// loading the lookup json
let lookup = new Promise(function(resolve, reject){
	d3.json('./lookup.json', function(lookup) {
		resolve(lookup)
	})
})

// compare string choices from dropdown
let compareArr = ['Overall', 'Year', 'Response', 'AgeGroup', 'Gender', 'RaceEthnicity', 'RiskFactorResponse']

// color settings object
let settingsObj = {
	colorsArrStr: ['#377eb8', 'Orange', 'Tomato', 'Purple', 'Blue', 'Magenta'],
	chartTitleStr: 'Percent (%)',
	dataCompareColumn: 're',
	legendTitleStr: 'Age Group'
}
// let groupMapping = { // dataCompareColumn
// 	'Overall': 'Overall',
// 	'Year': 'yr',
// 	'Response': 'rs',
// 	'AgeGroup': 'ag',
// 	'Gender': 'ge',
// 	'RaceEthnicity': 're',
// 	'RiskFactorResponse': 'rfr'
// }

// id of the html node for chart
let chartMountNodeIdStr = 'chartMount'

let data = data_4

Promise.all([data, lookup]).then(function(values){

	let dataObj = values[0]
	let lookupObj = values[1]
	let compareStr = compareArr[5] // 'Age Groups'

	// chart making function
	makeChart(dataObj,  lookupObj, compareStr, settingsObj, chartMountNodeIdStr)

})


/*
let data = data_1

document.getElementById('updateChart').addEventListener('click', function(e) {

	if (_.isEqual(data, data_1)) {
		data = data_2
	} else {
		data = data_1
	}

	Promise.all([data, lookup]).then(function(values){

		let dataObj = values[0]
		let lookupObj = values[1]
		let compareStr = compareArr[2] // 'Age Groups'

		// chart making function
		makeChart(dataObj,  lookupObj, compareStr, settingsObj, chartMountNodeIdStr)

	})

})
*/

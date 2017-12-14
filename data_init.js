// loading the response json
let data = new Promise(function(resolve, reject){
	d3.json('./respOver_1.json', function(data) {
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
let compareArr = ['Overall', 'Subgroups', 'Age Groups', 'Gender', 'Race/Ethnicity']

// color settings object
let settingsObj = {
	colorsArrStr: ['Blue', 'Orange', 'Tomato', 'Purple']
}

// id of the html node for chart
let chartMountNodeIdStr = 'chartMount'


Promise.all([data, lookup]).then(function(values){

	let dataObj = values[0]
	let lookupObj = values[1]
	let compareStr = compareArr[2] // 'Age Groups'

	// chart making function
	makeChart(dataObj,  lookupObj, compareStr, settingsObj, chartMountNodeIdStr)

})

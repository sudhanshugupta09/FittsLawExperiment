"use strict";

function testBoxDim(width, height, top, right, bottom, left) {
	return {width: width,
		height: height,
		innerWidth: width - (left + right),
		innerHeight: height - (top + bottom),
		top: top,
		right: right,
		bottom: bottom,
		left: left,
		cx: (width - (left + right)) / 2 + left,
		cy: (height - (top + bottom)) / 2 + top};
}
// function testBoxDim(width, height, top, right, bottom, left) {

// 	innerWidth: width - (left + right);
// 	innerHeight: height - (top + bottom);
// 	cx: (width - (left + right)) / 2 + left;
// 	cy: (height - (top + bottom)) / 2 + top;

// 	return {width, height, innerWidth, innerHeight, top, right, bottom, left, cx, cy};
// }
	


// set up dimensions for the plotting.
var testDimension = testBoxDim(600, 600, 30, 30, 30, 30);

var clickTimeout = 2000;
//var UPDATE_DELAY = clickTimeout;

var testDS = {
	target: {x: 0, y: 0, r: 10},
	start: {x: 0, y: 0, t: 0},
	last: {},
	circlePos: [],
	currentPosition: 0,
	currentCount: 0,
	testDSParameters: {num: 15, distance: 200, width: 50},
	currentPath: [],
	active: false,
	data: [],
	currentDataSet: 0,
	dataCounter: 0,
	colour: d3.scale.category10(),

	generateTarget: function() {
		this.target = this.circlePos[this.currentPosition];
		this.target.distance = this.testDSParameters.distance;
		this.currentPosition = (this.currentPosition + Math.floor(this.circlePos.length/2)) % this.circlePos.length;

		var target = plotArea.selectAll('#target').data([this.target]);

		var insert = function(d) {
			d.attr('cx', function(d) { return d.x; })
			.attr('cy', function(d) { return d.y; })
			.attr('r', function(d) { return d.w / 2; })
                        .style("fill-opacity", .6)
                        .style("fill", "blue");
		}

		target.enter()
			.append('circle')
				.attr('id', 'target')
				.call(insert);

		target.transition()
				.call(insert);


		this.active = true;
	},
//hai
	updateTestAreaView: function() {
		this.currentCount = 0;

		this.createCirclePositions(this.testDSParameters.num,this.testDSParameters.distance,this.testDSParameters.width);

		var circles = plotArea.selectAll('circle').data(this.circlePos);

		var insert = function(d) {
			d.attr('cx', function(d) { return d.x; })
			.attr('cy', function(d) { return d.y; })
			.attr('r', function(d) { return d.w / 2; });
		}

		circles.enter()
			.append('circle')
				.attr('class', 'iso')
				.call(insert);

		circles.transition()
			.call(insert);

		circles.exit()
			.transition()
				.attr('r', 0)
				.remove();

		this.currentPosition = 0;
		this.generateTarget();
		this.active = false;
},
//hai
	createCirclePositions: function(num, d, w) {

		this.circlePos = [];

		for (var i = 0; i < num; i++) {
			this.circlePos[i] = {x: testDimension.cx + ((d/2) * Math.cos((2 * Math.PI * i) / num)),
				y: testDimension.cy + ((d/2) * Math.sin((2 * Math.PI * i) / num)),
				w: w};
		}
	},


//hai
	removeTarget: function() {
		plotArea.selectAll('#target').data([])
			.exit()
				.remove();

		this.active = false;
		this.currentPath = [];
	},


//hai
	mouseClicked: function(x, y) {

		if (distance({x: x, y: y}, this.target) < (this.target.w / 2)) {
			this.addDataPoint({start: this.start,
							   target: this.target,
							   path: this.currentPath,
							   hit: {x: x, y: y, t: (new Date).getTime()}});
                        //this.addDataPoint({start: this.start, target: this.target, path: this.currentPath});
			this.removeTarget();

			if (this.currentCount >= this.circlePos.length) {
				//this.randomizeParams();
                window.alert("Values Received \nNow try with different values of Distance and width.");
                                //this.changeParams();
				this.currentCount = 0;
				this.currentPosition = 0;
				this.updateTestAreaView;
				this.generateTarget();
				this.active = false;
			}
			else {
				this.currentCount++;
				this.generateTarget();
			}


			this.last = {x: x, y: y, t: (new Date).getTime()};
			this.start = this.last;
			this.currentPath.push(this.last);
		}
	},

	mouseMoved: function(x, y) {
		if (this.active) {
			// skip if the mouse did actually not move
			// that should practically never happen...
			if (x == this.last.x && y == this.last.y) {
				return;
			}

			var newPoint = {x: x, y: y, t: (new Date).getTime()}
			this.currentPath.push(newPoint)

			var dt = newPoint.t - this.last.t;
			var dist = distance(this.last, {x: x, y: y})
			if (dt > 0)
				var speed = dist / dt;
			else
				var speed = 0;


			this.last = newPoint;
		}
	},
// hai
	addDataPoint: function(data) {
		// add point to data array for plotting into ID/time scatter plot
		if (this.active == false)
			return;

		var clicksDifference = data.hit.t - data.start.t;

		// if (dt < clickTimeout)  // skip if obvious outlier
		// {
			var dist = distance(data.target, data.start);


			this.data[this.currentDataSet].data.push({time: clicksDifference, distance: data.target.distance, width: data.target.w, hit: data.hit,
				start: data.start, target: data.target});


			// var A = data.start;
			// var B = data.target;
		// }
	},


        
// hai
	addDataSet: function() {

		// first update the plots
		this.updatePlots(this);

		this.dataCounter++;
		var num = this.dataCounter;
		var colour = this.colour(randomAB(0, 10));

		this.data[num] = {data: [], colour: colour};

//                this.data[num] = {data: []};
		this.currentDataSet = num
		// var div = d3.select('#dataSets').append('div')
		// 	.attr('id', 'dataSet' + num)
		// 	.text('Data Set ' + num + ' ')
		// 	.style('background-color', colour);

		var buttonID ='removeDataSet' + num;
		// div.append('button')
		// 	.attr('id', buttonID)
		// 	.attr('type', 'button')
		// 	.text('delete!');

		var that = this;

		$('#' + buttonID).click(function() {
			that.deleteDataSet(num);
			testDS.active = false;
		});

		$('#dataSet' + num).click(function() {
			if (assIsKey(num, that.data)) {
				that.currentDataSet = num;
				that.highlightDataSet(num);
			}
			testDS.active = false;

		})

		this.highlightDataSet(num);
		// add colour

	},

	deleteDataSet: function(num) {
		if (assSize(this.data) == 1)
		{
			alert('Cannot delete data set! Create another data set first.')
		} else
		{
			d3.select('#dataSet' + num).remove();
			delete this.data[num];

			if (num == this.currentDataSet) {
				var first = parseInt(assFirstKey(this.data));
				this.currentDataSet = first;
				this.highlightDataSet(first);
			}

			this.updatePlots(this);
		}
	},

	highlightDataSet: function(num) {
		d3.selectAll('#dataSets div')
			.attr('class', '');
		d3.select('#dataSet' + num)
			.attr('class', 'active')
	},

	updatePlots: function(that) {
		// a little I candy :D
		d3.select('body').append('div').attr('class', 'msg').text('Reloading').style('opacity', 1).transition().duration(1000)
                        .style('opacity', .6).remove();
	}
};


// function used in addDataSet
function randomAB(a, b) {
	return a + Math.random() * (b - a);
}

function mouseMoved()
{
	var m = d3.svg.mouse(this);
	testDS.mouseMoved(m[0], m[1])
}

function mouseClicked()
{
	var m = d3.svg.mouse(this);
	testDS.mouseClicked(m[0], m[1]);
}

function distance(a, b) {
	var dx = a.x - b.x;
	var dy = a.y - b.y;
	return Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
}


function bgRect(d, dim) {
	return d.append('rect')
		.attr('cx', 0)
		.attr('cy', 0)
		.attr('width', dim.width)
		.attr('height', dim.height)
		.attr('class', 'back');
}



var plotArea = d3.select('#test-area')
						.append('svg')
						.attr('width', testDimension.width)
						.attr('height', testDimension.height)
        				.style('pointer-events', 'all')
        				.on('mousemove', mouseMoved)
        				.on('mousedown', mouseClicked)
        				.call(bgRect, testDimension);


// init code
testDS.updateTestAreaView();



// should probably go somewhere else though.
//testDS.active = false;
//testDS.createCirclePositions(15, 150, 10);

//d3.select('#sliderDistanceValue').text(testDS.testDSParameters.distance);
//d3.select('#sliderWidthValue').text(testDS.testDSParameters.width);
d3.select('#smallCirclesDistance').text(testDS.testDSParameters.distance);
d3.select('#smallCirclesWidth').text(testDS.testDSParameters.width);
testDS.addDataSet();


$('#addDataSetButton').click(function() {
	testDS.addDataSet();
	testDS.active = false;
});

$('#downloadDataSet').click(function() {
   var csvContent = '"Time","Distance","Width"\n';
            $.each(testDS.data[testDS.currentDataSet].data,function(i, datapoint){
                csvContent += '"'+datapoint.time+'","'+datapoint.distance+'","'+datapoint.width+'"\n';
            });
            window.open("data:text/csv;charset=UTF-8,"+encodeURIComponent(csvContent));  
});


function updateDist(){
testDS.testDSParameters.distance = document.querySelector('input[name = "selectedDistance"]:checked').value;
testDS.updateTestAreaView();
d3.select('#smallCirclesDistance').text(testDS.testDSParameters.distance);
d3.select('#smallCirclesWidth').text(testDS.testDSParameters.width);

}

function updateWidth(){
testDS.testDSParameters.width = document.querySelector('input[name = "selectedWidth"]:checked').value;
testDS.updateTestAreaView();
d3.select('#smallCirclesDistance').text(testDS.testDSParameters.distance);
d3.select('#smallCirclesWidth').text(testDS.testDSParameters.width);

}
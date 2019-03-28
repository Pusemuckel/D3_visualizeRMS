// define margins: ALWAYS first thing to do
var margin = {top: 50, right: 50 , bottom: 50, left: 50};

var width = 1800 - margin.left - margin.right,
    height = 1000 - margin.top - margin.bottom;

var svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


var x = d3.scaleLinear().range([0, width]);
var y = d3.scaleLinear().range([height, 0]);

var valueline = d3.line()
    .x(function(d) {return x(d.date); })
    .y(function(d) {return y(d.number); })
	;

// adding fancy rectangles
svg.append("rect")
    .attr("width", width)
    .attr("height", height)
    .attr("fill", "#5C5B5A");


// Get the data
d3.csv("data_emg.csv", function(error, data) {
    if (error) throw error;
    data.forEach(function(d) {
        d.date = +d.Time
        d.number = +d.LAT;
    });


// Scale the range of the data
x.domain(d3.extent(data, function(d) { return d.date; }));
y.domain([d3.min(data, function(d) {return d.number}), d3.max(data, function(d) { return d.number; })]);

// Setting the x-axis
svg.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x));
svg.append("text")
    .attr("x", width/2)
    .attr("y", height+40)
    .style("text-anchor", "middle")
    .text("Time [s]");

// Setting the y-axis
svg.append("g")
    .call(d3.axisLeft(y));
svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0-margin.left)
    .attr("x", 0 - (height / 2))
    .attr("dy", "1em")
    .style("text-anchor", "middle")
    .text("Value [uV]");

// Add the dataline
svg.append("path")
    .data([data])
    .attr("class", "line")
    .attr("stroke", 'B2737B')
    .attr("d", valueline)
	;
    //.attr("stroke-width", "2px");


});


function calcRMS(window) {
    d3.select("path.area").remove();
    d3.select("#rms").remove();

    var window = Number(d3.select("#nValue").property("value"));
    console.log(d3.select("#nValue").property("value"));
    console.log(typeof window)

    var rms = [];
    d3.csv("data_emg.csv", function(error, data) {
      if (error) throw error;
      data.forEach(function(d) {
          d.date = +d.Time
          d.number = +d.LAT
          rms.push(d.number);
      });


// Modifying the rms array to the real rms values
     for (var i=0; i<rms.length-window; i++) {
          const a = Math.sqrt((d3.sum(rms.slice(i, i+window).map(x => Math.pow(x,2)))) / window)
          rms[i] = a;

         }


  // var RMSline = d3.line()
  //     .x(function(d) {return x(d.date); })
  //     .y(function(d) {return y(d.number/3); });

  var RMSline = d3.line()
      .x(function(d) {return x(d.date); })
      .y(function(d, i) {return y(rms[i]);})

      // define the area; don't know why there is a 15 offset
    var area = d3.area()
        .x(function(d) { return x(d.date); })
        .y0(height-15-d3.max(data, function(d) { return d.number; }))
        .y1(function(d,i) { return y(rms[i]); });

  svg.append("path")
      .data([data])
      .attr("stroke", "#FFE4BE")
      .attr("fill-opacity", 0.0)
      .attr("stroke-opacity",1.0)
      .attr("stroke-width", "4px")
      .attr("id", "rms")
      .attr("d", RMSline)
	  .attr("stroke-dasharray", data.length + " " + data.length )
	  .attr("stroke-dashoffset", data.length)
		.transition()
		.duration(10000)
		.ease(d3.easeLinear)
		.attr("stroke-dashoffset", 0);

  svg.append("path")
    .data([data])
    .attr("class", "area")
    .attr("fill", '#07F63A')
    .attr("fill-opacity", 0.0)
    .attr("d", area)
	// .attr("stroke-dasharray", data.length + " " + data.length )
	// .attr("stroke-dashoffset", data.length)
		.transition()
		.duration(10000)
		.ease(d3.easeLinear)
		.attr("fill-opacity", 0.6);
	;

    });
};

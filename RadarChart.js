function drawRadarChart(data) {
    const myNode = document.getElementById("radarChartContainer");
    myNode.innerHTML = ''
    // set the dimensions and margins of the graph
    var margin = { top: 10, right: 30, bottom: 30, left: 60 },
        width = 460 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;

    let center = { x: width / 2, y: height / 2 }
    let numberOfIntervals = data.values.length
    let numberOfTicks = 3;

    // append the svg object to the body of the page
    var svg = d3.select("#radarChartContainer")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
    let angle = d3
        .scaleLinear()
        .range([0, 360])
        .domain([0, numberOfIntervals]);
    //lines from center
    svg.selectAll("radialLines")
        .data([...Array(numberOfIntervals).keys()])
        .enter()
        .append("line")
        .style("stroke", "black")
        .attr("x1", center.x)
        .attr("y1", center.y)
        .attr("x2", center.x)
        .attr("y2", 0)
        .attr("transform", (d) => `rotate(${angle(d)}, ${center.x}, ${center.y})`);
    //labels 
    console.log(data)
    let textDistance = center.y - 20
    svg.selectAll("text")
        .data([...Array(numberOfIntervals).keys()])
        .enter()
        .append("text")
        .attr("text-anchor", "middle")
        .text(d => data.labels[d])
        .attr("x", d => {
            let angle2 = ((2 * Math.PI / numberOfIntervals) * d) + Math.PI / 2;
            return center.x + Math.cos(angle2) * textDistance
        })
        .attr("y", d => {
            let angle2 = ((2 * Math.PI / numberOfIntervals) * d) + Math.PI / 2;
            return center.y - Math.sin(angle2) * textDistance
        })
    //lines at angle
    for (let i = 0; i < numberOfTicks; i++) {
        let distance = ((i + 1) / numberOfTicks) * center.y - 30;
        svg
            .selectAll(`radialLines_${i}`)
            .data([[...Array(numberOfIntervals).keys()]])
            .enter()
            .append("polygon")
            .style("fill", "none")
            .style("stroke", "black")
            .attr("points", function (d) {
                return d.map(function (d) {
                    let angle2 = ((2 * Math.PI / numberOfIntervals) * d) + Math.PI / 2;
                    let x1 = center.x + Math.cos(angle2) * distance
                    return [x1, center.y - Math.sin(angle2) * distance].join(",");
                }).join(" ");
            });
    }
    //data as polygon
    let maxLength = center.y - 50;
    let scale = d3
        .scaleLinear()
        .range([0, maxLength])
        .domain([0, data.max]);
    svg
        .selectAll(`dataLines`)
        .data([[...Array(numberOfIntervals).keys()]])
        .enter()
        .append("polygon")
        .style("fill", "green")
        .style("opacity", "0.4")
        .style("stroke", "black")
        .attr("points", function (d) {
            return d.map(function (d) {
                let angle2 = ((2 * Math.PI / numberOfIntervals) * d) + Math.PI / 2;
                let x1 = center.x + Math.cos(angle2) * scale(data.values[d])
                return [x1, center.y - Math.sin(angle2) * scale(data.values[d])].join(",");
            }).join(" ");
        });
}

function transformDataForRadar(data, numOfRanges, geo = lastCountry, year = 2019) {
    //numOfRanges = 3 splits [0-33, 33-66, 66-100+]
    console.log(`geo: ${geo}, year: ${year}`)
    let values = []
    let labels = []
    let ranges = [...Array(parseInt(numOfRanges)).keys()].map(num => {
        let borders = [(num * 100 / numOfRanges), (num * 100 / numOfRanges) + (100 / numOfRanges)];
        let people = data.filter(value => {
            let age = parseInt(value.AGE.split(" ")[0])
            return age >= borders[0] && age < borders[1] && value.GEO.startsWith(geo) && parseInt(value.TIME) == year
        }).map(entry => parseInt(entry.Value.replace(',', '')))
        let numberOfPeople = people.reduce((a, b) => a + b, 0)
        values.push(numberOfPeople)
        labels.push(`${borders[0].toFixed(2)} years to ${borders[1].toFixed(2)} years`)
    })
    let returnObj = {
        values: values,
        max: Math.max(...values),
        labels: labels
    }
    return returnObj
}

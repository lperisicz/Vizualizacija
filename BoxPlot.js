function drawBoxPlot(data) {
    const myNode = document.getElementById("boxPlotContainer");
    myNode.innerHTML = ''
    console.log("DRAW BOX PLOT")
    console.log(data)

    // set the dimensions and margins of the graph
    var margin = { top: 10, right: 30, bottom: 30, left: 40 },
        width = 460 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;

    // append the svg object to the body of the page
    var svg = d3.select("#boxPlotContainer")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

    // create a tooltip
    var Tooltip = d3.select("#boxPlotContainer")
        .append("div")
        .style("opacity", 0)
        .attr("class", "tooltip")
        .style("background-color", "white")
        .style("border", "solid")
        .style("border-width", "2px")
        .style("border-radius", "5px")
        .style("padding", "5px")

    // Three function that change the tooltip when user hover / move / leave a cell
    var mouseover = function (d) {
        Tooltip
            .style("opacity", 1)
    }
    var mousemove = function (d) {
        let text = "Data:<br>" +
            `min: ${formatNumber(d.value.min)}<br>` +
            `max: ${formatNumber(d.value.max)}<br>` +
            `q1: ${formatNumber(d.value.q1)}<br>` +
            `median: ${formatNumber(d.value.median)}<br>` +
            `q3: ${formatNumber(d.value.q3)}<br>`;
        Tooltip
            .html(text)
            .style("position", "absolute")
            .style("left", `${d3.mouse(this)[0] + 70}px`)
            .style("top", `${d3.mouse(this)[1]}px`);
    }
    var mouseleave = function (d) {
        Tooltip
            .style("opacity", 0)
    }

    // Read the data and compute summary statistics for each specie
    //d3.csv("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/iris.csv", function (data) {


    /*
    let returnObj = {
                    values: values,
                    country: geo
                }
    */
    console.log("Data:")
    console.log(data)

    // Compute quartiles, median, inter quantile range min and max --> these info are then used to draw the box.
    var sumstat = d3.nest() // nest function allows to group the calculation per level of a factor
        .key(function (d) { return data.country; })
        .rollup(function (d) {
            q1 = d3.quantile(d.sort(d3.ascending), .25)
            median = d3.quantile(d.sort(d3.ascending), .5)
            q3 = d3.quantile(d.sort(d3.ascending), .75)
            interQuantileRange = q3 - q1
            min = q1 - 1.5 * interQuantileRange
            max = q3 + 1.5 * interQuantileRange
            return ({ q1: q1, median: median, q3: q3, interQuantileRange: interQuantileRange, min: min, max: max })
        })
        .entries(data.values)

    // Show the X scale
    var x = d3.scaleBand()
        .range([0, width])
        .domain([data.country])
        .paddingInner(1)
        .paddingOuter(.5)
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x))

    // Show the Y scale
    var y = d3.scaleLinear()
        .domain([10, 60])
        .range([height, 0])
    svg.append("g").call(d3.axisLeft(y))

    // Show the main vertical line
    svg
        .selectAll("vertLines")
        .data(sumstat)
        .enter()
        .append("line")
        .attr("x1", function (d) { return (x(d.key)) })
        .attr("x2", function (d) { return (x(d.key)) })
        .attr("y1", function (d) { return (y(d.value.min)) })
        .attr("y2", function (d) { return (y(d.value.max)) })
        .attr("stroke", "black")
        .style("width", 40)
        .on("mouseover", mouseover)
        .on("mousemove", mousemove)
        .on("mouseleave", mouseleave)

    // rectangle for the main box
    var boxWidth = 50 //------> [width/SIZE(domene)] minus margine lijevo desno 
    svg
        .selectAll("boxes")
        .data(sumstat)
        .enter()
        .append("rect")
        .attr("x", function (d) { return (x(d.key) - boxWidth / 2) })
        .attr("y", function (d) { return (y(d.value.q3)) })
        .attr("height", function (d) { return (y(d.value.q1) - y(d.value.q3)) })
        .attr("width", boxWidth)
        .attr("stroke", "black")
        .style("fill", "#69b3a2")
        .on("mouseover", mouseover)
        .on("mousemove", mousemove)
        .on("mouseleave", mouseleave)

    // Show the median
    svg
        .selectAll("medianLines")
        .data(sumstat)
        .enter()
        .append("line")
        .attr("x1", function (d) { return (x(d.key) - boxWidth / 2) })
        .attr("x2", function (d) { return (x(d.key) + boxWidth / 2) })
        .attr("y1", function (d) { return (y(d.value.median)) })
        .attr("y2", function (d) { return (y(d.value.median)) })
        .attr("stroke", "black")
        .style("width", 80)
        .on("mouseover", mouseover)
        .on("mousemove", mousemove)
        .on("mouseleave", mouseleave)
    //})
}

function transformDataForBoxPlot(data, geo = "Croatia", ) {
    //numOfRanges = 3 splits [0-33, 33-66, 66-100+]
    console.log("STARTED")
    let year = 0, age = 0, value = null, values = [];
    let youngPeople = Array(81)
    let oldPeople = Array(81)
    for (let i = 0; i < data.length; i++) {
        value = data[i];
        year = parseInt(value.TIME)
        age = parseInt(value.AGE.split(" ")[0])
        if (value.GEO.startsWith(geo)) {
            if (age <= 65) {
                if (youngPeople[year - 2019]) {
                    youngPeople[year - 2019] += parseInt(value.Value.replace(',', ''))
                } else {
                    youngPeople[year - 2019] = parseInt(value.Value.replace(',', ''))
                }
            } else {
                if (oldPeople[year - 2019]) {
                    oldPeople[year - 2019] += parseInt(value.Value.replace(',', ''))
                } else {
                    oldPeople[year - 2019] = parseInt(value.Value.replace(',', ''))
                }
            }
        }
    }
    for (let i = 0; i < youngPeople.length; i++) {
        values.push(
            100 * oldPeople[i] / (oldPeople[i] + youngPeople[i])
        )
    }
    let returnObj = {
        values: values,
        country: geo
    }
    console.log("RETURN OBJ")
    console.log(returnObj)
    return returnObj
}
"use strict";
(function(){
    let data = ""
    let svgContainer = ""
    const measurements = {
        width: 850,
        height: 505,
        marginAll: 50
    }
    const colors = {
        "Bug": "#4E79A7",
        "Dark": "#A0CBE8",
        "Dragon": "#996633",
        "Electric": "#F28E2B",
        "Fairy": "#FFBE7D",
        "Fighting": "#59A14F",
        "Fire": "#8CD17D",
        "Flying": "#FF4D88",
        "Ghost": "#B6992D",
        "Grass": "#499894",
        "Ground": "#86BCB6",
        "Ice": "#FABFD2",
        "Normal": "#E15759",
        "Poison": "#FF9D9A",
        "Psychic": "#79706E",
        "Rock": "#FF99BB",
        "Steel": "#BAB0AC",
        "Water": "#D37295"
    }

    d3.csv("pokemon.csv")
      .then((csvData) => data = csvData)
      .then(() => makeScatterPlot())

    //This function provides the initial setup of the webpage and enables the dropdown button.
    function makeScatterPlot() {
        plot(data);
        document.getElementById("generation-dropdown").addEventListener("change" ,function() {
            changePlot(data);
        })
        document.getElementById("legendary-dropdown").addEventListener("change" ,function() {
            changePlot(data);
        })
    }

    //This is the main function for drawing axes, circles, and legends for imported data.
    //It takes data, the csv format of the pokemon's information, as parameter.
    function plot(data) {
        //Remove the former svg to blank page
        d3.select("svg").remove();
        //Add a new svg for the new scatterplot
        svgContainer = d3.select("body").append("svg")
            .attr('width', measurements.width)
            .attr('height', measurements.height);
        //Remove the former legends to blank
        let canvas = document.getElementById("legends");
        let ctx = canvas.getContext("2d");
        ctx.clearRect(0,0,canvas.width,canvas.height);

        let def = data.map((row) => parseInt(row["Sp. Def"]))
        let total = data.map((row) => parseInt(row["Total"]))
        const limits = findMinMax(def, total)
        let scaleX = d3.scaleLinear()
            .domain([limits.defMin - 20, limits.defMax])
            .range([50, 650])
        let scaleY = d3.scaleLinear()
            .domain([limits.totalMax, limits.totalMin - 50])
            .range([50, 450])
        drawAxes(scaleX, scaleY)
        plotData(data, scaleX, scaleY)
        let color = changeColor(data)
        addLegends(color)
        //Label the x-axis
        var xtext = svgContainer.append("text");
        var xtextLabels = xtext
                         .attr("x", 325)
                         .attr("y", 500)
                         .style("text-anchor", "center")
                         .text("Sp.Def")
        //Label the y-axis
        var ytext = svgContainer.append("text");
        var ytextLabels = ytext
                         .attr("transform", "rotate(-90)")
                         .attr("y", 15)
                         .attr("x", -275)
                         .style("text-anchor", "center")
                         .text("Total");
    }

    //This function changes the plot based on the new data provided by user through
    //selecting different legendary and generation.
    //It takes data, the csv format of the pokemon's information, as parameter.
    function changePlot(data) {
        let newData;
        let legendary = d3.select("#legendary-dropdown").node().value;
        let generation = d3.select("#generation-dropdown").node().value;
        if (legendary == 0) {
          newData = data;
        } else {
          newData = data.filter(function(d){return d["Legendary"]==legendary;});
        }
        if (generation == 0) {
          newData = newData;
        } else {
          newData = newData.filter(function(d){return d["Generation"]==generation});
        }
        plot(newData);
    }

    //This function returns an object named color with all type1 as the key and all colors
    //as the value in the provided data.
    //It takes data, the csv format of the pokemon's information, as parameter.
    function changeColor(data) {
        let color = colors;
        let type1 = data.map((row) => String(row["Type 1"]))
        let unique = [...new Set(type1)]
        let allColors = Object.keys(color);
        for (let i = 0; i < 18; i++) {
          if (unique.includes(allColors[i]) == false) {
              delete color[allColors[i]];
          }
        }
        return color;
    }

    //This function adds color legends to the webpage for better visualization.
    //It takes color, the object containning all type1 and color of plotted pokemons, as parameter.
    function addLegends(color) {
        let context = document.getElementById("legends").getContext("2d");
        let n = Object.keys(color).length;
        for (let i = 0; i < n; i += 1) {
          context.fillStyle = Object.values(colors)[i];
          context.fillRect(10, i*25, 20, 20);
          context.fillText(Object.keys(colors)[i], 40, i*25+15);
        }
    }

    //This function calculates and returns the min and max for provided parameters.
    //It takes def and total, arrays of numbers, as parameters.
    function findMinMax(def, total) {
        return {
            defMin: d3.min(def),
            defMax: d3.max(def),
            totalMin: d3.min(total),
            totalMax: d3.max(total)
        }
    }

    //This function draws x and y axes based on the wanted scale parameters.
    //It takes scaleX and scaleY as parameters.
    function drawAxes(scaleX, scaleY) {
        let xAxis = d3.axisBottom()
            .scale(scaleX)
        let yAxis = d3.axisLeft()
            .scale(scaleY)
        svgContainer.append('g')
            .attr('transform', 'translate(0,450)')
            .call(xAxis)
        svgContainer.append('g')
            .attr('transform', 'translate(50,0)')
            .call(yAxis)
    }

    //This function plots and adds the tooltips for all the pokemons in provided data.
    //It takes data, the csv format of the pokemon's information, scaleX and scaleY as parameters.
    function plotData(data, scaleX, scaleY) {
        const xMap = function(d) { return scaleX(+d["Sp. Def"]) }
        const yMap = function(d) { return scaleY(+d["Total"]) }

        var div = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);

        const circles = svgContainer.selectAll(".circle")
            .data(data)
            .enter()
            .append('circle')
                .attr('cx', xMap)
                .attr('cy', yMap)
                .attr('r', 10)
                .attr('fill', function(d) { return colors[d["Type 1"]];})
                .on("mouseover", function(d) {
                    div.transition()
                        .duration(200)
                        .style("opacity", .9);
                    div	.html(`
                              ${d["Name"]} </br>
                              ${d["Type 1"]} </br>
                              ${d["Type 2"]}
                              `)
                        .style("left", (d3.event.pageX) + "px") //capture the location of mouth
                        .style("top", (d3.event.pageY - 28) + "px");
                    })
                .on("mouseout", function(d) {
                    div.transition()
                        .duration(500)
                        .style("opacity", 0);
                });
    }
})()

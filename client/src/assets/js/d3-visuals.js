function run_choropleth() {

    console.log('test');
    // define margin and dimensions for svg
    var height = window.innerHeight,
        width = window.innerWidth,
        margin = {
            top: 20,
            bottom: 70,
            right: 50,
            left: 50
        };
    // create svg
    var svg = d3.select("div#choropleth")
        .append("svg")
        .attr("transform", "translate(0," + margin.top + ")")
        .attr("height", height - margin.top - margin.bottom)
        .attr("width", (width - margin.left - margin.right));
    //create color scale
    var color = d3.scaleQuantile()
        .range(colorbrewer.Reds[4]);
    // define tooltip
    var tip = d3.tip().attr('id', 'tooltip')
        //.offset([-20, 0])
        .style("color", "rgba(236, 236, 236)")
        .style("background", "rgba(71, 68, 68, 0.8)")
        .style("font-weight", "bold")
        .style("padding", "10px")
        .html(function(d) {
            if (games[d.properties.name] === undefined) {
                rating = 'N/A'
                user = 'N/A'
            } else {
                rating = games[d.properties.name][0]
                user = games[d.properties.name][1]
            }
            return "<strong>Country: </strong><span>" + d.properties.name + "</span></br>" +
                "<strong>Game: </strong><span>" + selectedGame + "</span></br>" +
                "<strong>Avg Rating: </strong><span>" + rating + "</span></br>" +
                "<strong>Number of Users: </strong><span>" + user + "</span>";
        });

    // define projection and path required for Choropleth
    var projection = d3.geoNaturalEarth();
    var path = d3.geoPath().projection(projection);

    // other global variables
    var world = d3.json("/assets/data/world_countries.json"),
        gameData = d3.csv("/assets/data/ratings-by-country.csv");

    Promise.all([
        // read files
        world,
        gameData
    ]).then(
        function(data) {
            ready(error = false, data[0], data[1])
        }
    );

    function ready(error, world, gameData) {
        if (error) throw error;
        // extract all unique games from gameData
        var dropdown_options = [];
        var games = {};
        for (i = 0; i < gameData.length; i++) {
            if (!dropdown_options.includes(gameData[i].Game)) {
                dropdown_options.push(gameData[i].Game)
                games[gameData[i].Game] = {}
            }
            games[gameData[i].Game][gameData[i].Country] = [parseFloat(gameData[i]["Average Rating"]), parseInt(gameData[i]["Number of Users"])]
            dropdown_options = dropdown_options.sort()
        };
        // append the game options to the dropdown
        var dropdown = d3.select("#gameDropdown")
            .selectAll("option")
            .data(dropdown_options)
            .enter()
            .append("option")
            .attr("value", function(option) {
                return option;
            })
            .text(function(option) {
                return option;
            });
        // event listener for the dropdown
        d3.select("#gameDropdown").on("change", function() {
            selectedGame = d3.select(this).property("value")
            createMapAndLegend(world, games, selectedGame)
        });
        // create Choropleth with default option and Call createMapAndLegend() with required arguments. 
        createMapAndLegend(world, games, selectedGame = dropdown_options[0])
    };

    // create a Choropleth and legend using the world and gameData arguments for a selectedGame
    // also update Choropleth and legend when a different game is selected from the dropdown
    function createMapAndLegend(world, gameData, selectedGame) {
        svg.selectAll('*').remove();
        games = gameData[selectedGame];
        g = [];
        for (i = 0; i < world.features.length; i++) {
            if (games[world.features[i].properties.name]) {
                g.push(games[world.features[i].properties.name][0])
            }
        };
        color.domain(g.sort(function(a, b) {
            return a - b
        }));

        svg.append("g")
            .attr("id", "countries")
            .selectAll("path")
            .data(world.features)
            .enter()
            .append("path")
            .attr("fill", function(d) {
                if (games[d.properties.name]) {
                    value = games[d.properties.name][0]
                } else {
                    value = 0
                }
                if (value === 0) {
                    return "grey"
                } else {
                    return color(value)
                }
            })
            .attr("stroke", "black")
            .attr("d", path)
            .on('mouseover', tip.show)
            .on('mousemove', function() {
                tip
                    .style("top", (d3.mouse(this)[1] + 100) + "px")
                    .style("left", (d3.mouse(this)[0] + 20) + "px")
            })
            .on('mouseout', tip.hide);


        svg.append("g")
            .attr("id", "legend")
            .attr("transform", "translate(" + (width / 2 + margin.right + margin.left + 50) + ",20)");

        var legend = d3.legendColor()
            .labelFormat(d3.format(".2f"))
            .scale(color);

        svg.select("#legend")
            .call(legend);

        svg.call(tip);
    }
};

function run_node() {
    d3.dsv(",", "assets/data/board_games.csv", function(d) {
        return {
            source: d.source,
            target: d.target,
            value: +d.value
        }
    }).then(function(data) {

        var links = data;

        var nodes = {};

        var myScale = d3.scaleLinear()
            .domain([0, ]);

        // compute the distinct nodes from the links.
        links.forEach(function(link) {
            link.source = nodes[link.source] || (nodes[link.source] = {
                name: link.source
            });
            link.target = nodes[link.target] || (nodes[link.target] = {
                name: link.target
            });
        });

        var width = window.innerWidth,
            height = window.innerHeight;

        var color = d3.scaleSequential().domain([1, 10]).interpolator(d3.interpolatePuBuGn);

        var force = d3.forceSimulation()
            .nodes(d3.values(nodes))
            .force("link", d3.forceLink(links).distance(100))
            .force('center', d3.forceCenter(width / 2, height / 2))
            .force("x", d3.forceX())
            .force("y", d3.forceY())
            .force("charge", d3.forceManyBody().strength(-250))
            .alphaTarget(1)
            .on("tick", tick);

        var svg = d3.select("div#node").append("svg")
            .attr("width", width)
            .attr("height", height);

        // add the links
        var path = svg.append("g")
            .selectAll("path")
            .data(links)
            .enter()
            .append("path")
            .attr("class", function(d) {
                return "link " + d.type;
            })
            .style("stroke", function(d) {
                if (d.value < 1) {
                    return 'gray'
                } else {
                    return 'green'
                }
            })
            .style("stroke-width", function(d) {
                if (d.value < 1) {
                    return 5
                } else {
                    return 1
                }
            })
            .style("stroke-dasharray", function(d) {
                if (d.value >= 1) {
                    return ("10,3")
                }
            });

        // define the nodes
        var node = svg.selectAll(".node")
            .data(force.nodes())
            .enter().append("g")
            .attr("class", "node")
            .call(d3.drag()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended));

        var myScale = d3.scaleLinear()
            .domain([0, 20])
            .range([5, 15]);
        // add the nodes
        node.append("circle")
            .attr("id", function(d) {
                return (d.name.replace(/\s+/g, '').toLowerCase());
            })
            .attr("r", function(d) {
                d.weight = path.filter(function(l) {
                    return l.source.index == d.index || l.target.index == d.index
                }).size();
                var minRadius = 10;
                return myScale(minRadius + (d.weight * 2));
            })
            .style("fill", function(d) {
                return color(d.weight);
            })
            .on("dblclick", function(d) {
                d.fixed = false;
                d.fx = null;
                d.fy = null;
                d3.select(this).style("fill", function(d) {
                    return color(d.weight);
                })
            });

        // add text
        node.append("text")
            .attr('dx', '15px')
            .style('font-weight', 'bold')
            .text(function(d) {
                return d.name
            });

        // add the curvy lines
        function tick() {
            path.attr("d", function(d) {
                var dx = d.target.x - d.source.x,
                    dy = d.target.y - d.source.y,
                    dr = Math.sqrt(dx * dx + dy * dy);
                return "M" +
                    d.source.x + "," +
                    d.source.y + "A" +
                    dr + "," + dr + " 0 0,1 " +
                    d.target.x + "," +
                    d.target.y;
            });

            node.attr("transform", function(d) {
                return "translate(" + d.x + "," + d.y + ")";
            });
        };

        function dragstarted(d) {
            if (!d3.event.active) force.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
        };

        function dragged(d) {
            d.fx = d3.event.x;
            d.fy = d3.event.y;
            d.fixed = true;
        };

        function dragended(d) {
            if (!d3.event.active) force.alphaTarget(0);
            if (d.fixed == true) {
                d.fx = d.x;
                d.fy = d.y;
                d3.select(this).select("circle").style("fill", "red");
            } else {
                d.fx = null;
                d.fy = null;
            }
        };

    }).catch(function(error) {
        console.log(error);
    });
};

function run_line() {
    //setup dimensions
    var height = window.innerHeight - 100,
        width = window.innerWidth,
        margin = {
            top: 50,
            bottom: 50,
            right: 50,
            left: 50
        };

    //data
    var games = ['Catan', 'Dominion', 'Codenames', 'Terraforming Mars', 'Gloomhaven', 'Magic: The Gathering', 'Dixit', 'Monopoly']
    const timeConv = d3.timeFormat("%b %y");
    const dateParse = d3.timeParse("%Y-%m-%d");
    var dataset = d3.dsv(",", "assets/data/boardgame_ratings.csv", function(d) {
        return {
            date: dateParse(d.date),
            catan_count: +d["Catan=count"],
            catan_rank: +d["Catan=rank"],
            dominion_count: +d["Dominion=count"],
            dominion_rank: +d["Dominion=rank"],
            codenames_count: +d["Codenames=count"],
            codenames_rank: +d["Codenames=rank"],
            mars_count: +d["Terraforming Mars=count"],
            mars_rank: +d["Terraforming Mars=rank"],
            gloomhaven_count: +d["Gloomhaven=count"],
            gloomhaven_rank: +d["Gloomhaven=rank"],
            magic_count: +d["Magic: The Gathering=count"],
            magic_rank: +d["Magic: The Gathering=rank"],
            dixit_count: +d["Dixit=count"],
            dixit_rank: +d["Dixit=rank"],
            monopoly_count: +d["Monopoly=count"],
            monopoly_rank: +d["Monopoly=rank"]
        }
    });

    //-----------chart a -----------------------------
    //create svg
    var svg = d3.selectAll("div#container")
        .append("svg")
        .attr("id", "svg-a")
        .attr("height", height)
        .attr("width", width - margin.left - margin.right - 30)
        .attr("transform", "translate(" + (margin.left) + "," + margin.top + ")")
        .append("g")
        .attr("id", "plot-a")
        .attr("transform", "translate(" + (margin.left + 20) + "," + 20 + ")")
    svg.append("text")
        .attr("id", "title-a")
        .attr("y", 0 - 10)
        .attr("transform", "translate(" + (width / 2 - margin.left - margin.right) + "," + 20 + ")")
        .attr("text-anchor", "middle")
        .style("font-size", "14px")
        .text("Number of Ratings 2016-2020");

    dataset.then(function(data) {
        var gameData = {
            0: {
                id: 'Catan',
                values: data.map(function(id, i) {
                    return {
                        date: id.date,
                        count: id.catan_count,
                        rank: id.catan_rank
                    }
                })
            },
            1: {
                id: 'Dominion',
                values: data.map(function(id, i) {
                    return {
                        date: id.date,
                        count: id.dominion_count,
                        rank: id.dominion_rank
                    }
                })
            },
            2: {
                id: 'Codenames',
                values: data.map(function(id, i) {
                    return {
                        date: id.date,
                        count: id.codenames_count,
                        rank: id.codenames_rank
                    }
                })
            },
            3: {
                id: 'Terraforming Mars',
                values: data.map(function(id, i) {
                    return {
                        date: id.date,
                        count: id.mars_count,
                        rank: id.mars_rank
                    }
                })
            },
            4: {
                id: 'Gloomhaven',
                values: data.map(function(id, i) {
                    return {
                        date: id.date,
                        count: id.gloomhaven_count,
                        rank: id.gloomhaven_rank
                    }
                })
            },
            5: {
                id: 'Magic: The Gathering',
                values: data.map(function(id, i) {
                    return {
                        date: id.date,
                        count: id.magic_count,
                        rank: id.magic_rank
                    }
                })
            },
            6: {
                id: 'Dixit',
                values: data.map(function(id, i) {
                    return {
                        date: id.date,
                        count: id.dixit_count,
                        rank: id.dixit_rank
                    }
                })
            },
            7: {
                id: 'Monopoly',
                values: data.map(function(id, i) {
                    return {
                        date: id.date,
                        count: id.monopoly_count,
                        rank: id.monopoly_rank
                    }
                })
            }
        };

        //colors
        var color = d3.scaleOrdinal(d3.schemeCategory10);

        //scales
        var xscale = d3.scaleTime()
            .domain(d3.extent(data, function(d) {
                return d.date;
            }))
            .range([0, (width - (margin.right * 4) - (margin.left * 4))]);

        var yscale = d3.scaleLinear()
            .domain([0, d3.max(d3.values(gameData), (d) => {
                return d3.max(d.values, (dd) => {
                    return dd.count;
                });
            })])
            .range([(height - margin.bottom - margin.top), 0]);

        //axes
        var xaxis = d3.axisBottom()
            .ticks(d3.timeMonth.every(3))
            .tickFormat(timeConv)
            .scale(xscale);

        var yaxis = d3.axisLeft()
            .scale(yscale);

        //add x axis
        svg.append("g")
            .attr("class", "axis")
            .attr("id", "x-axis-a")
            .attr("transform", "translate(0," + (height - margin.top - margin.bottom) + ")")
            .call(xaxis)
            //label
            .append("text")
            .attr("x", (width / 3 + margin.left + margin.right))
            .attr("y", 50)
            .style("text-anchor", "middle")
            .text("Month");


        //add y axis
        svg.append("g")
            .attr("class", "axis")
            .attr("id", "y-axis-a")
            .call(yaxis)
            //label
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr("dy", ".5em")
            .attr("y", -60)
            .attr("x", -(height / 3 + margin.top))
            .style("text-anchor", "end")
            .text("Num of Ratings");

        //line
        const line = d3.line()
            .x(function(d) {
                return xscale(d.date);
            })
            .y(function(d) {
                return yscale(d.count);
            });

        let id = 0;
        const ids = function() {
            return d3.schemeCategory10[id++];
        };

        //add lines
        var g = svg.append("g");

        Object.keys(gameData).forEach((key) => g
            .attr("id", "lines-a")
            .append("path")
            .datum(gameData[key].values)
            .attr('fill', 'none')
            .style("stroke", function(d, i) {
                return color(key)
            })
            .attr('stroke-width', 1.5)
            .attr("d", line)

        );
        //add labels for lines
        Object.keys(gameData).forEach((key) =>
            g.append("text")
            .datum(gameData[key])
            .attr("class", "label")
            .attr("x", (width - margin.right - 340))
            .attr("y", function(d) {
                return yscale(d.values[d.values.length - 1].count)
            })
            .attr("dy", ".35em")
            .attr("text-anchor", "start")
            .style("fill", ids)
            .text(function(d) {
                return d.id
            })
        );
    });


    //-----------chart b -----------------------------
    //create svg
    var svgb = d3.selectAll("div#container")
        .append("svg")
        .attr("id", "svg-b")
        .attr("height", height)
        .attr("width", width - margin.left - margin.right - 30)
        .attr("transform", "translate(" + (margin.left) + "," + margin.top + ")")
        .append("g")
        .attr("id", "plot-b")
        .attr("transform", "translate(" + (margin.left + 20) + "," + 20 + ")")
    svgb.append("text")
        .attr("id", "title-b")
        .attr("y", 0 - 10)
        .attr("transform", "translate(" + (width / 2 - margin.left - margin.right) + "," + 20 + ")")
        .attr("text-anchor", "middle")
        .style("font-size", "14px")
        .text("Number of Ratings 2016-2020 with Rankings");

    dataset.then(function(data) {
        var gameData = {
            0: {
                id: 'Catan',
                values: data.map(function(id, i) {
                    return {
                        date: id.date,
                        count: id.catan_count,
                        rank: id.catan_rank
                    }
                })
            },
            1: {
                id: 'Dominion',
                values: data.map(function(id, i) {
                    return {
                        date: id.date,
                        count: id.dominion_count,
                        rank: id.dominion_rank
                    }
                })
            },
            2: {
                id: 'Codenames',
                values: data.map(function(id, i) {
                    return {
                        date: id.date,
                        count: id.codenames_count,
                        rank: id.codenames_rank
                    }
                })
            },
            3: {
                id: 'Terraforming Mars',
                values: data.map(function(id, i) {
                    return {
                        date: id.date,
                        count: id.mars_count,
                        rank: id.mars_rank
                    }
                })
            },
            4: {
                id: 'Gloomhaven',
                values: data.map(function(id, i) {
                    return {
                        date: id.date,
                        count: id.gloomhaven_count,
                        rank: id.gloomhaven_rank
                    }
                })
            },
            5: {
                id: 'Magic: The Gathering',
                values: data.map(function(id, i) {
                    return {
                        date: id.date,
                        count: id.magic_count,
                        rank: id.magic_rank
                    }
                })
            },
            6: {
                id: 'Dixit',
                values: data.map(function(id, i) {
                    return {
                        date: id.date,
                        count: id.dixit_count,
                        rank: id.dixit_rank
                    }
                })
            },
            7: {
                id: 'Monopoly',
                values: data.map(function(id, i) {
                    return {
                        date: id.date,
                        count: id.monopoly_count,
                        rank: id.monopoly_rank
                    }
                })
            }
        };

        //colors
        var color = d3.scaleOrdinal(d3.schemeCategory10);

        //scales
        var xscale = d3.scaleTime()
            .domain(d3.extent(data, function(d) {
                return d.date;
            }))
            .range([0, (width - (margin.right * 4) - (margin.left * 4))]);

        var yscale = d3.scaleLinear()
            .domain([0, d3.max(d3.values(gameData), (d) => {
                return d3.max(d.values, (dd) => {
                    return dd.count;
                });
            })])
            .range([(height - margin.bottom - margin.top), 0]);

        //axes
        var xaxis = d3.axisBottom()
            .ticks(d3.timeMonth.every(3))
            .tickFormat(timeConv)
            .scale(xscale);

        var yaxis = d3.axisLeft()
            .scale(yscale);

        //add x axis
        svgb.append("g")
            .attr("class", "axis")
            .attr("id", "x-axis-b")
            .attr("transform", "translate(0," + (height - margin.top - margin.bottom) + ")")
            .call(xaxis)
            //label
            .append("text")
            .attr("x", (width / 3 + margin.left + margin.right))
            .attr("y", 50)
            .style("text-anchor", "middle")
            .text("Month");


        //add y axis
        svgb.append("g")
            .attr("class", "axis")
            .attr("id", "y-axis-b")
            .call(yaxis)
            //label
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr("dy", ".5em")
            .attr("y", -60)
            .attr("x", -(height / 3 + margin.top))
            .style("text-anchor", "end")
            .text("Num of Ratings");

        //line
        const line = d3.line()
            .x(function(d) {
                return xscale(d.date);
            })
            .y(function(d) {
                return yscale(d.count);
            });

        let id = 0;
        const ids = function() {
            return d3.schemeCategory10[id++];
        };

        //add lines
        var g = svgb.append("g")
            .attr("id", "lines-b");

        Object.keys(gameData).forEach((key) => g
            .append("path")
            .datum(gameData[key].values)
            .attr('fill', 'none')
            .style("stroke", function(d, i) {
                return color(key)
            })
            .attr('stroke-width', 1.5)
            .attr("d", line)
        );

        var dots = svgb.append("g")
            .attr("id", "symbols-b");

        //add dots
        var gs = ['Catan', 'Codenames', 'Terraforming Mars', 'Gloomhaven']

        Object.keys(gameData).forEach((key) =>
            dots.selectAll("#symbols-b")
            .data(gameData[key].values.filter(function(d, i) {
                if (gs.includes(gameData[key].id)) {
                    j = i + 1
                    if (j % 3 === 0 && j !== 0) {
                        return d
                    }
                }
            }))
            .enter().append("circle")
            .attr("class", "dot")
            .attr("cx", function(d) {
                return xscale(d.date)
            })
            .attr("cy", function(d) {
                return yscale(d.count)
            })
            .style("fill", function(d, i) {
                return color(key)
            })
            .attr("r", 12)
        );

        //dot labels
        Object.keys(gameData).forEach((key) =>
            dots.selectAll("#symbols-b")
            .data(gameData[key].values.filter(function(d, i) {
                if (gs.includes(gameData[key].id)) {
                    j = i + 1
                    if (j % 3 === 0 && j !== 0) {
                        return d
                    }
                }
            }))
            .enter().append("text")
            .style("stroke", "white")
            .style("font-size", 8)
            .attr("x", function(d) {
                return xscale(d.date)
            })
            .attr("y", function(d) {
                return yscale(d.count) + 2
            })
            .attr("text-anchor", "middle")
            .text(function(d) {
                return d.rank
            })
        );

        //add labels for lines
        Object.keys(gameData).forEach((key) =>
            g.append("text")
            .datum(gameData[key])
            .attr("class", "label")
            .attr("x", (width - margin.right - 330))
            .attr("y", function(d) {
                return yscale(d.values[d.values.length - 1].count)
            })
            .attr("dy", ".35em")
            .attr("text-anchor", "start")
            .style("fill", ids)
            .text(function(d) {
                return d.id
            })
        );

        var legend = svgb.append("g")
            .attr("id", "legend-b")

        legend.append("circle")
            .attr("transform", "translate(" + (width - margin.left * 5 - margin.right) + "," + (height - margin.top - margin.bottom - 30) + ")")
            .style("fill", "black")
            .attr("r", 15)
            .selectAll(".legend")
        legend.append("text")
            .attr("class", "legend")
            .attr("transform", "translate(" + (width - margin.left * 5 - margin.right) + "," + (height - margin.top - margin.bottom - 30) + ")")
            .style("fill", "white")
            .style("font-size", 10)
            .attr("text-anchor", "middle")
            .text("rank")
        legend.append("text")
            .attr("transform", "translate(" + (width - margin.left * 6 - margin.right) + "," + (height - margin.top - margin.bottom) + ")")
            .style("font-size", 10)
            .text("BoardGameGeek Rank")
    });


    //-----------chart c1 -----------------------------
    //create svg
    var svgc1 = d3.selectAll("div#container")
        .append("svg")
        .attr("id", "svg-c-1")
        .attr("height", height)
        .attr("width", width - margin.left - margin.right - 30)
        .attr("transform", "translate(" + (margin.left) + "," + margin.top + ")")
        .append("g")
        .attr("id", "plot-c-1")
        .attr("transform", "translate(" + (margin.left + 20) + "," + 20 + ")")
    svgc1.append("text")
        .attr("id", "title-c-1")
        .attr("y", 0 - 10)
        .attr("transform", "translate(" + (width / 2 - margin.left - margin.right) + "," + 20 + ")")
        .attr("text-anchor", "middle")
        .style("font-size", "14px")
        .text("Number of Ratings 2016-2020 (Square root Scale)");

    dataset.then(function(data) {
        var gameData = {
            0: {
                id: 'Catan',
                values: data.map(function(id, i) {
                    return {
                        date: id.date,
                        count: id.catan_count,
                        rank: id.catan_rank
                    }
                })
            },
            1: {
                id: 'Dominion',
                values: data.map(function(id, i) {
                    return {
                        date: id.date,
                        count: id.dominion_count,
                        rank: id.dominion_rank
                    }
                })
            },
            2: {
                id: 'Codenames',
                values: data.map(function(id, i) {
                    return {
                        date: id.date,
                        count: id.codenames_count,
                        rank: id.codenames_rank
                    }
                })
            },
            3: {
                id: 'Terraforming Mars',
                values: data.map(function(id, i) {
                    return {
                        date: id.date,
                        count: id.mars_count,
                        rank: id.mars_rank
                    }
                })
            },
            4: {
                id: 'Gloomhaven',
                values: data.map(function(id, i) {
                    return {
                        date: id.date,
                        count: id.gloomhaven_count,
                        rank: id.gloomhaven_rank
                    }
                })
            },
            5: {
                id: 'Magic: The Gathering',
                values: data.map(function(id, i) {
                    return {
                        date: id.date,
                        count: id.magic_count,
                        rank: id.magic_rank
                    }
                })
            },
            6: {
                id: 'Dixit',
                values: data.map(function(id, i) {
                    return {
                        date: id.date,
                        count: id.dixit_count,
                        rank: id.dixit_rank
                    }
                })
            },
            7: {
                id: 'Monopoly',
                values: data.map(function(id, i) {
                    return {
                        date: id.date,
                        count: id.monopoly_count,
                        rank: id.monopoly_rank
                    }
                })
            }
        };

        //colors
        var color = d3.scaleOrdinal(d3.schemeCategory10);

        //scales
        var xscale = d3.scaleTime()
            .domain(d3.extent(data, function(d) {
                return d.date;
            }))
            .range([0, (width - (margin.right * 4) - (margin.left * 4))]);

        var yscale = d3.scaleSqrt()
            .domain([0, d3.max(d3.values(gameData), (d) => {
                return d3.max(d.values, (dd) => {
                    return dd.count;
                });
            })])
            .range([(height - margin.bottom - margin.top), 0]);

        //axes
        var xaxis = d3.axisBottom()
            .ticks(d3.timeMonth.every(3))
            .tickFormat(timeConv)
            .scale(xscale);

        var yaxis = d3.axisLeft()
            .scale(yscale);

        //add x axis
        svgc1.append("g")
            .attr("class", "axis")
            .attr("id", "x-axis-c-1")
            .attr("transform", "translate(0," + (height - margin.top - margin.bottom) + ")")
            .call(xaxis)
            //label
            .append("text")
            .attr("x", (width / 3 + margin.left + margin.right))
            .attr("y", 50)
            .style("text-anchor", "middle")
            .text("Month");


        //add y axis
        svgc1.append("g")
            .attr("class", "axis")
            .attr("id", "y-axis-c-1")
            .call(yaxis)
            //label
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr("dy", ".5em")
            .attr("y", -60)
            .attr("x", -(height / 3 + margin.top))
            .style("text-anchor", "end")
            .text("Num of Ratings");

        //line
        const line = d3.line()
            .x(function(d) {
                return xscale(d.date);
            })
            .y(function(d) {
                return yscale(d.count);
            });

        let id = 0;
        const ids = function() {
            return d3.schemeCategory10[id++];
        };

        //add lines
        var g = svgc1.append("g")
            .attr("id", "lines-c-1");

        Object.keys(gameData).forEach((key) => g
            .append("path")
            .datum(gameData[key].values)
            .attr('fill', 'none')
            .style("stroke", function(d, i) {
                return color(key)
            })
            .attr('stroke-width', 1.5)
            .attr("d", line)
        );

        var dots = svgc1.append("g")
            .attr("id", "symbols-c-1");

        //add dots
        var gs = ['Catan', 'Codenames', 'Terraforming Mars', 'Gloomhaven'];

        Object.keys(gameData).forEach((key) =>
            dots.selectAll("#symbols-c-1")
            .data(gameData[key].values.filter(function(d, i) {
                if (gs.includes(gameData[key].id)) {
                    j = i + 1
                    if (j % 3 === 0 && j !== 0) {
                        return d
                    }
                }
            }))
            .enter().append("circle")
            .attr("class", "dot")
            .attr("cx", function(d) {
                return xscale(d.date)
            })
            .attr("cy", function(d) {
                return yscale(d.count)
            })
            .style("fill", function(d, i) {
                return color(key)
            })
            .attr("r", 12)
        );

        //dot labels
        Object.keys(gameData).forEach((key) =>
            dots.selectAll("#symbols-c-1")
            .data(gameData[key].values.filter(function(d, i) {
                if (gs.includes(gameData[key].id)) {
                    j = i + 1
                    if (j % 3 === 0 && j !== 0) {
                        return d
                    }
                }
            }))
            .enter().append("text")
            .attr("class", "dlabel")
            .style("stroke", "white")
            .style("font-size", 8)
            .attr("x", function(d) {
                return xscale(d.date)
            })
            .attr("y", function(d) {
                return yscale(d.count) + 2
            })
            .attr("text-anchor", "middle")
            .text(function(d) {
                return d.rank
            })
        );

        //add labels for lines
        Object.keys(gameData).forEach((key) =>
            g.append("text")
            .datum(gameData[key])
            .attr("class", "label")
            .attr("x", (width - margin.right - 330))
            .attr("y", function(d) {
                return yscale(d.values[d.values.length - 1].count)
            })
            .attr("dy", ".35em")
            .attr("text-anchor", "start")
            .style("fill", ids)
            .text(function(d) {
                return d.id
            })
        );

        var legend = svgc1.append("g")
            .attr("id", "legend-c-1")

        legend.append("circle")
            .attr("transform", "translate(" + (width - margin.left * 5 - margin.right) + "," + (height - margin.top - margin.bottom - 30) + ")")
            .style("fill", "black")
            .attr("r", 15)
            .selectAll(".legend")
        legend.append("text")
            .attr("class", "legend")
            .attr("transform", "translate(" + (width - margin.left * 5 - margin.right) + "," + (height - margin.top - margin.bottom - 30) + ")")
            .style("fill", "white")
            .style("font-size", 10)
            .attr("text-anchor", "middle")
            .text("rank")
        legend.append("text")
            .attr("transform", "translate(" + (width - margin.left * 6 - margin.right) + "," + (height - margin.top - margin.bottom) + ")")
            .style("font-size", 10)
            .text("BoardGameGeek Rank")
    });



    //-----------chart c2 -----------------------------
    //create svg
    var svgc2 = d3.selectAll("div#container")
        .append("svg")
        .attr("id", "svg-c-2")
        .attr("height", height + 50)
        .attr("width", width - margin.left - margin.right - 30)
        .attr("transform", "translate(" + (margin.left) + "," + margin.top + ")");

    svgc2.append("text")
        .attr("id", "title-c-2")
        .attr("y", 0 - 10)
        .attr("transform", "translate(" + (width / 2 - margin.left - margin.right) + "," + 30 + ")")
        .attr("text-anchor", "middle")
        .style("font-size", "14px")
        .text("Number of Ratings 2016-2020 (Log Scale)");

    var plot = svgc2.append("g")
        .attr("id", "plot-c-2")
        .attr("transform", "translate(" + (margin.left + 20) + "," + (margin.top) + ")");


    dataset.then(function(data) {
        var gameData = {
            0: {
                id: 'Catan',
                values: data.map(function(id, i) {
                    return {
                        date: id.date,
                        count: id.catan_count,
                        rank: id.catan_rank
                    }
                })
            },
            1: {
                id: 'Dominion',
                values: data.map(function(id, i) {
                    return {
                        date: id.date,
                        count: id.dominion_count,
                        rank: id.dominion_rank
                    }
                })
            },
            2: {
                id: 'Codenames',
                values: data.map(function(id, i) {
                    return {
                        date: id.date,
                        count: id.codenames_count,
                        rank: id.codenames_rank
                    }
                })
            },
            3: {
                id: 'Terraforming Mars',
                values: data.map(function(id, i) {
                    return {
                        date: id.date,
                        count: id.mars_count,
                        rank: id.mars_rank
                    }
                })
            },
            4: {
                id: 'Gloomhaven',
                values: data.map(function(id, i) {
                    return {
                        date: id.date,
                        count: id.gloomhaven_count,
                        rank: id.gloomhaven_rank
                    }
                })
            },
            5: {
                id: 'Magic: The Gathering',
                values: data.map(function(id, i) {
                    return {
                        date: id.date,
                        count: id.magic_count,
                        rank: id.magic_rank
                    }
                })
            },
            6: {
                id: 'Dixit',
                values: data.map(function(id, i) {
                    return {
                        date: id.date,
                        count: id.dixit_count,
                        rank: id.dixit_rank
                    }
                })
            },
            7: {
                id: 'Monopoly',
                values: data.map(function(id, i) {
                    return {
                        date: id.date,
                        count: id.monopoly_count,
                        rank: id.monopoly_rank
                    }
                })
            }
        };

        //colors
        var color = d3.scaleOrdinal(d3.schemeCategory10);

        //scales
        var xscale = d3.scaleTime()
            .domain(d3.extent(data, function(d) {
                return d.date;
            }))
            .range([0, (width - (margin.right * 4) - (margin.left * 4))]);

        var yscale = d3.scaleLog()
            .domain([1, d3.max(d3.values(gameData), (d) => {
                return d3.max(d.values, (dd) => {
                    return dd.count;
                });
            })])
            .range([(height - margin.bottom - margin.top), 0]);

        //axes
        var xaxis = d3.axisBottom()
            .ticks(d3.timeMonth.every(3))
            .tickFormat(timeConv)
            .scale(xscale);

        var yaxis = d3.axisLeft()
            .scale(yscale);

        //add x axis
        plot.append("g")
            .attr("class", "axis")
            .attr("id", "x-axis-c-2")
            .attr("transform", "translate(0," + (height - margin.top - margin.bottom) + ")")
            .call(xaxis)
            //label
            .append("text")
            .attr("x", (width / 3 + margin.left + margin.right))
            .attr("y", 50)
            .style("text-anchor", "middle")
            .text("Month");


        //add y axis
        plot.append("g")
            .attr("class", "axis")
            .attr("id", "y-axis-c-2")
            .call(yaxis)
            //label
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr("dy", ".5em")
            .attr("y", -60)
            .attr("x", -(height / 3 + margin.top))
            .style("text-anchor", "end")
            .text("Num of Ratings");

        //line
        const line = d3.line()
            .x(function(d) {
                return xscale(d.date);
            })
            .y(function(d) {
                return yscale(d.count);
            });

        let id = 0;
        const ids = function() {
            return d3.schemeCategory10[id++];
        };

        //add lines
        var g = plot.append("g")
            .attr("id", "lines-c-2");

        Object.keys(gameData).forEach((key) => g
            .append("path")
            .datum(gameData[key].values)
            .attr('fill', 'none')
            .style("stroke", function(d, i) {
                return color(key)
            })
            .attr('stroke-width', 1.5)
            .attr("d", line)
        );

        var dots = plot.append("g")
            .attr("id", "symbols-c-2");

        //add dots
        var gs = ['Catan', 'Codenames', 'Terraforming Mars', 'Gloomhaven'];

        Object.keys(gameData).forEach((key) =>
            dots.selectAll("#symbols-c-2")
            .data(gameData[key].values.filter(function(d, i) {
                if (gs.includes(gameData[key].id)) {
                    j = i + 1
                    if (j % 3 === 0 && j !== 0) {
                        return d
                    }
                }
            }))
            .enter().append("circle")
            .attr("class", "dot")
            .attr("cx", function(d) {
                return xscale(d.date)
            })
            .attr("cy", function(d) {
                return yscale(d.count)
            })
            .style("fill", function(d, i) {
                return color(key)
            })
            .attr("r", 12)
        );

        //dot labels
        Object.keys(gameData).forEach((key) =>
            dots.selectAll("#symbols-c-2")
            .data(gameData[key].values.filter(function(d, i) {
                if (gs.includes(gameData[key].id)) {
                    j = i + 1
                    if (j % 3 === 0 && j !== 0) {
                        return d
                    }
                }
            }))
            .enter().append("text")
            .style("stroke", "white")
            .style("font-size", 8)
            .attr("x", function(d) {
                return xscale(d.date)
            })
            .attr("y", function(d) {
                return yscale(d.count) + 2
            })
            .attr("text-anchor", "middle")
            .text(function(d) {
                return d.rank
            })
        );

        //add labels for lines
        Object.keys(gameData).forEach((key) =>
            g.append("text")
            .datum(gameData[key])
            .attr("class", "label")
            .attr("x", (width - margin.right - 330))
            .attr("y", function(d) {
                return yscale(d.values[d.values.length - 1].count)
            })
            .attr("dy", ".35em")
            .attr("text-anchor", "start")
            .style("fill", ids)
            .text(function(d) {
                return d.id
            })
        );

        var legend = plot.append("g")
            .attr("id", "legend-c-2");

        legend.append("circle")
            .attr("transform", "translate(" + (width - margin.left * 5 - margin.right) + "," + (height - margin.top - margin.bottom - 30) + ")")
            .style("fill", "black")
            .attr("r", 15)
            .selectAll(".legend")
        legend.append("text")
            .attr("class", "legend")
            .attr("transform", "translate(" + (width - margin.left * 5 - margin.right) + "," + (height - margin.top - margin.bottom - 30) + ")")
            .style("fill", "white")
            .style("font-size", 10)
            .attr("text-anchor", "middle")
            .text("rank")
        legend.append("text")
            .attr("transform", "translate(" + (width - margin.left * 6 - margin.right) + "," + (height - margin.top - margin.bottom) + ")")
            .style("font-size", 10)
            .text("BoardGameGeek Rank");


    });
}
'use strict';
var app = app || {};

(function() {
    var chartHelper = {};
    var donutData = {
        labels: [
            "Carbs",
            "Protein",
            "Fat"
        ],
        datasets: [{
            data: [], //actual data to update
            backgroundColor: [
                "#4bc0c0",
                "#e6e6e6",
                "#a2a2a2"
            ]
        }]
    };
    var donutConfig = {
        type: 'doughnut',
        data: donutData,
        options: {
            events: false,
            responsive: false,
            maintainAspectRatio: false,
            legend: {
                position: 'bottom',
                // display: false
            },
            tooltips: {
                displayColors: false,
                backgroundColor: 'transparent',
                bodyFontColor: 'rgba(0,0,0,.87)',
                bodyFontSize: 12,
                bodyFontStyle: 'bold',
                xPadding: 0,
                yPadding: 0,
                caretSize: 0,
                bodySpacing: 0,
                callbacks: {
                    label: function(tooltipItems, data) {
                        return data.datasets[tooltipItems.datasetIndex].data[tooltipItems.index] + '%';
                    }
                }
            },
            title: {
                display: true,
                text: 'Macronutrient Ratio'
            },
            showAllTooltips: true
        }
    };
    var columnData = {
        labels: [], //actual data to update
        datasets: [{
            backgroundColor: [], //actual data to update
            borderWidth: 1,
            data: [], //actual data to update
        }]
    };
    var columnConfig = {
        data: columnData,
        type: 'horizontalBar',
        options: {
            events: false,
            responsive: false,
            maintainAspectRatio: false,
            tooltips: {
                enabled: false
            },
            animation: {
                onComplete: function() {
                    var chartInstance = this.chart;
                    var ctx = chartInstance.ctx;
                    // ctx.textAlign = "center";

                    var meta = chartInstance.controller.getDatasetMeta(0);
                    var dataset = this.data.datasets[0];

                    Chart.helpers.each(meta.data.forEach(function(bar, index) {
                        var model = bar._model,
                            scale_max = bar._yScale.maxHeight,
                            left = bar._xScale.left,
                            y_pos = model.y - 5;
                        // Make sure data value does not get overflown and hidden
                        // when the bar's value is too close to max value of scale
                        // Note: The y value is reverse, it counts from top down
                        if ((scale_max - model.y) / scale_max >= 0.93) y_pos = model.y + 20;
                        ctx.fillStyle = '#444';
                        ctx.font = 'bold 12px Arial';
                        ctx.fillText(dataset.data[index], left + 10, model.y + 4);
                    }), this);
                }
            },
            scales: {
                yAxes: [{
                    gridLines: {
                        display: false
                    },
                    barPercentage: 0.8
                }],
                xAxes: [{
                    ticks: {
                        callback: function(label, index, labels) {
                            return label + ' kcal';
                        },
                        beginAtZero: true
                    },
                    gridLines: {
                        display: false
                    }
                }]
            },
            legend: {
                display: false
            },
            title: {
                display: true,
                text: 'Calories Distribution'
            }
        }
    };
    var donutChart, columnChart;

    chartHelper.initializeCharts = function(donutCtx, columnCtx, dataForDonut, dataForColumn) {
        alwaysShowTooltips();
        // dataForColumn = {
        //     'Meal 1': 300,
        //     'Meal 2': 350,
        //     'Meal 3': 200,
        //     'Meal 4': 350,
        //     'Meal 5': 200,
        //     'Meal 6': 350,
        //     'Meal 7': 200
        // };

        donutData.datasets[0].data = dataForDonut;
        updateColumnData(dataForColumn);

        donutChart = new Chart(donutCtx, donutConfig);
        columnChart = new Chart(columnCtx, columnConfig);
    };

    chartHelper.updateDonutChart = function(dataForDonut) {
        donutChart.data.datasets[0].data = dataForDonut;
        donutChart.update();
    };

    chartHelper.updateColumnChart = function(dataForColumn) {
        updateColumnData(dataForColumn);
        columnChart.update();
    };

    function updateColumnData(dataForColumn) {
        var backgroundColor = [];
        if (Object.keys(dataForColumn).length > 0) {
            columnData.labels = Object.keys(dataForColumn);
            columnData.datasets[0].data = Object.values(dataForColumn);

            for (var i = 0; i < columnData.labels.length; i++) {
                if (i % 2 == 0) backgroundColor.push('#4bc0c0');
                else backgroundColor.push('#e6e6e6');
            }

            columnConfig.options.scales.yAxes[0].barPercentage = columnData.labels.length < 4 ? 0.5 : 0.8;
            columnData.datasets[0].backgroundColor = backgroundColor;
        } else {
            columnData.labels = [];
            columnData.datasets[0].data = [];
            columnData.datasets[0].backgroundColor = backgroundColor;
        }
    }

    //Making tooltips always appear
    function alwaysShowTooltips() {
        //Source: http://stackoverflow.com/questions/36992922/chart-js-v2-how-to-make-tooltips-always-appear-on-pie-chart
        Chart.plugins.register({
            beforeRender: function(chart) {
                if (chart.config.options.showAllTooltips) {
                    // create an array of tooltips
                    // we can't use the chart tooltip because there is only one tooltip per chart
                    chart.pluginTooltips = [];
                    chart.config.data.datasets.forEach(function(dataset, i) {
                        chart.getDatasetMeta(i).data.forEach(function(sector, j) {
                            chart.pluginTooltips.push(new Chart.Tooltip({
                                _chart: chart.chart,
                                _chartInstance: chart,
                                _data: chart.data,
                                _options: chart.options.tooltips,
                                _active: [sector]
                            }, chart));
                        });
                    });

                    // turn off normal tooltips
                    chart.options.tooltips.enabled = false;
                }
            },
            afterDraw: function(chart, easing) {
                if (chart.config.options.showAllTooltips) {
                    // we don't want the permanent tooltips to animate, so don't do anything till the animation runs atleast once
                    if (!chart.allTooltipsOnce) {
                        if (easing !== 1)
                            return;
                        chart.allTooltipsOnce = true;
                    }

                    // turn on tooltips
                    chart.options.tooltips.enabled = true;
                    Chart.helpers.each(chart.pluginTooltips, function(tooltip) {
                        tooltip.initialize();
                        tooltip.update();
                        // we don't actually need this since we are not animating tooltips
                        tooltip.pivot();
                        tooltip.transition(easing).draw();
                    });
                    chart.options.tooltips.enabled = false;
                }
            }
        });
    }

    app.chartHelper = chartHelper;

})();

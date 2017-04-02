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
            data: [], //actual data to updtae
            backgroundColor: [
                "#4bc0c0",
                "#e6e6e6",
                "#a2a2a2"
            ],
            hoverBackgroundColor: [
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
                bodyFontSize: 11,
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
        labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"],
        datasets: [{
            label: "My First dataset",
            fill: false,
            lineTension: 0.1,
            backgroundColor: "rgba(75,192,192,0.4)",
            borderColor: "rgba(75,192,192,1)",
            borderCapStyle: 'butt',
            borderDash: [],
            borderDashOffset: 0.0,
            borderJoinStyle: 'miter',
            pointBorderColor: "rgba(75,192,192,1)",
            pointBackgroundColor: "#fff",
            pointBorderWidth: 1,
            pointHoverRadius: 5,
            pointHoverBackgroundColor: "rgba(75,192,192,1)",
            pointHoverBorderColor: "rgba(220,220,220,1)",
            pointHoverBorderWidth: 2,
            pointRadius: 1,
            pointHitRadius: 10,
            data: [65, 59, 80, 81, 56, 55, 40], //actual data to update
            spanGaps: false,
        }]
    };
    var columnConfig = {
        data: columnData,
        options: {
            responsive: false,
            maintainAspectRatio: false,
            scales: {
                yAxes: [{
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
                text: 'Calories Trend'
            }
        }
    };
    var donutChart, columnChart;

    chartHelper.initializeCharts = function(donutCtx, columnCtx, dataForDonut, dataForColumn) {
        alwaysShowTooltips();
        donutData.datasets[0].data = dataForDonut;
        donutChart = new Chart(donutCtx, donutConfig);
        columnChart = Chart.Line(columnCtx, columnConfig);
    };

    chartHelper.updateDonutChart = function(dataForDonut) {
        donutChart.data.datasets[0].data = dataForDonut;
        donutChart.update();
    };

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

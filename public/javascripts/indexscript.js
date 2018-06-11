$(document).ready(function()
{
    // temperature
    alert('selam');
    google.charts.load('current', {'packages':['gauge','corechart']});

    var temp=100;
    google.charts.setOnLoadCallback(drawGauge);
    function drawGauge() {

        var data = google.visualization.arrayToDataTable([
            ['Label', 'Value'],
            ['Temperature', temp],
        ]);

        var options = {
            width: 400, height: 120,
            redFrom: 90, redTo: 100,
            yellowFrom:75, yellowTo: 90,
            minorTicks: 5
        };

        var chart = new google.visualization.Gauge(document.getElementById('chart_div'));

        chart.draw(data, options);


    }

    // battery
    var batterylevel =90;
    //google.charts.load('current', {'packages':['corechart']});
    google.charts.setOnLoadCallback(drawChart); //otomatik çizdirme
    function drawChart() {

        var data = google.visualization.arrayToDataTable([
            ['Task', 'Hours per Day'],
            ['Dolu',      batterylevel],
            ['Bos',     100-batterylevel],

        ]);

        var options = {
            //title: 'Battery Level'
            legend: 'none',

        };
        var chart = new google.visualization.PieChart(document.getElementById('piechart'));
        chart.draw(data, options);
    }
    var socket = io.connect('http://localhost:3000');

    function getData (data,sensorName){
        //console.log(data.sensor[sensorName]);
        return data.sensor[sensorName];
    };

    var myDatax =  [[0,0]];
    var myDatay = [[0,0]];
    var myDataz = [[0,0]];
    socket.on('alldata', function(msg){
        var dataArray = getData(msg,"ACC").split(';');
        //$('#messages').html($('<li>').text(dataArray[0]+':'+dataArray[1]+':'+dataArray[2]));
        $('#messages').html($('<li>').text(JSON.stringify(msg)));
        var x = (new Date()).getTime();
        batterylevel = parseInt(getData(msg,"BAT")); drawChart();
        temp = parseInt(getData(msg,"temp")); drawGauge();



        var yx = parseFloat(dataArray[0]);
        var yy = parseFloat(dataArray[1]);
        var yz = parseFloat(dataArray[2]);
        myDatax.push([x, yx]);
        myDatay.push([x, yy]);
        myDataz.push([x, yz]);
    });
    var plot1 = $.jqplot('chart1', [myDatax, myDatax, myDataz], {

        series: [
            {
                //   yaxis: 'y2axis',

                lineWidth: 1.0,//2.2,
                color: '#0571B6',

                markerOptions: { style:'dimaond' }
            },



            {
                // Change our line width and use a diamond shaped marker.
                lineWidth:2,
                markerOptions: { style:'circle' }
            },
            {
                // Don't show a line, just show markers.
                // Make the markers 7 pixels with an 'x' style
                showLine:false,
                markerOptions: { size: 7, style:"x" }
            }
        ],
        axes: {
            xaxis: {
                renderer: $.jqplot.DateAxisRenderer,
                tickRenderer: $.jqplot.CanvasAxisTickRenderer,
                tickOptions: {
                    formatString: '%H:%M:%S',
                    angle: -50
                },

                numberTicks: 10,
                label:'Zaman',
                labelOptions:{
                    fontFamily:'Arial',
                    fontSize: '14pt'
                },
                labelRenderer: $.jqplot.CanvasAxisLabelRenderer

            },
            yaxis: {   //  y2axis: {
                // renderer:$.jqplot.LogAxisRenderer,
                min: -100,
                max: 250,
                tickOptions: {
                    formatString: '%.2f',
                    angle:-30
                },
                tickRenderer:$.jqplot.CanvasAxisTickRenderer,
                labelRenderer: $.jqplot.CanvasAxisLabelRenderer,

                numberTicks: 15,
                //label:'X, Y,Z Değer',
                labelOptions:{
                    fontFamily:'Arial',
                    fontSize: '14pt'
                },
                labelRenderer: $.jqplot.CanvasAxisLabelRenderer
            }

        },
        cursor: {
            zoom: false,
            showTooltip: false,
            show: false
        },
        highlighter: {
            useAxesFormatters: true,
            showMarker: true,
            show: false
        },
        grid: {
            drawGridLines: true,        // wether to draw lines across the grid or not.
            gridLineColor: '#cccccc',    // *Color of the grid lines.
            background: '#fffdf6',      // CSS color spec for background color of grid.
            borderColor: '#999999',     // CSS color spec for border around grid.
            borderWidth: 2.0,           // pixel width of border aroxund grid.
            shadow: true,               // draw a shadow for grid.
            shadowAngle: 45,            // angle of the shadow.  Clockwise from x axis.
            shadowOffset: 1.5,          // offset from the line of the shadow.
            shadowWidth: 3,             // width of the stroke for the shadow.
            shadowDepth: 3,             // Number of strokes to make when drawing shadow.
                                        // Each stroke offset by shadowOffset from the last.
            shadowAlpha: 0.07,           // Opacity of the shadow
            renderer: $.jqplot.CanvasGridRenderer // renderer to use to draw the grid.
        }
    });


    plot1.series[0].data = myDatax;
    plot1.series[1].data = myDatay;
    plot1.series[2].data = myDataz;
    plot1.resetAxesScale();
    plot1.axes.xaxis.numberTicks = 10;
    plot1.axes.y2axis.numberTicks = 15;
    plot1.replot();

    function updateSeries() {



        myDatax.splice(0,myDatax.length-10);
        myDatay.splice(0,myDatay.length-10);
        myDataz.splice(0,myDataz.length-10);

        plot1.series[0].data = myDatax;
        plot1.series[1].data = myDatay;
        plot1.series[2].data = myDataz;
        plot1.resetAxesScale();
        plot1.axes.xaxis.numberTicks = 10;
        plot1.axes.y2axis.numberTicks = 15;
        plot1.replot();
    }

    window.setInterval(updateSeries, 1000);



});
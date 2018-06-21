// Chart.js scripts
// -- Set new default font family and font color to mimic Bootstrap's default styling
Chart.defaults.global.defaultFontFamily = '-apple-system,system-ui,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif';
Chart.defaults.global.defaultFontColor = '#292b2c';
$(document).ready(function () {
    function getData(data, sensorName) {
        //console.log(data.sensor[sensorName]);
        return data.sensor[sensorName];
    };
    var socket = io();
    var encok=0;
    var enaz=0;
    var toplam=0;
    var tempdeger=0;
    var ortalama=0;
    var myDatax = [[0, 0]];
    var myDatay = [[0, 0]];
    var myDataz = [[0, 0]];
    var chartxyz = document.getElementById("myAreaChart");
    var charttemp = document.getElementById("myTempChart");
    var dataxyz = {
        labels: [[0], [1], [2]],
        datasets: [{
            data: [0],
            label: 'X',
            fill: false,
            backgroundColor: 'rgba(2,117,216,1)',
            borderColor: 'rgba(2,117,216,1)'
        }, {
            data: [1],
            label: 'Y',
            fill: false,
            backgroundColor: '#dc3545',
            borderColor: '#dc3545'
        }, {
            data: [2],
            label: 'Z',
            fill: false,
            backgroundColor: '#ffc107',
            borderColor: '#ffc107'
        }]
    };
    var optionsAnimations = {animation: false};
    var linechart = new Chart(chartxyz, {
        type: 'line',
        data: dataxyz,
        options: optionsAnimations
    });
    var datatemp = {
        labels: [[0], [1], [2]],
        datasets: [{
            data: [0],
            label: 'Temp',
            fill: false,
            backgroundColor: 'rgba(2,117,216,1)',
            borderColor: 'rgba(2,117,216,1)'
        }]
    };
    var tempchart = new Chart(charttemp, {
        type: 'line',
        data: datatemp,
        options: optionsAnimations
    });
    var randomScalingFactor = function() {
        return Math.round(Math.random() * 100);
    };

    var config = {
        type: 'pie',
        data: {
            datasets: [{
                data: [
                    randomScalingFactor(),
                    randomScalingFactor(),
                ],
                backgroundColor: [
                    '#dc3545',
                    'rgba(2,117,216,1)',
                ],
                label: 'Batarya Durumu'
            }],
            labels: [
                'Dolu',
                'Boş',
            ]
        },
        options: {
            responsive: true,
            animation: false
        }
    };
    var ctx = document.getElementById('myPieChart').getContext('2d');
    window.myPie = new Chart(ctx, config);
    socket.on('alldata', function (value) {
        var dataArray = value.split(':');
        //$('#messages').html($('<li>').text(dataArray[0]+':'+dataArray[1]+':'+dataArray[2]));
        var x = (new Date()).getTime();
        var yx = parseFloat(dataArray[0]);
        var yy = parseFloat(dataArray[1]);
        var yz = parseFloat(dataArray[2]);
        var batterylevel = parseInt(dataArray[4]);
        var temp = parseInt(dataArray[3]);

        myDatax.push([x, yx]);
        myDatay.push([x, yy]);
        myDataz.push([x, yz]);
        var length = dataxyz.labels.length;
        if (length >= 50) {
            dataxyz.datasets[0].data.shift();
            dataxyz.datasets[1].data.shift();
            dataxyz.datasets[2].data.shift();
            datatemp.datasets[0].data.shift();
            datatemp.labels.shift();
            dataxyz.labels.shift()
        }
        dataxyz.labels.push(moment().format('HH:mm:ss'));
        datatemp.labels.push(moment().format('HH:mm:ss'));
        dataxyz.datasets[0].data.push(yx);
        dataxyz.datasets[1].data.push(yy);
        dataxyz.datasets[2].data.push(yz);
        datatemp.datasets[0].data.push(temp);
        linechart.update();
        tempchart.update();
        var afterdatasets={ datasets :[{
                data: [
                    batterylevel,
                    100-batterylevel, afterdatasets
                ],
                backgroundColor: [
                    'rgba(2,117,216,1)',
                    '#dc3545',
                ],
                label: 'Batarya Durumu'
            }],
            labels: [
                'Dolu',
                'Boş',
            ]
        };
        config.data.datasets=afterdatasets.datasets;
        window.myPie.update();
        console.log(batterylevel);
        console.log(batterylevel);
        if(encok<temp){
            encok=temp
        }
        if(enaz>temp|| enaz==0){
            enaz=temp
        }
        toplam=temp+toplam;
        tempdeger++;
        ortalama=toplam/tempdeger;
        $('#enaz').text(enaz);
        $('#encok').text(encok);
        $('#ortalama').text(Math.round(ortalama,2));
        console.log(value);

    });
});
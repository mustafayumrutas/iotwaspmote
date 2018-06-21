$(document).ready(function () {

    var socket=io();


    socket.on('alldata',function (event) {
        console.log(event);
    });
});
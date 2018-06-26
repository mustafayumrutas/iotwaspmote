/*$(document).ready(function () {
    var socket = io();
    socket.on('alldata', function (data) {
        dataarray=data.split(":")
        addNewdata(dataarray);
    });
    let addNewdata = function (data) {
        $('#dataTable tr:last').after(AddList(data));
    };
    let AddList = function (data) {
        return `
             <tr log-id="${data.id}">
                <td>${data.id}</td>
                <td>${data.local.xyz}</td>
                <td>${data.local.temp}</td>
                <td>${data.local.battery}</td>
                <td>${data.local.datetime}</td>
            </tr>`
    };

});*/
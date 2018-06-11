function toggle(button)
{
    var buttonid="#"+button.id;
    switch(button.value)
    {
        case "ON":
            button.value = "OFF";
            $(buttonid).removeClass( "btn-success" ).addClass( "btn-danger" );
            break;
        case "OFF":
            $(buttonid).removeClass( "btn-danger" ).addClass( "btn-success" );;
            button.value = "ON";
            break;
    }
    socket.emit('digitalIO',button.id, button.value=="OFF"?0:1);
}

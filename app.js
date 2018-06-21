var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var app = express();
var debug = require('debug')('iotprojectstaj:server');
var http = require('http');
var should = require("should");
var monk=require('monk');
var dateFormat = require('dateformat');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(__dirname + '/node_modules'));


app.get('/', function (req,res,next) {
    res.render('index');
});
app.get('/forgot-password', function (req,res,next) {
    res.render('forgot-password');
});
app.get('/index', function (req,res,next) {
    res.redirect('/');
});
app.get('/register', function (req,res,next) {
    res.render('register');
});
app.get('/login', function (req,res,next) {
    res.render('login');
});
app.get('/tables', function (req,res,next) {
    res.render('tables');
});
app.get('/control', function (req,res,next) {
    res.render('Control');
});
app.get('/charts', function (req,res,next) {
    res.render('charts');
});
app.get('/charts/:id', function (req,res,next) {
    res.render('charts');
});



const SerialPort=require('serialport');
const Readline = SerialPort.parsers.Readline;
var sport = new SerialPort('COM3', {
    baudRate: 115200
});
const parser = sport.pipe(new Readline({delimeter : '\r\n'}));


var db = monk('localhost/IOTPROJECT');
should.exists(db);
var collection = db.get("Acceleration");
should.exists(collection);



// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});




var port = normalizePort(process.env.PORT || '3000');
app.set('port', port);

/**
 * Create HTTP server.
 */

var server = http.createServer(app);

/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

var io = require('socket.io')(server);
io.on('connection', function(socket)
{
    console.log('Bir kullanıcı bağlandı');

    socket.on('disconnect', function()
    {
        console.log('Kullanıcı ayrıldı...');
    });
});

// Seri porttan okuma
parser.on('data', function(datas)
{

    var data =datas+'';
    console.log(data);

    var date = new Date();
    var dataArray = data.split(':');
    //console.log(dateFormat(date.getTime(), "yyyy-mm-dd HH:MM:ss")+'-->x:'+dataArray[0]+'y:'+dataArray[1]+'z:'+dataArray[2]+'k:'+dataArray[3]+'l:'+dataArray[4]);

    console.log('\n');

    var temp= dateFormat(date.getTime(), "yyyy-mm-dd HH:MM:ss")+'-->x:'+dataArray[0]+'y:'+dataArray[1]+'z:'+dataArray[2];

    var x=dataArray[0];
    // Tüm istemcilere gönder
    io.emit('alldata', data);

    // MongoDB ye kaydet...
    collection.insert({"time":dateFormat(date.getTime(), "yyyy-mm-dd HH:MM:ss"), "x": dataArray[0],"y": dataArray[1],"z": dataArray[2] }, function(err, doc)
    {
        if(err)
        {
            console.log("HATA");
        }
        /*else
         {
         console.log("eklendi - ");
         }*/
    });
});



/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
    var port = parseInt(val, 10);

    if (isNaN(port)) {
        // named pipe
        return val;
    }

    if (port >= 0) {
        // port number
        return port;
        return port;
    }

    return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
    if (error.syscall !== 'listen') {
        throw error;
    }

    var bind = typeof port === 'string'
        ? 'Pipe ' + port
        : 'Port ' + port;

    // handle specific listen errors with friendly messages
    switch (error.code) {
        case 'EACCES':
            console.error(bind + ' requires elevated privileges');
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error(bind + ' is already in use');
            process.exit(1);
            break;
        default:
            throw error;
    }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
    var addr = server.address();
    var bind = typeof addr === 'string'
        ? 'pipe ' + addr
        : 'port ' + addr.port;
    debug('Listening on ' + bind);
}


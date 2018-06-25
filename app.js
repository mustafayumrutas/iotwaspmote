var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var passport = require('passport');
var session = require('express-session');
var app = express();
var debug = require('debug')('iotprojectstaj:server');
var http = require('http');
var dateFormat = require('dateformat');
var mongoose = require('mongoose');
var flash = require('connect-flash');
var configDB = require('./config/database.js');
var datatodb =require('./models/data');
//handle mongo error

// mongoose mongodb bağlantısı
mongoose.connect(configDB.url, function (err) {

    if (err) throw err;

    console.log('Veritabanı Sunucusuna Bağlanıldır');
});

// passport config ile başlatılması
require('./config/passport')(passport);
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
// socket için nodemodulesi ekliyoruz
app.use(express.static(path.join(__dirname, 'node_modules')));
// session için anahtar üretiliyor
app.use(session({
    secret: 'Waspmoteprojects', // session secret
    resave: true,
    saveUninitialized: true
}));
// passport modulu başlangıç ayarları
app.use(passport.initialize());
app.use(passport.session()); // sürekli login kalmak

app.use(flash());

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();

    res.redirect("/login");
}
app.get('/',isLoggedIn, function(req, res) {
    // eğer login değil ise logini göster login ise indexe yönlendir
    res.render('login', { message: req.flash('loginMessage') });
});

    // LOKAL --------------------------------
        // LOGIN ===============================
        // login formunu göster
        app.get('/login', function(req, res) {
            res.render('login', { message: req.flash('loginMessage') });
        });

        // loginden gelen post bağlantısı
        app.post('/login', passport.authenticate('local-login', {
            successRedirect : '/index', // giriş yapıldıktan sonra 
            failureRedirect : '/login', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
        }));

        // SIGNUP =================================
        // show the signup form
        app.get('/register', function(req, res) {
            res.render('register', { message: req.flash('signupMessage') });
        });

        // process the signup form
        app.post('/register', passport.authenticate('local-signup', {
            successRedirect : '/index', // redirect to the secure profile section
            failureRedirect : '/register', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
}));
app.get('/index',isLoggedIn, function(req, res){
    res.render('index');
});

app.get('/signout', function(req, res) {
    req.logout();
    res.redirect('/');
});

app.get('/forgot-password', function (req,res,next) {
    res.render('forgot-password');
});

app.get('/tables',isLoggedIn, function (req,res,next) {
    res.render('tables');
});
app.get('/control',isLoggedIn, function (req,res,next) {
    res.render('Control');
});
app.get('/charts',isLoggedIn, function (req,res,next) {
    res.render('charts');
});
app.get('/logs',isLoggedIn, function (req,res,next) {
    res.render('logs');
});
app.get('/statistics',isLoggedIn, function (req,res,next) {
    res.render('statistics');
});

app.get('/charts/:id',isLoggedIn, function (req,res,next) {
    res.render('charts');
});
app.get('/control/:id',isLoggedIn, function (req,res,next) {
    res.render('Control');
});



const SerialPort=require('serialport');
const Readline = SerialPort.parsers.Readline;
var sport = new SerialPort('COM3', {
    baudRate: 115200
});
const parser = sport.pipe(new Readline({delimeter : '\r\n'}));





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

   
    var dataArray = data.split(':');
    var newdata=new datatodb;
    newdata.local.xyz='-->x:'+dataArray[0]+'y:'+dataArray[1]+'z:'+dataArray[2]
    newdata.local.temp=dataArray[3]
    newdata.local.battery=dataArray[4]
    //console.log(dateFormat(date.getTime(), "yyyy-mm-dd HH:MM:ss")+'-->x:'+dataArray[0]+'y:'+dataArray[1]+'z:'+dataArray[2]+'k:'+dataArray[3]+'l:'+dataArray[4]);

    newdata.save(function(err){
        if(err) throw err
        else 
        console.log(newdata);
    });
    console.log('\n');
    // Tüm istemcilere gönder
    io.emit('alldata', data);

    // MongoDB ye kaydet...
    
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


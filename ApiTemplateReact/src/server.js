'use strict';
var debug = require('debug');
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var cookieSession = require('cookie-session');

const dotenv = require('dotenv');
dotenv.config();

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, '/public/favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: false }));
app.use(cookieParser());
app.use('/assets', express.static(path.join(__dirname, 'public')));
app.use('/assets/js', express.static(path.join(__dirname, '/../node_modules/jquery/dist')));
app.use('/assets/js', express.static(path.join(__dirname, '/../node_modules/jquery-migrate/dist')));
app.use('/assets/js', express.static(path.join(__dirname, '/../node_modules/jquery.nicescroll/dist')));
app.use('/assets/js', express.static(path.join(__dirname, '/../node_modules/bootstrap-slider/dist')));
app.use('/assets/js', express.static(path.join(__dirname, '/../node_modules/bootstrap/dist/js')));
app.use('/assets/js', express.static(path.join(__dirname, '/../node_modules/ddslick/dist')));
app.use('/assets/js', express.static(path.join(__dirname, '/../node_modules/lazysizes')));
app.use('/assets/css', express.static(path.join(__dirname, '/../node_modules/bootstrap/dist/css')));
app.use('/assets/toastr', express.static(path.join(__dirname, '/../node_modules/toastr/build')));
app.use('/assets/slick-carousel', express.static(path.join(__dirname, '/../node_modules/slick-carousel/slick')));
app.use('/assets/twilio-chat', express.static(path.join(__dirname, '/../node_modules/twilio-chat/dist')));
app.use('/assets/bootstrap-tagsinput', express.static(path.join(__dirname, '/../node_modules/bootstrap-tagsinput/dist')));
app.use('/scripts/', express.static(path.join(__dirname, 'scripts')));

var passport = require('passport');
app.use(cookieSession({
    name: 'session',
    keys: [process.env.SECRET_KEY],
    maxAge: parseInt(process.env.SESSION_TIME_IN_SECOND, 10) * 1000
}));

app.use(passport.initialize());
app.use(passport.session());

app.use(function (req, res, next) {
    res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.header('Expires', '-1');
    res.header('Pragma', 'no-cache');

    res.locals['isMerchantRoute'] = req.originalUrl && req.originalUrl.startsWith('/merchants');

    next();
});

require('./passport');
app.use('/', require('./routes/main-routes'));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.send('<div>' + err.message + '</div>');
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.sendFile(path.join(__dirname, '/views/error.html'));
});

app.set('port', process.env.PORT || 3000);

var server = app.listen(app.get('port'), function() {
    debug('Express server listening on port ' + server.address().port);
});

/** @PetroservServer */
/*
Author URI: https://www.kawami.io/
*/
var express = require('express');
var app = express();
var flash = require('connect-flash');
var async = require('async');
var morgan = require('morgan');
var path = require('path');
var bodyParser = require('body-parser');
var session = require('express-session');
var appConfig = require('./config/app.js')
var security = require('./app/libs/security.js')
var port = 3000;
var helmet = require('helmet')
var server = require('http').createServer(app);
var nodemailer = require('nodemailer');
var minifyHTML = require('express-minify-html');
var compression = require('compression');
var cluster = require('cluster');
var numCPUs = require('os').cpus().length;
var mongoose = require('mongoose');
var passport = require('passport');
var cookieParser = require('cookie-parser');
// var expressSession = require('cookie-session');
var MongoStore = require('connect-mongo')(session);
var appConfig = require('./config/app.js')
var multer = require('multer')
var upload = multer({ dest: 'public/img/' })
var parseForm = bodyParser.urlencoded({
    extended: true
});
if (appConfig.env && appConfig.env != "dev") {
    app.use(morgan('short'));
} else
    app.use(morgan('dev'));
app.use(helmet());
app.use(cookieParser());
app.use(bodyParser.json({
    limit: '50mb'
}));
require('./config/passport')(passport);


app.use(cookieParser('ses-462320'));
app.use(bodyParser.urlencoded({
    limit: '50mb',
    extended: true
}));
app.set('view engine', 'ejs');
app.use(flash());
app.use(function(req, res, next) {
    res.locals.env = appConfig.env;
    next()
})

// Using `mongoose.connect`...
var promise = mongoose.connect(appConfig.dbURL, {
    useMongoClient: true,
    /* other options */
});
promise.then(function(db) {
    /* Use `db`, for instance `db.model()`*/

    connection.openUri('appConfig.dbURL', {})
});

app.use(session({
    secret: 'ses-462320',
    unset: 'destroy',
    saveUninitialized: true,
    httpOnly: true,
    resave: true,
    ephemeral: true,
    cookie: {
        // sameSite : 'lax',
        secure: false,
        overwrite: true
    },
    path: "/",
    store: new MongoStore({
        url: appConfig.dbURL
    })
}));


app.use(passport.initialize());
app.use(passport.session());
app.use(bodyParser.json({
    limit: '50mb'
}));
app.use(bodyParser.urlencoded({
    limit: '50mb',
    extended: true
}));

app.use("/public", express.static(path.join(__dirname, 'public')));
app.use(express.static(__dirname + '/views'));
app.use(compression());
if (appConfig.env && appConfig.env != "dev") {
    app.all('/css*', function(req, res, next) {
        res.header('Expires', new Date(Date.now() + expireTime).toUTCString());
        next();
    });
    var expireTime = 604800000;
    app.all('/js*', function(req, res, next) {
        res.header('Expires', new Date(Date.now() + expireTime).toUTCString());
        res.header('Last-Modified', new Date(Date.now() - expireTime * 4).toUTCString());
        next();
    });
}

var transporter = nodemailer.createTransport('smtps://mahdi.hannachi@esprit.tn:mhaasif1@smtp.gmail.com');

// var transporter = nodemailer.createTransport({
//     service: 'Gmail',
//     auth: {
//         user: 'mahdi.hannachi@esprit.tn',
//         pass: 'mhaasif1'
//     }
// });
require('./app/routes.js')(app, transporter, passport);
if (appConfig.env && appConfig.env != "dev") {
    if (cluster.isMaster) {
        for (var i = 0; i < numCPUs; i++) {
            cluster.fork(); // create a worker
            console.info('cluster forked');
        }

        cluster.on('exit', function(worker, code, signal) {

        });
    } else {
        server.listen(port);
    }
} else {
    server.listen(port);
}
console.log('Running ' + appConfig.name + ' server on port :  ' + port);
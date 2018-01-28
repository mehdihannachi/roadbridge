module.exports = function(app, transporter, passport) {
    /*
    Loading Controllers 
    */
    var i18n = require('./libs/i18n');
    /*
    loading routes
    */
    app.use(function(req, res, next) {

        res.header('Access-Control-Allow-Credentials', true);
        res.header('Access-Control-Allow-Origin', req.headers.origin);
        res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
        res.header("Cache-Control", "no-cache, no-store");
        res.header('Access-Control-Allow-Headers', 'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept');
        // req.session.LANG_CODE = "fr";
        // res.locals.LANG_CODE = "fr";
        // res.locals.LANGUAGE = languages[req.session.LANG_CODE];
        next();
    });
    app.use(i18n);

    require('./routes/indexRoute')(app, transporter, passport);
    require('./routes/projectRoute')(app, transporter, passport);
    var User = require('./models/user');
    var languages = require('./content/languages');

    app.get('/*', function(req, res, next) {


        res.header('Access-Control-Allow-Origin', req.headers.origin); // your website
        res.header('Access-Control-Allow-Credentials', 'true');
        res.header("Cache-Control", "no-cache, no-store");
        res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
        res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
        // res.setHeader('Last-Modified', (new Date()).toUTCString());
        if ('OPTIONS' === req.method) {
            res.send(200);
        }
        else {
            next();
        }
        // if (req.headers.host.match(/^www/) == null) res.redirect(301, 'http://www.' + req.headers.host + req.url);
        // else next();
    });

    app.get('*', function(req, res) {
        res.status(404).render('views/404.ejs');
    });







};

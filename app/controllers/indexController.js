var async = require('async'),
    moment = require('moment'),
    _jsy = require('jsy'),
    appConfig = require('./../../config/app.js'),
    mongoose = require('mongoose'),
    ObjectId = require('mongoose').Types.ObjectId,
    mailer = require('./../models/mailer'),
    User = require('./../models/user'),
    resetpasswordhash = require('./../models/resetpasswordhash'),
    factory = require('./../libs/factory'),
    shortid = require('shortid'),
    _ = require("underscore");



module.exports.passwordresetGET = function(req, res) {

    var query = resetpasswordhash.findOne({
        hash: req.params.hash,
        "created_at": {
            "$gte": moment().subtract(1, 'hours').toDate()
        },
        "expire": false
    });
    query.populate('user_id');
    query.select().exec(function(err, _hash) {
        if (_hash) {
            res.locals.success = true
            res.locals.error = false
            var newPassword = shortid.generate();
            _hash.user_id.local.password = _hash.user_id.generateHash(newPassword);


            _hash.user_id.save(function(err) {
                if (err)
                    console.log(err)
            });

            _hash.expire = true;
            _hash.save(function(err) {
                if (err) {
                    console.error(err)

                }
                else {


                }
            });

            mailer({
                template: "sendpassword",
                footer: true,
                to: _hash.user_id.local.email,
                subject: "New password - Roadbridge",
                vars: {
                    new_password: newPassword
                }
            });

            res.render('gentelella/production/login', {
                forgetpassword: false,
                nextlogin: true
            });

        }
        else {
            res.render('gentelella/production/login', {
                forgetpassword: true,
                nextlogin: false
            });
        }

    });

}


// forgot password
module.exports.forgotpasswordPOSTajax = function(req, res) {

        User.findOne({
            "local.email": req.body.email
        }, function(err, user) {
            if (user) {
                var hash = shortid.generate();
                resetpasswordhash.create({
                    user_id: user._id,
                    hash: hash
                }, function(err, _hash) {
                    if (err) return handleError(err);
                    else
                        var reset_link = "http://" + appConfig.domain + "/password_reset/" + hash
                    mailer({
                        template: "lostPassword",
                        footer: true,
                        to: user.local.email,
                        subject: "Forgotten Password - Roadbridge",
                        vars: {
                            reset_link: reset_link
                        }
                    });

                    // saved!
                });

                res.json({
                    error: false
                })
            }
            else {

                res.json({
                    error: true,
                    message: "Email address not found"
                })
            }
        });
    }

module.exports.isLoggedIn = function(req, res, next) {


  if (req.isAuthenticated())
    return next();

  res.redirect('/dashboard_login');



};
var async = require('async'),
    moment = require('moment'),
    _jsy = require('jsy'),
    appConfig = require('./../../config/app.js'),
    mongoose = require('mongoose'),
    ObjectId = require('mongoose').Types.ObjectId,
    project = require('./../models/project'),
    resetpasswordhash = require('./../models/resetpasswordhash'),
    factory = require('./../libs/factory'),
    shortid = require('shortid'),
    base64ImageToFile = require('base64image-to-file'),
    fs = require('fs'),
    _jsy = require('jsy'),
    uuid = require('uuid'),
    _ = require("underscore"),
    formidable = require('formidable'),
    path = require('path');


module.exports.index = function(req, res, next) {
    project.find().sort('-created_at').exec(function(err, projects) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        }
        else {
            res.json({
                projects
            });
        }
    });
};


module.exports.show = function(req, res, next) {
    project.findOne({
        _id: req.params.id
    }).exec(function(err, p) {
        if (err) {
            res.json({
                error: err
            });
        }
        else {
            console.log(p)
            res.json(p);
        }
    })
};

module.exports.create = function(req, res) {
    var p = new project();
    var picture64 = req.body.cover_photo;
    var cover_photo = uuid.v4();
    console.log('1')
    console.log('4')

    p.contract_title = req.body.contract_title;
    p.start_date_month = req.body.start_date_month;
    p.start_date_year = req.body.start_date_year;
    p.end_date_month = req.body.end_date_month;
    p.end_date_year = req.body.end_date_year;
    p.description = req.body.description;
    p.client = req.body.client;
    p.consultant = req.body.consultant;
    p.referee = req.body.referee;
    if (req.body.cover_photo) {
        p.cover_photo = req.body.cover_photo;
    }

    p.save(function(err, bl) {
        console.log('5')

        if (err) {
            res.json({
                error: err
            });
        }
        else {
            console.log('saved article')
            res.json({ success: 'true' })
        }
    });

};

module.exports.file_upload = function(req, res) {

    var files = []
    var form = new formidable.IncomingForm();

    form.multiples = true;

    form.uploadDir = path.join(__dirname, '../../public/img');

    form.on('file', function(field, file) {
        console.log('file');
        // file.name = uuid.v4() + "__name:" + file.name
        files.push(file.name);
        fs.rename(file.path, path.join(form.uploadDir, file.name));
        res.json({ success: true })
    });

    form.on('error', function(err) {

        console.log('An error has occured: \n' + err);

        return res.json({
            error: true
        })

    });

    form.parse(req);


};

module.exports.delete = function(req, res) {
    project.findById(req.params.id, function(err, project) {
        project.remove();
        if (err) {
            res.json({
                error: err
            });
        }
        else {
            res.json({
                success: true,
                response: 200,
                message: 'project deleted'
            })
        }
    })
};

module.exports.update = function(req, res) {
    if (req.body.cover_photo) {
        project.findByIdAndUpdate(req.params.id, {
            $set: {
                contract_title: req.body.contract_title,
                start_date_month: req.body.start_date_month,
                start_date_year: req.body.start_date_year,
                end_date_month: req.body.end_date_month,
                end_date_year: req.body.end_date_year,
                onGoing: req.body.onGoing,
                description: req.body.description,
                client: req.body.client,
                consultant: req.body.consultant,
                referee: req.body.referee,
                cover_photo: req.body.cover_photo
            }
        }, {
            new: true
        }, function(err, p) {
            if (err)
                res.json({
                    error: err
                });

            else
                res.json(p);


        });
    }
    else {
        project.findByIdAndUpdate(req.params.id, {
            $set: {
                contract_title: req.body.contract_title,
                start_date_month: req.body.start_date_month,
                start_date_year: req.body.start_date_year,
                end_date_month: req.body.end_date_month,
                end_date_year: req.body.end_date_year,
                onGoing: req.body.onGoing,
                description: req.body.description,
                client: req.body.client,
                consultant: req.body.consultant,
                referee: req.body.referee
            }
        }, {
            new: true
        }, function(err, p) {
            if (err)
                res.json({
                    error: err
                });

            else
                res.json(p);


        });
    }
};

module.exports.saveDraft = function(req, res) {
    var p = new project();
    var picture64 = req.body.cover_photo;
    var cover_photo = uuid.v4();
    async.series([
        function(next) {
            if (req.body.cover_photo)
                base64ImageToFile(picture64, 'public/img', cover_photo, function(err, imgPath) {
                    if (err) {;
                        return console.error(err);
                    }
                    p.cover_photo = imgPath.replace('public/img/', '');
                    next()
                });
            else
                next();
        },

        function(next) {
            p.title = req.body.title;
            p.content = req.body.content;
            p._user = req.user._id;
            p.as_draft = true;

            p.save(function(err, bl) {
                if (err) {
                    res.json({
                        error: err
                    });
                }
                else {
                    res.json({
                        success: true,
                        response: 200,
                        message: 'project created as draft'
                    })
                }
            });
        }
    ])

};

module.exports.publishDraft = function(req, res) {
    var picture64 = req.body.cover_photo;
    var cover_photo = uuid.v4();
    async.series([
        function(next) {
            if (req.body.cover_photo)
                base64ImageToFile(picture64, 'public/img', cover_photo, function(err, imgPath) {
                    if (err) {;
                        return console.error(err);
                    }
                    p.cover_photo = imgPath.replace('public/img/', '');
                    next()
                });
            else
                next();
        },

        function(next) {
            project.findByIdAndUpdate(req.params.id, {
                $set: {
                    as_draft: req.body.draft,
                    title: req.body.title,
                    content: req.body.content,
                    _user: req.user._id
                }
            }, {
                new: true
            }, function(err, p) {
                if (err)
                    res.json({
                        error: err
                    });

                else
                    res.json(p);


            });
        }
    ])
};

module.exports.deleteSelected = function(req, res) {
    for (key in req.body.articles) {
        checkForValue(key, req.body.articles[key]);
    }

    function checkForValue(key, value) {

        if (value == true) {
            project.findOne({
                _id: key
            }, function(err, result) {
                if (err) {

                }
                if (result) {
                    result.remove();
                    return false
                }
            })
        }
    }
    res.json({
        message: 'everything should be fine'
    })
}

module.exports.draftSelected = function(req, res) {
    for (key in req.body.articles) {
        checkForValue(key, req.body.articles[key]);
    }

    function checkForValue(key, value) {

        if (value == true) {
            project.findByIdAndUpdate(key, {
                $set: {
                    as_draft: true
                }
            }, {
                new: true
            }, function(err, p) {
                if (err)
                    res.json({
                        error: err
                    });
            });
        }
    }
    res.json({
        message: 'everything should be fine'
    })
}

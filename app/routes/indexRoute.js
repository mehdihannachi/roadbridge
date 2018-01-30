/*
Author Mehdi Hannachi
*/
module.exports = function(app, transporter, passport) {
	var indexController = require('./../controllers/indexController');
	var mailerhbs = require('nodemailer-express-handlebars');
	var multer = require('multer');
	var mailer_attachement = require('./../models/mailer_attachement');
	var mailer = require('./../models/mailer');
	var upload = multer();
	var user = require('./../models/user');
	var session = function(req, res) {
		var temp = req.session.passport; // {user: 1}
		req.session.regenerate(function(err) {
			//req.session.passport is now undefined
			req.session.passport = temp;
			req.session.save(function(err) {
				res.send(200);
			});
		});
	};
	//PAGE HOME
	app.get('/', function(req, res, next) {
		res.render('index');
	});

	//PAGE ABOUT US
	app.get('/about-us', function(req, res, next) {
		res.render('about-us');
	});

	//PAGE Building & Civil Infrastructure Business Unit
	app.get('/what-we-do', function(req, res, next) {
		res.render('whatwedo');
	});

	//PAGE ENVIRONMENT
	app.get('/environment', function(req, res, next) {
		res.render('environment');
	});

	//PAGE CLIENTS
	app.get('/clients', function(req, res, next) {
		res.render('clients');
	});

	//PAGE PROJECTS GALLERY
	app.get('/projects-gallery', function(req, res, next) {
		res.render('projects_gallery');
	});

	//PAGE CONTACT US
	app.get('/contact-us', function(req, res, next) {
		res.render('contact-us');
	});

	//PAGE CAREER
	app.get('/careers', function(req, res, next) {
		res.render('careers');
	});


	app.get('/projects_list', indexController.isLoggedIn, function(req, res, next) {
		res.render('gentelella/production/tables_dynamic.ejs');
	});
	app.get('/form', function(req, res, next) {
		res.render('gentelella/production/tables.ejs');
	});
	app.get('/form_advanced', function(req, res, next) {
		res.render('gentelella/production/form_advanced.ejs');
	});
	app.get('/form_wizards', indexController.isLoggedIn, function(req, res, next) {
		res.render('gentelella/production/form_wizards.ejs');
	});
	app.get('/add_project', indexController.isLoggedIn, function(req, res, next) {
		res.render('gentelella/production/add_project.ejs');
	});
	app.get('/project/:id', function(req, res, next) {
		res.render('project_detail.ejs');
	});
	app.get('/project_update/:id', function(req, res, next) {
		res.render('gentelella/production/update_project.ejs');
	});
	app.get('/dashboard_login', function(req, res, next) {
		res.render('gentelella/production/login.ejs');
	});
	app.get('/dashboard_password_reset', function(req, res, next) {
		res.render('gentelella/production/forgottenpassword.ejs');
	});
	app.get('/dashboard_signup', function(req, res, next) {
		res.render('gentelella/production/signup');
	});

	app.post('/ajax/login', function(req, res, next) {

		passport.authenticate('local-login', function(err, user, info) {


			if (info) {
				if (info.code) {
					console.log('0 part')
					res.json(info)
				}
				else {
					req.login(user, function(err) {
						if (err) {
							console.log('fff')
							return res.json({
								error: info.message,

							})
						}
						else {
							req.session.user = user;
							console.log('first part')

							user.local.password = "****";
							console.log(user)
							res.json({
								user: user,
								error: false
							})
						}
					});
				}

			}
			else {
				req.login(user, function(err) {
					if (err) {
						console.log("err2")
						res.json({
							error: true,
						})
					}
					else {
						req.session.user = user;
						console.log('second part')
						return res.json({
							error: false,
							user_id: user._id,
							verified: info
						})
					}
				});
			}
		})(req, res, next);
	}, session)
	//Signup
	app.post('/ajax/signup-admin', function(req, res, next) {
		passport.authenticate('local-signup-admin', function(err, user, info) {

			if (info) {
				res.json(info)
			}
			else {
				/*req.login(user, function(err) {
				    if (err) {
				        res.json({
				            error: true
				        })
				    }
				    //req.session.user = user;
				    res.json({
				        error: false

				    })
				});*/
				res.json({
					error: false
				})
			}
		})(req, res, next);

	})
	//Forgot password
	app.post('/ajax/forgotpassword', indexController.forgotpasswordPOSTajax);
	// //PAGE 404
	// app.get('*',  function(req, res) {
	// 	res.status(404).render('404page.ejs');
	// });

	app.get('/password_reset/:hash', indexController.passwordresetGET);

	app.get('/logout', function(req, res) {
		delete req.session.resData;
		delete req.session.mailsent;
		req.logout();
		res.json({
			error: false,
			message: "Logout avec succes"
		});
	});

	//WEB SERVICE FORMULATIRE CONTACT US
	app.post('/ajax/contact-us', function(req, res, next) {
		transporter.use('compile', mailerhbs({
			viewPath: './views/template', //Path to email template folder
			extName: '.html' //extendtion of email template
		}));
		if ((req.body.data) && (req.body.data.name) && (req.body.data.email) &&
			(req.body.data.subject)) {
			if (!req.body.data.message) {
				req.body.data.message = "Null";
			}
			console.log("heeeeere")
			mailer({
				template: "contact-us",
				footer: false,
				from: 'Contact us <' + req.body.data.email + '>',
				to: 'mahdi.hannachi@gmail.com',
				subject: req.body.data.subject,
				vars: {
					subject: req.body.data.subject,
					name: req.body.data.name,
					email: req.body.data.email,
					message: req.body.data.message
				}
			});
			return res.json({
				error: false
			})
		}
		else
			return res.json({
				error: true
			})
	});

	//WEB SERVICE FORMULATIRE CAREERS
	app.post('/ajax/careers', upload.single('cv'), function(req, res, next) {
		if ((req.body) && (req.body.name) && (req.body.email) && (req.body.phone) &&
			(req.body.birth) && (req.body.country) && (req.body.jobcode)) {
			if (!req.body.website)
				req.body.website = "Null";
			mailer_attachement({
				from: '"Careers" <' + req.body.email + '>',
				to: 'mhaasif1@gmail.com',
				subject: "Careers",
				template: 'careers',
				vars: {
					name: req.body.name,
					email: req.body.email,
					phone: req.body.phone,
					birth: req.body.birth,
					country: req.body.country,
					jobcode: req.body.jobcode,
					website: req.body.website
				},
				file: {
					filename: req.file.originalname,
					content: req.file.buffer.toString('base64'),
					type: req.file.mimetype
				}
			});
			return res.json({
				error: false
			})
		}
		else
			return res.json({
				error: true
			})
	});


}

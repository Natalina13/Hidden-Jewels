var express = require('express'),
 	router = express.Router(),
 	Travelsite = require('../models/travelsite'),
 	Comment = require('../models/comment'),
	passport = require('passport'),
	localStrategy = require('passport-local'),
	nodemailer = require('nodemailer'),
	crypto = require('crypto'),
	User = require('../models/user'),
	async = require('async');

//landing page
router.get("/", (req, res) => {
	res.render("landing");
});


//register form
router.get('/register', (req,res) =>{
	res.render('register', {page: 'register'});
});

//add user details to db and authenticate
router.post('/register', (req, res) => {
	var newUser = new User({username: req.body.username,
						   firstName: req.body.firstname,
						   lastName: req.body.lastname,
						   avatar: req.body.avatar,
						   email: req.body.email});
	if(req.body.admincode === process.env.SECRET){
		newUser.isAdmin = true;
	}
	User.register(newUser, req.body.password, (err, user) =>{
		if(err){
			console.log(err);
			req.flash("error", err.message);
			return res.redirect('/register');
		}
		passport.authenticate('local')(req, res, function(){
			req.flash("success", "Welcome to YelpTravel "+ user.username);
			res.redirect('/travel');
		})
	})
});

//login form
router.get('/login', (req,res) => {
	res.render('login', {page:'login'});
})
//app.post '/login', middleware, callback
//authenticate user credentials and allow accesss
router.post('/login', passport.authenticate('local', {
	successRedirect: '/travel',
	failureRedirect: '/login',
	failureFlash: true,
	successFlash: `Welcome back!!!`
}), (req, res) => {
	return req.flash("success", "You Successfully LoggedIn");
});

//logout 
router.get('/logout', (req, res) => {
	req.flash("success", "you are logged out");
	req.logout();
	res.redirect('/travel');
})

//users profile
router.get('/users/:id', (req, res) => {
	User.findById(req.params.id, (err, data)=>{
		if(err){
			req.flash("error","User not found!");
			res.redirect('/');
		}
		else{
			Travelsite.find().where('author.id').equals(data._id).exec((err, sites) => {
				if(err){
					req.flash("error","User not found!");
					res.redirect('/');
				}else{
					res.render('users/show', {user: data, sites: sites});
				}
			});	
		}
	});
});


router.get('/forgot', (req, res) => {
	res.render('forgot');
});

router.post('/forgot', (req, res, next) => {
	//array of fuction called one after the another
	async.waterfall([
		(done) => {
			crypto.randomBytes(20, (err, buf) => {
				var token = buf.toString('hex');
				done(err, token);
			});
		},
		(token, done) => {
			User.findOne({email: req.body.email}, (err, user) => {
				if(!user){
					req.flash('error', 'No account with that email id exists.');
					return res.redirect('/forgot');
				}
				user.resetPasswordToken = token;
				user.resetPasswordExpires = Date.now() + 3600000; //1 hour
				user.save((err) => {
					done(err, token, user);
				});
			});
		},
		(token, user, done) => {
			var smtpTransport = nodemailer.createTransport({
				host: 'smtp.gmail.com',
    			port: 465,
    			secure: true,
				// service: 'Gmail',
				// auth: {
				// 	user: 'linarodrigues13@gmail.com',
				// 	pass: process.env.GMAILPW
				// }
				auth: {
        			type: 'OAuth2',
        			user: 'linarodrigues13@gmail.com',
        			clientId: process.env.CLIENTID,
        			clientSecret: process.env.CLIENTSECRET,
        			refreshToken: process.env.REFRESHTOKEN,
        			accessToken: process.env.ACCESSTOKEN
    			}
			});
			var mailOptions = {
				to: user.email,
				from: 'linarodrigues13@gmail.com',
				subject:'YelpTravel Password Reset',
				text: 'Click on the following link to reset your password \n\n http://'+req.headers.host+'/reset/'+token+'\n\n'
			};
			smtpTransport.sendMail(mailOptions, (err) => {
				console.log('mail sent');
				req.flash('success', 'An email has been sent to '+user.email+' with further instructions');
				done(err,'done');
			});
		}
	], (err) => {
		if(err) return next(err);
		res.redirect('/forgot');
	})
});

router.get('/reset/:token', (req, res) => {
	User.findOne({resetPasswordToken: req.params.token, resetPasswordExpires: {$gt: Date.now()}}, (err, user) => {
		if(!user){
			req.flash('error', 'Password reset token is invalid or expired');
					return res.redirect('/forgot');
		}
		res.render('reset', {token: req.params.token});
	});
});

router.post('/reset/:token', (req, res)=> {
	async.waterfall([
		(done)=>{
			User.findOne({resetPasswordToken: req.params.token, resetPasswordExpires: {$gt: Date.now()}}, (err, user) => {
				if(!user){
					req.flash('error', 'Password reset token is invalid or expired');
					return res.redirect('back');
				}
				if(req.body.password === req.body.confirm){
					user.setPassword(req.body.password, (err) => {
						user.resetPasswordToken = undefined;
						user.resetPasswordExpires = undefined;
						user.save((err) => {
							req.login(user, (err) => {
								done(err, user);
							});
						});
					})
				}
				else{
					req.flash('error', 'passwords do not match.');
					return res.redirect('back');
				}
			});
		},
		(user, done) => {
			var smtpTransport = nodemailer.createTransport({
				service: 'Gmail',
				auth: {
        			type: 'OAuth2',
        			user: 'linarodrigues13@gmail.com',
        			clientId: process.env.CLIENTID,
        			clientSecret: process.env.CLIENTSECRET,
        			refreshToken: process.env.REFRESHTOKEN,
        			accessToken: process.env.ACCESSTOKEN
    			}
			});
			var mailOptions = {
				to: user.email,
				from: 'linarodrigues13@gmail.com',
				subject:'YelpTravel Password Reset',
				text: "Password reset successfully!!"
			};
			smtpTransport.sendMail(mailOptions, (err) => {
				console.log('mail sent');
				req.flash('success', 'Your password is changed Successfully!!');
				done(err,'done');
			});
		}
	], (err)=>{
		res.redirect('/travel')
	});
});
module.exports = router;
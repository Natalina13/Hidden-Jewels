require('dotenv').config();

var express = require('express'),
	app = express(),
	request = require('request'),
	bodyParser = require('body-parser'),
	methodOverride = require('method-override'),
	mongoose = require('mongoose'),
	Travelsite = require('./models/travelsite'),
	Comment = require('./models/comment'),
	passport = require('passport'),
	localStrategy = require('passport-local'),
	User = require('./models/user'),
	flash = require('connect-flash'),
	seedDB = require('./seeds');

//reuire routes
var commentRoutes = require('./routes/comment'),
	travelRoutes = require('./routes/travel'),
	indexRoutes = require('./routes/index');

//mongoose.connect("mongodb://localhost:27017/yelp_travel_v3", {useNewUrlParser: true});
mongoose.connect(process.env.DATABASEURL);
//mongodb+srv://linarods13:selwin@cluster0-30bky.mongodb.net/test?retryWrites=true&w=majority
app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'ejs');
app.use(express.static(__dirname + "/public"))
app.use(methodOverride('_method'));
app.use(flash());
app.locals.moment = require('moment');
//seedDB(); seed database

//passport configuration
app.use(require('express-session')({
	secret: "Selwin is a awesome kid",
	resave: false,
	saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.use(function(req, res, next){
	res.locals.currentUser = req.user;
	res.locals.error = req.flash("error");
	res.locals.success = req.flash("success");
	next();
})

//Routes
app.use('/travel/:id/comments',commentRoutes);
app.use('/travel',travelRoutes);
app.use('/',indexRoutes);

app.listen(process.env.PORT, process.env.IP, () =>{
	console.log("YelpTravel has started!!");
});
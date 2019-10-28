var express = require('express'),
 	router = express.Router(),
 	Travelsite = require('../models/travelsite'),
 	Comment = require('../models/comment'),
	middleware = require('../middleware');

var nodeGeocoder = require('node-geocoder');

var options = {
	provider: 'google',
	httpAdapter: 'https',
	apiKey: process.env.GEOCODER_API_KEY,
	formatter: null
};

var geocoder = nodeGeocoder(options);

//show all travel sites
router.get("/", (req, res) => {
	if(req.query.search){
		var regex = new RegExp(escapeRegex(req.query.search),'gi');
	   Travelsite.find({name: regex}, (err, site) => {
		if(err){
			console.log(err);
		}
		else{
			if(site.length < 1){
				req.flash('error','No travel sites match that query, please try again');
				res.redirect('/travel');
			}
			else{
				res.render("travel/index", {travel: site, page: 'travel'});
			}
		}
	})
	   }
	else{
		Travelsite.find({}, (err, site) => {
		if(err){
			console.log(err);
		}
		else{
			res.render("travel/index", {travel: site, page: 'travel'});
		}
	})
	}
	
});

//add new travel sites
router.post('/', middleware.isLoggedIn, (req, res) => {
	var sname = req.body.name;
	var simage = req.body.image;
	var desc = req.body.description;
	var price = req.body.price;
	var author = {
		id: req.user._id,
		username: req.user.username
	}
	geocoder.geocode(req.body.location, (err, data) => {
		if(err || !data.length){
			console.log(err);
			req.flash('error', err.message);
			return res.redirect('back');
		}
	var lat = data[0].latitude;
	var lng = data[0].longitude;
	var location = data[0].formattedAddress;
		var site = {
		name: sname,
		image: simage,
		description: desc,
		price: price,
		author: author,
		location: location,
		lat: lat,
		lng: lng
	};
		Travelsite.create(site, (err, newsite) => {
		if(err){
			console.log(err);
		}
		else{
			req.flash("success", "You added a new travelsite");
			res.redirect('/travel');
		}
	});
	});
	
	// travelsite.push(site);
});

//form to add new travel sites
router.get('/new', middleware.isLoggedIn, (req, res) => {
	res.render('travel/new');
});

//to show details of particular site
router.get('/:id', (req, res) => {
	Travelsite.findById(req.params.id).populate("comments").exec(function(err, foundsite) {
		if(err){
			console.log();
		}
		else{
			res.render('travel/show', {travelsite: foundsite});
		}
	})
}); 

router.get('/:id/edit',middleware.checkCampgroundOwnership, (req, res) => {
			Travelsite.findById(req.params.id, (err, foundsite) => {
			
		if(err){
			console.log(err);
		}
		else{
							res.render('travel/edit', {travelsite: foundsite});
			}	
	});
});

router.put('/:id', middleware.checkCampgroundOwnership, (req, res) => {
	geocoder.geocode(req.body.travelsite.location, (err, data) => {
		if(err || !data.length){
			console.log(err);
			req.flash('error', err.message);
			return res.redirect('back');
		}
	req.body.travelsite.lat = data[0].latitude;
	req.body.travelsite.lng = data[0].longitude;
	req.body.travelsite.location = data[0].formattedAddress;
	Travelsite.findByIdAndUpdate(req.params.id, req.body.travelsite, (err, updatedsite) => {
		if(err){
			res.redirect('/travel');
		}
		else{
			req.flash("success", "You successfully updated a travel site");
			res.redirect(`/travel/${req.params.id}`)
		}
	});
});
});

//destroy travel site
router.delete('/:id', middleware.checkCampgroundOwnership, (req, res) => {
	Travelsite.findById(req.params.id, (err, foundsite) => {
		if(err){
			res.redirect('/travel');
		}
		Travelsite.remove({_id: foundsite._id}, (err) => {
			if(err){
				console.log(err);
			}
		});
		req.flash("success", "You successfully deleted a travel site");
		res.redirect('/travel');
	});
});

function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

module.exports = router;
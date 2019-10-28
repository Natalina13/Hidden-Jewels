var Travelsite = require('../models/travelsite'),
	Comment = require('../models/comment');
var middlewareobj = {};

middlewareobj.checkCampgroundOwnership = (req, res, next) => {
	if(req.isAuthenticated()){
			Travelsite.findById(req.params.id, (err, foundsite) => {
			
		if(err){
			console.log(err);
			res.redirect('back')
		}
		else{
			if(foundsite.author.id.equals(req.user._id) || req.user.isAdmin){
				next();
			}	
			else{
				req.flash("error", "You don't have persmission to do that");
				res.redirect('back');
			}
		}
	});
	}
	else{
		req.flash("error","You need to be logged in to do that");
		res.redirect('back');
	}
}

middlewareobj.checkCommentOwnership = (req, res, next) =>{
	if(req.isAuthenticated()){
			Comment.findById(req.params.comments_id, (err, foundcomment) => {
			
		if(err){
			req.flash("error", "Campground not found");
			res.redirect('back')
		}
		else{
			if(foundcomment.author.id.equals(req.user._id || req.user.isAdmin)){
				next();
			}	
			else{
				req.flash("error", "You don't have permission to do that");
				res.redirect('back');
			}
		}
	});
	}
	else{
		req.flash("error", "You need to be logged in to do that");
		res.redirect('back');
	}
	
}

middlewareobj.isLoggedIn = (req, res, next) => {
	if(req.isAuthenticated()){
		return next();
	}
		req.flash("error", "You need to be loged in to do that!!");
		res.redirect('/login');
};


module.exports = middlewareobj
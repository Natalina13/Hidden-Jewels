var express = require('express'),
 	router = express.Router({mergeParams: true}),
 	Travelsite = require('../models/travelsite'),
 	Comment = require('../models/comment'),
	middleware = require('../middleware');

//new comment form
router.get('/new', middleware.isLoggedIn, (req, res) => {
Travelsite.findById(req.params.id, (err, site) => {
		if(err){
			console.log(err);
		}else{
			res.render('comment/new', {travelsite: site});
		}
	})
});

//post new comments
router.post('/', middleware.isLoggedIn, (req, res) => {
	Travelsite.findById(req.params.id, (err, site) => {
		if(err){
			console.log(err);
			res.redirect("/travel");
		}
		else{
			Comment.create(req.body.comment, (err, comment) => {
				if(err){
					console.log(err);
				}
				else{
				comment.author.id = req.user._id;
					comment.author.username = req.user.username;
					comment.save();
			site.comments.push(comment);
					site.save();
					req.flash("success", "You added a new comment");
					res.redirect(`/travel/${req.params.id}`);
				}
			})
		}
	})
});

//edit comments
router.get('/:comments_id/edit', middleware.checkCommentOwnership, (req, res) => {
Comment.findById(req.params.comments_id, (err, foundcomment) => {
					 if(err){
		console.log(err);
		res.redirect('back');
	}else{
		res.render('comment/edit', {travel_id: req.params.id, comment: foundcomment});
	}
					 });
});

//put edited comments
router.put("/:comments_id/", middleware.checkCommentOwnership, (req, res) => {
	Comment.findByIdAndUpdate(req.params.comments_id, req.body.comment, (err, upddatedcomment) =>{
		if(err){
			res.redirect('back');
		}
		else{
			req.flash("success", "You successfully edited a comment");
			res.redirect('/travel/'+req.params.id);
		}
	});
});

//delete comment
router.delete("/:comments_id/", middleware.checkCommentOwnership, (req, res) => {
	Comment.findByIdAndRemove(req.params.comments_id, (err) => {
		if(err){
			console.log(err);
			res.redirect('back');
		}
		else{
			req.flash("success", "You deleted a comment");
			res.redirect('/travel/'+req.params.id);
		}
	});
});


module.exports = router;

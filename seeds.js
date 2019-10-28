var mongoose = require('mongoose');
var Comment = require('./models/comment');
var Travelsite =  require('./models/travelsite');

var data = [
		{name: "Greenland", image: "https://images.unsplash.com/photo-1463946377180-f5185c2783e5?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1051&q=80",
	description: "bla bla bla"},
		{name: "Lofoten Island", image: "https://images.unsplash.com/photo-1561369437-52e5666e08cf?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1000&q=60",
	description: "bla bla bla"},
		{name: "Bhutan", image: "https://images.unsplash.com/photo-1542828810-3372a0020f50?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1000&q=60",
	description: "bla bla bla"}
]

function seedDB(){
	Travelsite.remove({}, (err) => {
		if(err){
			console.log(err);
		}
		else{
			console.log("removed all campgrounds")
			// data.forEach((seed) => {
			// 	Travelsite.create(seed, (err, site) =>{
			// 		if(err){
			// 			console.log(err);
			// 		}
			// 		else{
			// 			console.log("added new campround");
			// 			Comment.create({
			// 				text: "This is an awsm place",
			// 				author: "me"
			// 			}, (err, comment) => {
			// 				if(err){
			// 					console.log(err);
			// 				}
			// 				else{
			// 					site.comments.push(comment);
			// 					site.save((err, data) => {
			// 						if(err){
			// 							console.log(err);
			// 						}
			// 						else{
			// 							console.log(data);
			// 						}
			// 					});
			// 					console.log("created new comment");
			// 				}
			// 			});
			// 		}
			// 	});
			// });
			}
	});
}

module.exports = seedDB;
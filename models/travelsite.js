var mongoose = require('mongoose');
var Comment = require('./comment');


var travelsiteSchema = mongoose.Schema({
	name: String,
	image: String,
	description: String,
	location: String,
	lat: Number,
	lng: Number,
	price: String,
	createdAt: {type: Date, default: Date.now},
	author: {
		id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User"
		},
		username: String
	},
	comments: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "Comment"
		}
	]
});

travelsiteSchema.pre('remove', async function() {
	await Comment.remove({
		_id: {
			$in: this.comments
		}
	}, function(err) {
		if(err){
			console.log(err);
		}
	});
});

module.exports = mongoose.model("Travelsite", travelsiteSchema);
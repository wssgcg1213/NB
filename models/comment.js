/**
 * Comment 模型
 */

var mongo = require('./db');
var marked = require('marked');

function Comment(pid, comment){
	this.pid = pid;
	this.comment = comment;

}

module.exports = Comment;

Comment.prototype.save = function(callback){
	var pid = this.pid,
		comment = this.comment;

	mongodb.open(function(err, db){
		if(err) return callback(err);
		db.collection('posts', function(err, collection){
			if(err){
				mongodb.close();
				return callback(err);
			}
			collection.update({'pid': pid}, {$push: {'comments': comment}}, function(err){
				mongodb.close();
				if(err) return callback(err);
				callback(null);
			});
		});
	});
}
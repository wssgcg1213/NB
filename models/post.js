/**
 * post (文章)模型
 */

var mongodb = require('./db');
var marked = require('marked');

function Post(title, tags, content) {
	this.title = title;
	this.content = content;
	this.tags = tags;
}

module.exports = Post;

Post.prototype.save = function (callback){
	var date = new Date();

	var time = {
		date: date,
		year: date.getFullYear(),
		month: date.getFullYear() + "-" + (date.getMonth() + 1),
		day: date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate(),
    	minute: date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " + date.getHours() + ":" + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes())
	};
	//要存入数据库的文档
	var post = {
		title: this.title,
		content: this.content,
		time: time,
		comments: [],
		pv: 0,
		tags: this.tags
	};
	//开库
	mongodb.open(function (err, db){
		if(err) return callback(err);
		//读
		db.collection('posts', function (err, collection){
			if(err){
				mongodb.close();
				return callback(err);
			}
			collection.count({}, function (err, count){
				if(err){
					mongodb.close();
					return callback(err);
				}
				//插
				post.pid = count + 1;
				collection.insert(post, {safe: true}, function (err){
					mongodb.close();
					if(err) return callback(err);
					callback(null);
				});
			});
			
		});
	});
};

Post.getOne = function(pid, callback){
	mongodb.open(function (err, db){
		if(err){
			mongodb.close();
			return callback(err);
		}
		db.collection('posts', function (err, collection){
			if (err){
				mongodb.close();
				return callback(err);
			}
			collection.findOne({'pid': pid}, function (err, doc){
				if(err){
					mongodb.close();
					return callback(err);
				}
				if(doc){
					collection.update({'pid': pid}, {$inc: {'pv': 1}}, function (err){  //pv++
						mongodb.close();
						if(err) return callback(err);
					});
					marked(doc.content, function (err, content){
						if(err) return console.log(err);
						doc.content = content;
					});
					doc.comments.forEach(function (comment){
						comment.content = marked(comment.content, function (err, content){
							if(err) console.log(err);
						});
					});
					callback(null, doc);
				}else{
					callback(null, null);   //no post
				}
			});
		});
	});
};











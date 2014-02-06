/**
 * gallery 模型
 */

var mongodb = require('./db');
var marked = require('marked');

function Gallery(url, content) {
	this.url = url;
	this.content = content;
}

module.exports = Gallery;

Gallery.prototype.save = function (callback){
	var date = new Date();

	var time = {
		date: date,
		year: date.getFullYear(),
		month: date.getFullYear() + "-" + (date.getMonth() + 1),
		day: date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate(),
    	minute: date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " + date.getHours() + ":" + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes())
	};
	//要存入数据库的文档
	var gallery = {
		url: this.url,
		content: this.content,
		time: time,
		comments: [],
		pv: 0,
	};
	//开库
	mongodb.open(function (err, db){
		if(err) return callback(err);
		//读
		db.collection('gallerys', function (err, collection){
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
				gallery.gid = count + 1;
				collection.insert(gallery, {safe: true}, function (err){
					mongodb.close();
					if(err) return callback(err);
					callback(null);
				});
			});
			
		});
	});
};

/**
 * [getOne description]显示一篇gallrery用的,pv++噢
 * @param  {[type]}   gid      [description]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
Gallery.getOne = function(gid, callback){
	mongodb.open(function (err, db){
		if(err){
			mongodb.close();
			return callback(err);
		}
		db.collection('gallerys', function (err, collection){
			if (err){
				mongodb.close();
				return callback(err);
			}
			collection.findOne({'gid': gid}, function (err, doc){
				if(err){
					mongodb.close();
					return callback(err);
				}
				if(doc){
					collection.update({'gid': gid}, {$inc: {'pv': 1}}, function (err){  //pv++
						mongodb.close();
						if(err) return callback(err);
					});
					marked(doc.content, function (err, content){
						if(err) return console.log(err);
						doc.content = content;
					});
					doc.comments.forEach(function (comment){
						marked(comment.content, function (err, content){
							if(err) return console.log(err);
							comment.content = content;
						});
					});
					callback(null, doc);
				}else{
					callback(null, null);   //no gallery
				}
			});
		});
	});
};

/**
 * [get description]获取最多amount数量的文章,gid倒序,pv无影响
 * @param  {[type]}   amount   [description]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
Gallery.get = function (amount, callback) {
	mongodb.open(function (err, db) {
		if(err){
			mongodb.close();
			return callback(err);
		}
		db.collection('gallerys', function (err, collection) {
			if(err){
				mongodb.close();
				return callback(err);
			}
			collection.count({}, function (err, total) {
				if(err){
					mongodb.close();
					return callback(err);
				}
				var skip = 0;
				collection.find({}, {
					skip: skip,
					limit: amount
				}).sort({gid: -1}).toArray(function (err, docs) {
					mongodb.close();
					if(err) return callback(err);
					docs.forEach(function (doc) {
						marked(doc.content, function (err, content){
							if(err) return console.log(err);
							doc.content = content;
						});
					});
					callback(null, docs);
				});
			});
		});
	});
};

/**
 * [edit description]这回返回不markdown解析过的原始文档
 * @param  {[type]}   gid      [description]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
Gallery.edit = function (gid, callback) {
	mongodb.open(function (err, db) {
		if(err){
			mongodb.close();
			return callback(err);
		}
		db.collection('gallerys', function (err, collection) {
			if(err){
				mongodb.close();
				return callback(err);
			}
			collection.findOne({'gid': gid}, function (err, doc) {
				if(err){
					mongodb.close();
					return callback(err);
				}
				if(doc){
					callback(null, doc);
				}else{
					callback(null, null);
				}
			});
		});
	});
};
















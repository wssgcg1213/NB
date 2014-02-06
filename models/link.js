/**
 * link 模型
 */

var mongodb = require('./db');
var marked = require('marked');

function Link(url, content) {
	this.url = url;
	this.content = content;
}

module.exports = Link;

Link.prototype.save = function (callback){
	//要存入数据库的文档
	var link = {
		url: this.url,
		content: this.content
	};
	//开库
	mongodb.open(function (err, db){
		if(err) return callback(err);
		//读
		db.collection('links', function (err, collection){
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
				link.lid = count + 1;
				collection.insert(link, {safe: true}, function (err){
					mongodb.close();
					if(err) return callback(err);
					callback(null);
				});
			});
			
		});
	});
};

/**
 * [get description]获取最多amount数量的links,lid倒序,pv无影响
 * @param  {[type]}   amount   [description]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
Link.get = function (amount, callback) {
	mongodb.open(function (err, db) {
		if(err){
			mongodb.close();
			return callback(err);
		}
		db.collection('links', function (err, collection) {
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
				}).sort({lid: -1}).toArray(function (err, docs) {
					mongodb.close();
					if(err) return callback(err);
					callback(null, docs);
				});
			});
		});
	});
};

/**
 * [getOne description]返回一个link
 * @param  {[type]}   lid      [description]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
Link.getOne = function (lid, callback) {
	mongodb.open(function (err, db) {
		if(err){
			mongodb.close();
			return callback(err);
		}
		db.collection('links', function (err, collection) {
			if(err){
				mongodb.close();
				return callback(err);
			}
			collection.findOne({'lid': lid}, function (err, doc) {
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

Link.edit = Link.getOne;

Link.update = function (lid, url, content, callback) {
	mongodb.open(function (err, db) {
		if(err){
			mongodb.close();
			return callback(err);
		}
		db.collection('links', function (err, collection) {
			if(err){
				mongodb.close();
				return callback(err);
			}
			collection.update({'lid': lid}, {$set: {
				url: url,
				content: content
			}}, function (err) {
				mongodb.close();
				if(err) return callback(err);
				callback(null);
			});
		});
	});
};














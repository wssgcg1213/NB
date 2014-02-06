/**
 * emotion (心情)模型
 * 这里不用markdown
 */

var mongodb = require('./db');

function Emotion(content) {
	this.content = content;
}

module.exports = Emotion;

Emotion.prototype.save = function (callback){
	var date = new Date();

	var time = {
		date: date,
		year: date.getFullYear(),
		month: date.getFullYear() + "-" + (date.getMonth() + 1),
		day: date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate(),
    	minute: date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " + date.getHours() + ":" + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes())
	};
	//要存入数据库的文档
	var emotion = {
		content: this.content,
		time: time,
		comments: [],
		pv: 0
	};
	//开库
	mongodb.open(function (err, db){
		if(err) return callback(err);
		//读
		db.collection('emotions', function (err, collection){
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
				emotion.eid = count + 1;
				collection.insert(emotion, {safe: true}, function (err){
					mongodb.close();
					if(err) return callback(err);
					callback(null);
				});
			});
		});
	});
};

/**
 * [get description]获取最多amount数量的心情,eid倒序
 * @param  {[type]}   amount   [description]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
Emotion.get = function (amount, callback) {
	mongodb.open(function (err, db) {
		if(err){
			mongodb.close();
			return callback(err);
		}
		db.collection('emotions', function (err, collection) {
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
				}).sort({eid: -1}).toArray(function (err, docs) {
					mongodb.close();
					if(err) return callback(err);
					callback(null, docs);
				});
			});
		});
	});
};

/**
 * [edit description]这回返回一篇心情
 * @param  {[type]}   eid      [description]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */

Emotion.getOne = function (eid, callback) {
	mongodb.open(function (err, db) {
		if(err){
			mongodb.close();
			return callback(err);
		}
		db.collection('emotions', function (err, collection) {
			if(err){
				mongodb.close();
				return callback(err);
			}
			collection.findOne({'eid': eid}, function (err, doc) {
				if(err){
					mongodb.close();
					return callback(err);
				}
				if(doc){
					collection.update({'eid': eid}, {$inc: {'pv': 1}}, function (err){  //pv++
						mongodb.close();
						if(err) return callback(err);
					});
					callback(null, doc);
				}else{
					callback(null, null);
				}
			});
		});
	});
};
















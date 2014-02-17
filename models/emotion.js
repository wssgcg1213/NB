/**
 * emotion (心情)模型
 * 这里不用markdown
 */

var mongodb = require('./db'),
    getTime = require('./gettime');

function Emotion(content) {
	this.content = content;
}

module.exports = Emotion;

Emotion.prototype.save = function (callback){

	var time = getTime();
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
            collection.find({}, {sort: {eid: -1}, limit:1}).toArray(function(err, last){
                emotion.eid = last[0] ? last[0].eid + 1 : 1;
                collection.insert(emotion, {safe: true}, function (err){
                    db.close();
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
						callback(null, doc);
					});
				}else{
                    mongodb.close();
					callback(null, null);
				}
			});
		});
	});
};


Emotion.saveComment = function (eid, email, name, url, content, callback){
    var time = getTime();
    if(!email){
        return callback("请检查Email!");
    }
    if(!name){
        return callback("请检查昵称!");
    }
    if(!content){
        return callback("请检查内容!");
    }
    mongodb.open(function (err, db) {
        if(err){
            mongodb.close();
            return callback(err);
        }
        db.collection('emotions', function (err, collection) {
            if (err){
                mongodb.close();
                return callback(err);
            }
            collection.update({'eid': eid}, {$push: {
                comments: {
                    name: name,
                    email: email,
                    url: url,
                    content: content,
                    time: time
                }
            }}, function (err) {
                mongodb.close();
                if (err) return callback(err);
                callback(null);
            })
        });
    });
};

/**
 * 更新内容
 * @param eid
 * @param content
 * @param callback
 */
Emotion.update = function (eid, content, callback) {
    mongodb.open(function (err, db) {
        if (err){
            mongodb.close();
            return callback(err);
        }
        db.collection('emotions', function (err, collection) {
            if (err){
                mongodb.close();
                return callback(err);
            }
            collection.update({eid: eid}, {$set: {content: content}}, function (err, emotion) {
                mongodb.close;
                if(err) return callback(err);
                callback(null, emotion);
            })
        });
    });
}

/**
 * 返回原始文档,后台编辑用
 * @param eid
 * @param callback
 */
Emotion.edit = function (eid, callback) {
    mongodb.open(function (err, db) {
        if (err){
            mongodb.close();
            return callback(err);
        }
        db.collection('emotions', function (err, collection) {
            if (err){
                mongodb.close();
                return callback(err);
            }
            collection.findOne({eid: eid}, function (err, emotion) {
                mongodb.close;
                if(err) return callback(err);
                callback(null, emotion);
            })
        });
    });
}

/**
 * 删除emotion
 * @param eid
 * @param callback
 */
Emotion.delete = function (eid, callback) {
    mongodb.open(function (err, db) {
        if (err){
            mongodb.close();
            return callback(err);
        }
        db.collection('emotions', function (err, collection) {
            if (err){
                mongodb.close();
                return callback(err);
            }
            collection.remove({eid: eid}, function (err) {
                mongodb.close;
                if(err) return callback(err);
                callback(null);
            })
        });
    });
}












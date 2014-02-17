/**
 * post (文章)模型
 */

var mongodb = require('./db'),
    marked = require('marked'),
    getTime = require('./gettime');


/**
 * [sub 字符串截取(中文算2个字符)]
 * @param  {[type]} n [截断的字符长度]
 * @return {[type]}   [返回截取之后的字符串]
 */
String.prototype.sub = function(n) {
	var r = /[^\x00-\xff]/g;
	if(this.replace(r, "mm").length <= n) return this;
	// n = n - 3;
	var m = Math.floor(n / 2);
	for(var i = m; i < this.length; i++) {
		if(this.substr(0, i).replace(r, "mm").length>=n) {
		return this.substr(0, i) +"...";
		}
	}
    return this;
};

function Post(title, tags, content) {
	this.title = title;
	this.content = content;
	this.tags = tags;
}

module.exports = Post;

Post.prototype.save = function (callback){

	var time = getTime();
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
        mongodb.collection('posts', function (err, collection){
			if(err){
                mongodb.close();
				return callback(err);
			}
            collection.find({}, {sort: {pid: -1}, limit:1}).toArray(function(err, last){
                console.log(last);
                post.pid = last[0] ? parseInt(last[0].pid) + 1 : 1;
                collection.insert(post, {safe: true}, function (err){
			    	db.close();
			       	if(err) return callback(err);
			       	callback(null);
			    });
            });
		});
	});
};

/**
 * [getOne 显示一篇文章用的 pv++噢]
 * @param  {[type]}   pid      [description]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
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
						marked(doc.content, function (err, content){
							if(err) return console.log(err);
							doc.content = content;
                            doc.comments.forEach(function (comment){
                                marked(comment.content, function (err, content){
                                    if(err) return console.log(err);
                                    comment.content = content;
                                });
                            });
                            callback(null, doc);
						});
					});	
				}else{
					mongodb.close();
					callback(null, null);   //no post
				}
			});
		});
	});
};

/**
 * [get 获取最多amount数量的文章,pid倒序,pv无影响,不markdown解析]
 * @param  {[Number]}   amount   [需要获取的文章数量]
 * @param  {Function} callback [回调函数]
 */
Post.get = function (amount, callback) {
	mongodb.open(function (err, db) {
		if(err){
			mongodb.close();
			return callback(err);
		}
		db.collection('posts', function (err, collection) {
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
				}).sort({pid: -1}).toArray(function (err, docs) {
					mongodb.close();
					if(err) return callback(err);
					docs.forEach(function (doc) {
						doc.titlesub = doc.title.sub(14);
						marked(doc.content, {sanitize: false}, function (err, content){
							if(err) return console.log(err);
							doc.content = content.replace(/<\/?.+?>/g,"").sub(150);
						});
					});
					callback(null, docs);
				});
			});
		});
	});
};

/**
 * [edit 这回返回不markdown解析过的原始文档]
 * @param  {[Number]}   pid      [文章ID]
 * @param  {Function} callback [回调函数]
 */
Post.edit = function (pid, callback) {
	mongodb.open(function (err, db) {
		if(err){
			mongodb.close();
			return callback(err);
		}
		db.collection('posts', function (err, collection) {
			if(err){
				mongodb.close();
				return callback(err);
			}
			collection.findOne({'pid': pid}, function (err, doc) {
				if(err){
					mongodb.close();
					return callback(err);
				}
                mongodb.close();
				if(doc){
					callback(null, doc);
				}else{
					callback(null, null);
				}
			});
		});
	});
};

/**
 * [update 更新文章]
 * @param  {[Number]}   pid      [文章ID]
 * @param  {[String]}   title    [标题]
 * @param  {[Array]}   tags     [标签数组]
 * @param  {[String]}   content  [内容]
 * @param  {[Date]}   time     [发布时间]
 * @param  {Function} callback [回调函数]
 */
Post.update = function (pid, title, tags, content, callback) {
	mongodb.open(function (err, db) {
		if(err){
			mongodb.close();
			return callback(err);
		}
		db.collection('posts', function (err, collection) {
			if(err){
				mongodb.close();
				return callback(err);
			}
			collection.update({'pid': pid}, {$set: {
                title: title,
                tags: tags,
                content: content
            }}, function (err, post) {
				mongodb.close();
				if(err) return callback(err);
				callback(null, post);
			});
		});
	});
};

Post.saveComment = function (pid, email, name, url, content, callback){
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
        db.collection('posts', function (err, collection) {
            if (err){
                mongodb.close();
                return callback(err);
            }
            collection.update({'pid': pid}, {$push: {
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

Post.delete = function (pid, callback) {
    mongodb.open(function (err, db) {
        if(err){
            mongodb.close();
            return callback(err);
        }
        db.collection('posts', function (err, collection) {
            if (err){
                mongodb.close();
                return callback(err);
            }
            collection.remove({pid: pid}, function (err){
                mongodb.close();
                if(err) return callback(err);
                callback(null);
            });
        });
    });
}

Post.remove = Post.delete;

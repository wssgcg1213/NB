/*
 * Routes
 */

var crypto = require('crypto');
var User = require('../models/user.js');
var Emotion = require('../models/emotion.js');
var Post = require('../models/post.js');
var Gallery = require('../models/gallery.js');
var Link = require('../models/link.js');
var site = require('../siteSettings.js');

module.exports = function(app){
    //主页
    app.get('/', function(req, res){
        Emotion.get(site.indexEmotionAmount, function (err, emotions) {
            if (err) {
                req.flash('error', "主页心情读取错误!");
                return res.redirect('/404');
            }
            Post.get(site.indexPostAmount, function (err, posts) {
				if (err) {
					req.flash('error', "主页文章读取错误!");
					return res.redirect('/404');
				}
				Gallery.get(site.indexGalleryAmount, function (err, galleries) {
					if (err) {
						req.flash('error', "主页相册读取错误!");
						return res.redirect('/404');
					}
					Link.get(site.indexLinkAmount, function (err, links) {
						if (err) {
							req.flash('error', "主页友链读取错误!");
							return res.redirect('/404');
						}
						res.render('index', {
							title: site.title,
							site: site,
							emotions: emotions,
							posts: posts,
							galleries: galleries,
							links: links,
							success: req.flash('success').toString(),
							error: req.flash('error').toString()
						});
					});
				});
			});
		});
	});

	app.get('/emotion/:eid', function (req, res, next) {
		var eid = parseInt(req.params.eid);
		Emotion.getOne(eid, function (err, emotion) {
			if (err){
				req.flash('error', "读取心情错误!");
				return res.redirect('/404');
			}
			if (!emotion){
				req.flash('error', "找不到这篇心情!");
				return res.redirect('/404');
			}
            Link.get(site.indexLinkAmount, function(err, links){
                if (err){
                    req.flash('error', "友链读取错误!");
                    return res.redirect('/404');
                }
                res.render("emotions", {
                    title: emotion.title,
                    site: site,
                    user: req.session.user,
                    emotion: emotion,
                    links: links,
                    comments: emotion.comments,
                    success: req.flash('success').toString(),
                    error: req.flash('error').toString()
                });
            });
		});
	});
    app.post('/emotion/:eid', function (req, res, next){
        var eid = parseInt(req.params.eid),
            name = req.body.name,
            qq = req.body.qq ? req.body.qq : 0,
            url = req.body.url,
            content = req.body.content;
        if(!eid){
            req.flash('error', "内部错误!");
            return res.redirect('/emotion/' + eid);
        }
        Emotion.saveComment(eid, qq, name, url, content, function(err){
            if(err){
                req.flash('error', err);
                return res.redirect('/emotion/' + eid);
            }
            req.flash('success', "回复成功!");
            return res.redirect('/emotion/' + eid);
        });
    });

	app.get('/post/:pid', function (req, res, next) {
		var pid = parseInt(req.params.pid); 
        Post.getOne(pid, function (err, post) {
        	Link.get(site.indexLinkAmount, function (err, links) {
				if (err){
					req.flash('error', "读取文章错误!");
					return res.redirect('/404');
				}
				if (!post){
					req.flash('error', "找不到这篇文章!");
					return res.redirect('/404');
				}
            	res.render("posts", {
            	    title: post.title,
            	    site: site,
            	    links: links,
            	    user: req.session.user,
            	    post: post,
            	    comments: post.comments,
            	    success: req.flash('success').toString(),
            	    error: req.flash('error').toString()
            	});
        	});
		});
	});
    app.post('/post/:pid', function (req, res, next){
        var pid = parseInt(req.params.pid),
            name = req.body.name,
            qq = req.body.qq ? req.body.qq : 0,
            url = req.body.url,
            content = req.body.content;
        Post.saveComment(pid, qq, name, url, content, function(err){
            if(!pid){
                req.flash('error', "内部错误!");
                return res.redirect('/post/' + pid);
            }
            if(err){
                req.flash('error', err);
                return res.redirect('/post/' + pid);
            }
            req.flash('success', "回复成功!");
            return res.redirect('/post/' + pid);
        });
    });

	app.get('/gallery/:gid', function (req, res, next) {
		var gid = parseInt(req.params.gid);
		Gallery.getOne(gid, function (err, gallery) {
			if (err){
				req.flash('error', "读取文章错误!");
				return res.redirect('/404');
			}
			if (!gallery){
				req.flash('error', "找不到这篇文章!");
				return res.redirect('/404');
			}
			res.render("posts", {
				title: gallery.title,
				site: site,
				user: req.session.user,
				gallery: gallery,
				success: req.flash('success').toString(),
				error: req.flash('error').toString()
			});
		});
	});



	//后台部分
	app.get('/admin', function (req,res) {
		if(!req.session.user){
			res.render('admin/login', {
				site: site,
				success: req.flash('success').toString(),
				error: req.flash('error').toString()
			});			
		}else{
            Emotion.get(0, function (err, emotions) {
                if (err) {
                    req.flash('error', "主页心情读取错误!");
                    return res.redirect('/404');
                }
                Post.get(0, function (err, posts) {
                    if (err) {
                        req.flash('error', "主页文章读取错误!");
                        return res.redirect('/404');
                    }
                    Gallery.get(0, function (err, galleries) {
                        if (err) {
                            req.flash('error', "主页相册读取错误!");
                            return res.redirect('/404');
                        }
                        //Link.get(0, function (err, links) {
                        //    if (err) {
                        //        req.flash('error', "主页友链读取错误!");
                        //        return res.redirect('/404');
                        //    }
                            posts = posts.reverse();
                            emotions = emotions.reverse();
                        //    links = links.reverse();
                            res.render('admin/index', {
                                title: site.title,
                                site: site,
                                user: req.session.user,
                                emotions: emotions,
                                posts: posts,
                                galleries: galleries,
                                //links: links,
                                success: req.flash('success').toString(),
                                error: req.flash('error').toString()
                            });
                       // });
                    });
                });
            });
		}
	});

	app.get('/admin/site', preCheckLogin);
	app.get('/admin/site', function (req, res) {
		res.render('admin/site', {
			site: site,
			user: req.session.user,
			success: req.flash('success').toString(),
			error: req.flash('error').toString()
		});
	});

	app.post('/admin/site', preCheckLogin);
	app.post('/admin/site', function (req, res) {
		var siteinfo = {
				title: req.body.site_title,
				subtitle: req.body.site_subtitle,
				author: req.body.site_author
			},
			site = new Site(siteinfo);
		site.save(function (err) {
			if(err){
				req.flash('error', err); 
				return res.redirect('/admin');
			}
			req.flash('success', '保存成功!');
			res.redirect('/admin');  //成功
		});
	});

	app.post("/admin/login", function (req, res) {
		var password_md5 = crypto.createHash('md5').update(req.body.password).digest('hex');

		User.get(req.body.username, function (err, user) {
			if(err){
				req.flash('error', "查询出错!");
				return res.redirect('/admin');
			}

			if(!user){
				req.flash('error', '用户不存在!');
				return res.redirect('/admin');
			}

			if(user.password != password_md5){
				req.flash('error', '密码错误!');
				return res.redirect('/admin');
			}

			req.session.user = 	user;
			req.flash('success', '登录成功!');
			res.redirect('/admin');
		});
	});

	app.get('/admin/logout', function (req, res) {
		site: site,
		req.session.user = null;
		req.flash('success', "登出成功!");
		res.redirect('/admin');
	});

	app.get('/admin/posts', preCheckLogin);
	app.get('/admin/posts', function (req, res) {
		res.render('admin/posts', {
			site: site,
			user: req.session.user,
			success: req.flash('success').toString(),
			error: req.flash('error').toString()
		});
	});

	app.post('/admin/posts', preCheckLogin);
	app.post('/admin/posts', function (req, res) {
		var title = req.body.title,
			tags = req.body.tags.split(",") ? req.body.tags.split(",") : req.body.tags.split("|"),
			content = req.body.content,
			post = new Post(title, tags, content);
			post.save(function (err){
				if(err){
					req.flash('error', err); 
					return res.redirect('/admin');
				}
				req.flash('success', '发布成功!');
				res.redirect('/admin');//发表成功
			});
	});

    app.get('/admin/post-edit/:pid', preCheckLogin);
    app.get('/admin/post-edit/:pid', function (req, res) {
        var pid = parseInt(req.params.pid);
        Post.edit(pid, function (err, post) {
            if(err || !post){
                req.flash('error', "读取文章错误!");
                res.redirect('/admin');
            }
            if(post.tags) post.tags = post.tags.join(",");
            res.render('admin/post-edit', {
                site: site,
                post: post,
                user: req.session.user,
                success: req.flash('success').toString(),
                error: req.flash('error').toString()
            });
        });
    });

    app.post('/admin/post-edit/:pid', preCheckLogin);
    app.post('/admin/post-edit/:pid', function (req, res) {
        var pid = parseInt(req.params.pid),
            title = req.body.title,
            tags = req.body.tags.split(",") ? req.body.tags.split(",") : req.body.tags.split("|"),
            content = req.body.content;
        Post.update(pid, title, tags, content, function (err, post){
            if(err){
                req.flash('error', "update错误");
                return res.redirect('/admin');
            }
            req.flash('success', '修改成功!');
            res.redirect('/admin');//修改成功
        });
    });

    app.get('/admin/post-del/:pid', preCheckLogin);
    app.get('/admin/post-del/:pid', function (req, res) {
        var pid = parseInt(req.params.pid);
        Post.edit(pid, function (err, post) {
            if(err){
                req.flash('error', "读取Post错误");
                return res.redirect('/admin');
            }
            res.render('admin/post-del', {
                site: site,
                post: post,
                user: req.session.user,
                success: req.flash('success').toString(),
                error: req.flash('error').toString()
            });
        });
    });

    app.post('/admin/post-del/:pid', preCheckLogin);
    app.post('/admin/post-del/:pid', function (req, res) {
        var pid = parseInt(req.params.pid);
        Post.delete(pid, function (err) {
            if(err){
                req.flash('error', "删除出错了> <!");
                return res.redirect('/admin');
            }
            req.flash('success', "删除成功!");
            res.redirect('/admin');
        });
    });

	app.get('/admin/emotions', preCheckLogin);
	app.get('/admin/emotions', function (req, res) {
		res.render('admin/emotions', {
			site: site,
			user: req.session.user,
			success: req.flash('success').toString(),
			error: req.flash('error').toString()
		});
	});

	app.post('/admin/emotions', preCheckLogin);
	app.post('/admin/emotions', function (req, res) {
		var content = req.body.content,
			emotion = new Emotion(content);
			emotion.save(function (err){
				if(err){
					req.flash('error', err); 
					return res.redirect('/admin');
				}
				req.flash('success', '发布成功!');
				res.redirect('/admin');//发表成功
			});
	});

    app.get('/admin/emotion-edit/:eid', preCheckLogin);
    app.get('/admin/emotion-edit/:eid', function (req, res) {
        var eid = parseInt(req.params.eid);
        Emotion.edit(eid, function (err, emotion) {
            if(err || !emotion){
                req.flash('error', "读取Emotion错误!");
                res.redirect('/admin');
            }
            return res.render('admin/emotion-edit', {
                site: site,
                emotion: emotion,
                user: req.session.user,
                success: req.flash('success').toString(),
                error: req.flash('error').toString()
            });
        });

    });

    app.post('/admin/emotion-edit/:eid', preCheckLogin);
    app.post('/admin/emotion-edit/:eid', function (req, res) {
        var eid = parseInt(req.params.eid),
            content = req.body.content;
        Emotion.update(eid, content, function (err) {
            if(err){
                req.flash('error', "update错误");
                return res.redirect('/admin');
            }
            req.flash('success', '修改成功!');
            res.redirect('/admin');//修改成功
        });
    });

    app.get('/admin/emotion-del/:eid', preCheckLogin);
    app.get('/admin/emotion-del/:eid', function (req, res) {
        var eid = parseInt(req.params.eid);
        Emotion.edit(eid, function (err, emotion) {
            if(err){
                req.flash('error', "读取emotion错误");
                return res.redirect('/admin');
            }
            return res.render('admin/emotion-del', {
                site: site,
                emotion: emotion,
                user: req.session.user,
                success: req.flash('success').toString(),
                error: req.flash('error').toString()
            });
        });
    });

    app.post('/admin/emotion-del/:eid', preCheckLogin);
    app.post('/admin/emotion-del/:eid', function (req, res) {
        var eid = parseInt(req.params.eid);
        Emotion.delete(eid, function (err) {
            if(err){
                req.flash('error', "删除出错了> <!");
                return res.redirect('/admin');
            }
            req.flash('success', "删除成功!");
            res.redirect('/admin');
        });
    });

    app.get('/admin/links', preCheckLogin);
    app.get('/admin/links', function (req, res) {
        Link.get(0, function (err, links) {
            if(err){
                req.flash('error', err);
                res.redirect('/admin');
            }
            res.render('admin/links', {
                site: site,
                links: links,
                user: req.session.user,
                success: req.flash('success').toString(),
                error: req.flash('error').toString()
            });
        });
    });

    app.post('/admin/links', preCheckLogin);
    app.post('/admin/links', function (req, res) {
        var url = req.body.url,
            content = req.body.content,
            link = new Link(url, content);
        link.save(function (err){
            if(err){
                req.flash('error', err);
                return res.redirect('/admin');
            }
            req.flash('success', '添加成功!');
            res.redirect('/admin');//发表成功
        });
    });

	app.get('/admin/reg', function (req, res) {
    	res.render('admin/reg', {
    		site: site,
    		success: req.flash('success').toString(),
			error: req.flash('error').toString()
    	});
  	});

	app.post('/admin/reg', function (req, res) {
		var name = req.body.name,
			password = req.body.password,
			password_re = req.body['password-repeat'];
		if(password != password_re) {
			req.flash('error', "两次输入的密码不一致!");
			res.redirect('/admin/reg');
		}
		var md5 = crypto.createHash('md5'),
			password_md5 = md5.update(req.body.password).digest('hex');
		var newUser = new User({
			name: req.body.name,
			password: password_md5,
			qq: req.body.qq
		});

		User.get(newUser.name, function (err, user) {
			if(user){
				req.flash('error', '用户已存在!');
				return res.redirect("/admin/reg");
			}
			newUser.save(function (err, user) {
				if(err){
					req.flash('error', err);
        			return res.redirect('/admin/reg');//注册失败返回主册页
				}
				req.session.user = user;
				req.flash('success', '注册成功!');
				res.redirect("/admin");
			});
		});
	});

	//404
	//app.use(function(req, res) {
    //   res.render('404', {
    //   	site: site,
    //    success: req.flash('success').toString(),
    //    error: req.flash('error').toString()
    //   });
	//});

	function preCheckLogin(req, res, next){
		if(!req.session.user){
			req.flash('error', "Pls Login First!");
			return res.redirect('/admin');
		}
		next();
	}
};
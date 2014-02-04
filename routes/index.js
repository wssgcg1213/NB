 
/*
 * Routes
 */

var crypto = require('crypto');
var User = require('../models/user.js');
var Post = require('../models/post.js');

module.exports = function(app){
	//主页
	app.get('/', function(req, res){
		res.render('index', {
			title: 'The Good Parts',
			site: {
				title: 'The Good Parts',
				subtitle: 'B1ackRainFlake',
			},
			category: [{
				cid: 1,
				name: 'cate1',
			},{
				cid: 2,
				name: 'cate2'
			}],
			posts: ["a","b"],
			success: req.flash('success').toString(),
			error: req.flash('error').toString()
		})
	});

	app.get('/post/:pid', function (req, res, next) {
		var pid = parseInt(req.params.pid);
		var currentUser = req.session.user ? req.session.user : null;
		Post.getOne(pid, function (err, post) {
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
				site: {
					title: "B1ackRainFlake",
					subtitle: "B1ackRainFlake"
					},
				user: req.session.user,
				post: post,
				success: req.flash('success').toString(),
				error: req.flash('error').toString()
			});
		});
	});

	//后台部分
	app.get('/admin', function (req,res) {
		if(!req.session.user){
			res.render('admin/login', {
				success: req.flash('success').toString(),
				error: req.flash('error').toString()
			});			
		}else{
			res.render('admin/index', {
				user: req.session.user,
				success: req.flash('success').toString(),
				error: req.flash('error').toString()
			});
		}
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
		req.session.user = null;
		req.flash('success', "登出成功!");
		res.redirect('/admin');
	});

	app.get('/admin/posts', preCheckLogin);
	app.get('/admin/posts', function (req, res) {
		res.render('admin/posts', {
			user: req.session.user,
			success: req.flash('success').toString(),
			error: req.flash('error').toString()
		});
	});

	app.post('/admin/posts', preCheckLogin);
	app.post('/admin/posts', function (req, res) {
		var currentUser = req.session.user,
			title = req.body.title,
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

	app.get('/admin/reg', function (req, res) {
    	res.render('admin/reg', {
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
			email: req.body.email
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
	app.use(function(req, res) {
		res.render('404', {
			success: req.flash('success').toString(),
			error: req.flash('error').toString()
		});
	});

	function preCheckLogin(req, res, next){
		if(!req.session.user){
			req.flash('error', "Pls Login First!");
			return res.redirect('/admin');
		}
		next();
	}
};
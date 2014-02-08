var settings = require('../settings'),
	Db = require('mongodb').Db,
	Connection = require('mongodb').Connection,
	Server = require('mongodb').Server;
//var mongoDb = {};
//mongoDb.open =  function(callback){
//    new require('mongodb').MongoClient.connect("mongodb://wssgcg1213:6884650@novus.modulusmongo.net:27017/tegI9wuz", callback);
//}
//module.exports = mongoDb;
module.exports = new Db(settings.db, new Server(settings.host, Connection.DEFAULT_PORT), {safe: true}); //创建数据库连接

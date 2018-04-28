var host = '172.17.0.41';
var httpsPort = 3112;
var tcpPort = 3113;

var net = require('net');
var mysql = require('mysql');
var express = require('express');
var bodyParser = require('body-parser');

var sockets = [];
Array.prototype.removeByValue = function(val) {
  for(var i=0; i<this.length; i++) {
    if(this[i] == val) {
      this.splice(i, 1);
      break;
    }
  }
}

/*连接数据库*/
var sqlConn;
function handleError(){
	sqlConn = mysql.createConnection({
		host     : 'w.rdc.sae.sina.com.cn',
  		user     : 'l5n31l05kw',
  		password : 'ilh2yil23h0ihjzi5z112hlx0i4mhmw1j0lky3i2',
  		database : 'app_edvulcan',
  		multipleStatements:true
	})
	sqlConn.connect();

	if (sqlConn) {
		console.log("Database is connecting");
	}
	else{
		sqlConn.connect(function (err){
			if(err){
				console.log('error when connecting to db');
				setTimeout(handleError, 3000);
			}
		});
	}

	sqlConn.on('error', function(err){
		console.log('db error', err);
		if(err.code === 'PROTOCOL_CONNECTION_LOST'){
			setTimeout(handleError, 3000);
		}
		else{
			//console.log(err);
		}
	});
}

handleError();

/*数据库操作*/
var flushId = 'alter table joblist drop job_id;alter table joblist add job_id mediumint(8) not null first;alter table joblist modify column job_id mediumint(8) not null auto_increment, add primary key(job_id);';
var checkList = 'SELECT * FROM ?';
var insertInfo = 'INSERT INTO saveInfo (status, name, sex, phone, job, education, tall, school, major, english, region, email) VALUES("?", "?", "?", "?", "?", "?", "?", "?", "?", "?", "?", "?")';

/*数据库操作--for tcp
var checkList = 'SELECT * FROM ?';*/
var addJob = 'INSERT INTO joblist (job_name, job_explian) VALUES("?", "?")';
var deleJob = 'DELETE FROM joblist WHERE job_id = "?"';
var changeJob = 'UPDATE joblist SET job_name = "?", job_explian = "?" WHERE job_id = "?"';

var getInfos_noRead = 'select * from saveInfo where status = 0;update saveinfo set status = 1 where status = 0;'

var lock = 'lock table ? write;';
var unlock = 'unlock tables;'

/*启动tcp服务监听*/
console.log("Starting TCP server ...");

var tcp = net.createServer(function(sock){
	sockets.push(sock);
	console.log('connected : ' + sock.remoteAddress + ':' + sock.remotePort);
	sock.setNoDelay(true);
	sock.on('data', function(data){
		try{
			var json=JSON.stringify(data);
			var copy=new Buffer(JSON.parse(json));
			var obj = JSON.parse(copy.toString());
		
			switch(obj.type){
				case "addJob": {
					var db = addJob.replace('?', obj.job).replace('?', obj.explain);
					sqlConn.query(db,function (err, result) {
	        			if(err){
	        		  		console.log('[SELECT ERROR] - ',err.message);
	        		  		obj = null;
	        		  		return;
	        			}
					});
					obj = null;
					var db2 = checkList.replace('?', 'jobList');
					sqlConn.query(db2,function (err, result) {
	        			if(err){
	        		  		console.log('[SELECT ERROR] - ',err.message);
	        		  		return;
	        			}
	        			var json=JSON.stringify(result);
	        			if(json !== "[]"){
	        				var str = "{" + '"type"' + ":" + '"reqJobs"' + "},";
	        				json = json.splice(1, 0, str);
	        				json = reqStream(json);
	        				sock.write(json);
	        			}
	        			else{
	        				var str = "{" + '"type"' + ":" + '"reqJobs"' + "}";
	        				json = json.splice(1, 0, str);
	        				json = reqStream(json);
	        				sock.write(json);
	        			}
					});
					break;
				}
				case "getList": {
					var db = checkList.replace('?', 'jobList');
					sqlConn.query(db,function (err, result) {
	        			if(err){
	        		  		console.log('[SELECT ERROR] - ',err.message);
	        		  		obj = null;
	        		  		return;
	        			}
	        			var json=JSON.stringify(result);
	        			if(json !== "[]"){
	        				var str = "{" + '"type"' + ":" + '"reqJobs"' + "},";
	        				json = json.splice(1, 0, str);
	        				json = reqStream(json);
	        				sock.write(json);
	        			}
	        			else{
	        				var str = "{" + '"type"' + ":" + '"reqJobs"' + "}";
	        				json = json.splice(1, 0, str);
	        				json = reqStream(json);
	        				sock.write(json);
	        			}
					});
					obj = null;
					break;
				}
				case "deleteJob": {
					var db = deleJob.replace('?', obj.id);
					db = db + ";" + flushId;
					sqlConn.query(db,function (err, result) {
	        			if(err){
	        		  		console.log('[SELECT ERROR] - ',err.message);
	        		  		obj = null;
	        		  		return;
	        			}
					});
					obj = null;
					var db2 = checkList.replace('?', 'jobList');
					sqlConn.query(db2,function (err, result) {
	        			if(err){
	        		  		console.log('[SELECT ERROR] - ',err.message);
	        		  		return;
	        			}
	        			var json=JSON.stringify(result);
	        			if(json !== "[]"){
	        				var str = "{" + '"type"' + ":" + '"reqJobs"' + "},";
	        				json = json.splice(1, 0, str);
	        				json = reqStream(json);
	        				sock.write(json);
	        			}
	        			else{
	        				var str = "{" + '"type"' + ":" + '"reqJobs"' + "}";
	        				json = json.splice(1, 0, str);
	        				json = reqStream(json);
	        				sock.write(json);
	        			}
					});
					break;
				}
				case "changeJob": {
					var db = changeJob.replace('?', obj.job).replace('?', obj.explain).replace('?', obj.id);
					sqlConn.query(db,function (err, result) {
	        			if(err){
	        		  		console.log('[SELECT ERROR] - ',err.message);
	        		  		obj = null;
	        		  		return;
	        			}
					});
					obj = null;
					var db2 = checkList.replace('?', 'jobList');
					sqlConn.query(db2,function (err, result) {
	        			if(err){
	        		  		console.log('[SELECT ERROR] - ',err.message);
	        		  		return;
	        			}
	        			var json=JSON.stringify(result);
	        			if(json !== "[]"){
	        				var str = "{" + '"type"' + ":" + '"reqJobs"' + "},";
	        				json = json.splice(1, 0, str);
	        				json = reqStream(json);
	        				sock.write(json);
	        			}
	        			else{
	        				var str = "{" + '"type"' + ":" + '"reqJobs"' + "}";
	        				json = json.splice(1, 0, str);
	        				json = reqStream(json);
	        				sock.write(json);
	        			}
					});
					break;
				}
				case "getNoRead": {   //获取未读的人员信息
					var db = getInfos_noRead;
					sqlConn.query(db,function (err, result) {
	        			if(err){
	        		  		console.log('[SELECT ERROR] - ',err.message);
	        		  		obj = null;
	        		  		return;
	        			}
	        			var json=JSON.stringify(result[1]);
	        			if(json !== "[]"){
	        				var str = "{" + '"type"' + ":" + '"reqNoRead"' + "},";
	        				json = json.splice(1, 0, str);
	        				json = reqStream(json);
	        				sock.write(json);
	        			}
	        			else{
	        				var str = "{" + '"type"' + ":" + '"reqNoRead"' + "}";
	        				json = json.splice(1, 0, str);
	        				json = reqStream(json);
	        				sock.write(json);
	        			}
					});
					obj = null;
					break;
				}
			}
		}
		catch(e){
			console.log(e);
		}
	});
	sock.on('end', function(){
		console.log('connect closed : ' + sock.remoteAddress + ':' + sock.remotePort);
		sockets.removeByValue(sock);
	});
	sock.on('error', function(error){
		sockets.removeByValue(sock);
		// console.log(error);
	});
})

if (tcp.listen(tcpPort, host)) {
	console.log('TCP server is listening to port: ' + tcpPort);
}

/*启动https服务监听*/
console.log("Starting HTTPS server ...");

var app = express();
var https = require('https').createServer(app);

var port = httpsPort;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: false
}));

app.post('/post', function(req, res){
	try{
		switch(req.body.req_type){
			case "getJObList": {
				var checkJobList = checkList.replace('?', 'jobList');
				sqlConn.query(checkJobList,function (err, result) {
	        		if(err){
	        		  console.log('[SELECT ERROR] - ',err.message);
	        		  return;
	        		}
	        		res.send(result);
				});
				break;
			}
			case "updateInfo": {
				var insertDB = "";
				if (sockets.length > 0) {
					insertDB = insertInfo.replace('?', "1").replace('?', req.body.info[0].name).replace('?', req.body.info[0].sex).replace('?', req.body.info[0].phone).replace('?', req.body.info[0].job).replace('?', req.body.info[0].education).replace('?', req.body.info[0].tall).replace('?', req.body.info[0].school).replace('?', req.body.info[0].major).replace('?', req.body.info[0].eng).replace('?', req.body.info[0].region).replace('?', req.body.info[0].email);
					var data = JSON.stringify(req.body.info[0]);
					var str = '"type"' + ":" + '"resInfo"' + ",";
	        		data = '[{"type":"resInfo"},' + data + ']';
					// console.log(data);
					sendToClient(data); 		//若有TCP连接则发送
				}
				else {
					insertDB = insertInfo.replace('?', "0").replace('?', req.body.info[0].name).replace('?', req.body.info[0].sex).replace('?', req.body.info[0].phone).replace('?', req.body.info[0].job).replace('?', req.body.info[0].education).replace('?', req.body.info[0].tall).replace('?', req.body.info[0].school).replace('?', req.body.info[0].major).replace('?', req.body.info[0].eng).replace('?', req.body.info[0].region).replace('?', req.body.info[0].email);
				}
				//console.log(insertDB);
				sqlConn.query(insertDB,function (err, result) {
	        		if(err){
	        		  console.log('[SELECT ERROR] - ',err.message);
	        		  return;
	        		}
				});
				res.send(req.body);
				break;
			}
		}
	}
	catch(e){
		console.log(e);
	}
	
})

if (app.listen(httpsPort, host)) {
	console.log('HTTPS server is listening to port: ' + httpsPort);
}

function sendToClient(data){
	for (var i = 0; i <= sockets.length - 1; i++) {
        data = reqStream(data);
		sockets[i].write(data);
	}
}

function reqStream(str){
	var oriBuf = new Buffer(str);
	const head = new Buffer(4);
	head.writeUInt32LE(oriBuf.length, 0);
	var resbuf = new Buffer(4 + oriBuf.length);
	head.copy(resbuf);
	resbuf.fill(oriBuf, 4, 4 + oriBuf.length);
	return resbuf;
}

String.prototype.splice = function(idx, rem, str) {
	return this.slice(0, idx) + str + this.slice(idx + Math.abs(rem));
};


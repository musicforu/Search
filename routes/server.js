var http=require('http');
var work=require('./work');
var mysql=require('mysql');
//配置mysql数据库
var db=mysql.createConnection({
	host:'127.0.0.1',
	port:3306,
	user:'root',
	password:'703298',
	database:'test1'
});

module.exports=db;
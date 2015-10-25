var express = require('express');
var router = express.Router();
var work=require('./work');
var db=require('./server');
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: '信息搜索' });
});
router.post('/',function(req,res,next){
  //获取查询类别（3G,4G）
  var variety=req.body.variety;
  //获取分公司名称
  var name=req.body.searchEle;
  //获取模糊查找下的查询值
  var screening=req.body.screening;
  //查询名称
  var condition=req.body.condition;
  //查询信息的起始时间
  var timeFrom=req.body.timeFrom;
  //查询信息的截止时间
  var timeEnd=req.body.timeEnd;
  //按范围查找条件下的最小查询值
  var min=req.body.min;
  //按范围查找条件下的最大查询值
  var max=req.body.max;
  //查询厂家值（华为，爱立信）
  var vender=req.body.vender;
  //查询方式（模糊查找，范围查找）
  var type=req.body.type;
  if(variety=='3G'){
    work.getThird(vender,type,timeFrom,timeEnd,condition,screening,db,res,min,max,name)
  }else{
    work.getVender(vender,type,timeFrom,timeEnd,condition,screening,db,res,min,max,name);
  }
  
  //console.log(content)
/*  res.render('searchContent',{
  	title:'Search for '+name,
  	content:content	
  })*/
  //console.log(screening);
  //console.log('I received '+name);
  
})
//渲染未查询到 页面
router.get('/notFound',function(req,res,next){
  res.render('notFound',{
  	title:'未查询到'
  })
})
module.exports = router;

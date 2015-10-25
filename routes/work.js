var db=require('./server');
var async=require('async');
//4G爱立信指标
var Ericsson=['基站英文名称','基站中文名称','EUtranCell Id','日期','RRC_建立请求次数','掉线率','无线接入成功率'];
//4G华为指标
var HuaWei=['小区名称','掉线率','同频切换成功率'];
//3G指标
var Third=['1X标识','镇区','尝试次数_cs','起始时间','载频号','扇区号','小区号','扇区掉话'];

//查询3G参数值 
exports.getThird=function(vender,type,timeFrom,timeEnd,condition,screening,db,res,min,max,name){
  //根据用户输入的3G查找值（可能不准确），查询数据库中mysql标准键的值
  var newCondition=getThirdDim(condition);
  //存储查询出来的信息
  var rowsContent=[];
  //获取按时间段查询的查询连续天数如timelength=20150810-20150803+1=8天
  var timeLength=parseInt(timeEnd.slice(0,8))-parseInt(timeFrom.slice(0,8))+1;
      if(type=="模糊查找"){
        //根据查询的值，和分公司名称，返回一个可以进行模糊匹配的数组（查询条件）
        var queryEle=getDimEle(screening,name);
        console.log('queryEle',queryEle);
        //遍历在查询时间段范围内的所有表
        for(var i=0;i<timeLength;i++){
        //返回需要查询的表的名称                    
          var tableName=getThirdName(timeFrom,i).toString();
          console.log('tableName',tableName);
          if(name){
            //如果查询的值中包含分公司名称，查询语句为：查找出起始时间，小区号，查询的值从表的名称中，条件是查询值为？并且分公司为？
            var query='SELECT 起始时间,小区号,'+newCondition[0]+' FROM '+tableName+' WHERE '+newCondition[0]+' LIKE? AND 分公司 LIKE ?';
            console.log('query',query);
          }else{
            //如果查询的值中不包含分公司名称，查询语句为：查找出起始时间，小区号，查询的值从表的名称中，条件是查询值为？
            var query='SELECT 起始时间,小区号,'+newCondition[0]+' FROM '+tableName+' WHERE '+newCondition[0]+' LIKE? ';
            console.log('query',query);
          }          
          console.log('query',query);
          //根据查询语句和查询值从数据库中返回所需信息，放在rowsContent数组中
          getContent(query,queryEle,db,rowsContent);
        }
        setTimeout(function(){
          showResult(condition,rowsContent,res);
        },1000)
      }else{
        //按照查询的指标值的范围进行查找
        //返回查询条件中的最小值，最大值，分公司名称
        var queryEle=getRangeEle(min,max,name);
        for(var i=0;i<timeLength;i++){    
          //获取表的名称                
          var tableName=getThirdName(timeFrom,i);
          if(name){
            //如果查询的值中包含分公司名称，查询语句为：查找出起始时间，小区号，查询的指标从表的名称中，条件是查询指标范围为（？，？）？并且分公司为？
            var query='SELECT 起始时间,小区号,'+newCondition[0]+' FROM '+tableName+' WHERE ('+newCondition[0]+' BETWEEN ? AND ?) AND 分公司 LIKE ?';
          }else{
            var query='SELECT 起始时间,小区号,'+newCondition[0]+' FROM '+tableName+' WHERE ('+newCondition[0]+' BETWEEN ? AND ?) ';
          }          
          console.log('query',query);
          getContent(query,queryEle,db,rowsContent);
        }
        //1s后将查询结果渲染在页面上
        setTimeout(function(){
          showResult(condition,rowsContent,res);
        },1000)
    }
}
//查询4G参数值
exports.getVender=function(vender,type,timeFrom,timeEnd,condition,screening,db,res,min,max,name){
  //获取按时间段查询的查询连续天数如timelength=20150810-20150803+1=8天
  var timeLength=timeEnd.slice(8)-timeFrom.slice(8)+1;  
  //放置查询结果
  var rowsContent=[];
  //根据查询厂家的不同使用不同查询语句
  switch(vender){
    case'爱立信':
    //根据查询的指标名称（可能不准确），返回爱立信指标数组中的标准数据库表的键的名称
      var newCondition=getEricssonDim(condition);
      if(type=="模糊查找"){
        console.log(vender,type,timeFrom,timeEnd,condition,screening);        
        console.log('newCondition',newCondition);        
        console.log('timelength',timeLength);   
        //根据查询的值，和分公司名称，返回一个可以进行模糊匹配的数组     
        var queryEle=getDimEle(screening,name);
        console.log('queryEle',queryEle);
        //遍历在查询时间段范围内的所有表
        for(var i=0;i<timeLength;i++){    
        //获取爱立信数据库中表的名称      
          var tableName=getEricssonName(timeFrom,i)
          var query='SELECT 基站中文名称,日期,'+newCondition[0]+' FROM '+tableName+' WHERE '+newCondition[0]+' LIKE?';
          console.log('query',query);
          getContent(query,queryEle,db,rowsContent);
        }
        setTimeout(function(){
          showResult(condition,rowsContent,res);
        },1000)
      
      }else{
        //指标按照范围查找
        for(var i=0;i<timeLength;i++){          
          var tableName=getEricssonName(timeFrom,i)
          var query='SELECT 基站中文名称,日期,'+newCondition[0]+' FROM '+tableName+' WHERE '+newCondition[0]+' BETWEEN  ? AND ?';
          var queryEle=getRangeEle(min,max);
          console.log('query',query);
          getContent(query,queryEle,db,rowsContent);
        }
        setTimeout(function(){
          showResult(condition,rowsContent,res);
        },1000)

      }
      break;
    case'华为':
    //查询华为指标 同爱立信
      var newCondition=getHuaWeiDim(condition);
      if(type=="模糊查找"){
        var queryEle=getDimEle(screening,name);
        for(var i=0;i<timeLength;i++){                    
          var tableName=getHuaweiName(timeFrom,i);
          if(name){
            var query='SELECT 日期,小区名称,'+newCondition[0]+' FROM '+tableName+' WHERE '+newCondition[0]+' LIKE? AND 分公司 LIKE ?';
          }else{
            var query='SELECT 日期,小区名称,'+newCondition[0]+' FROM '+tableName+' WHERE '+newCondition[0]+' LIKE? ';
          }          
          console.log('query',query);
          getContent(query,queryEle,db,rowsContent);
        }
        setTimeout(function(){
          showResult(condition,rowsContent,res);
        },1000)
      }else{
        var queryEle=getRangeEle(min,max,name);
        for(var i=0;i<timeLength;i++){                    
          var tableName=getHuaweiName(timeFrom,i);
          if(name){
            var query='SELECT 日期,小区名称,'+newCondition[0]+' FROM '+tableName+' WHERE ('+newCondition[0]+' BETWEEN ? AND ?) AND 分公司 LIKE ?';
          }else{
            var query='SELECT 日期,小区名称,'+newCondition[0]+' FROM '+tableName+' WHERE ('+newCondition[0]+' BETWEEN ? AND ?) ';
          }          
          console.log('query',query);
          getContent(query,queryEle,db,rowsContent);
        }
        setTimeout(function(){
          showResult(condition,rowsContent,res);
        },1000)

      }
      break;
  }

}
//爱立信模糊查找
function getDimQuery(timeFrom,timeEnd,condition,screening){
  var newCondition=getEricssonDim(condition);

  var query='SELECT 基站中文名称,'+newCondition[0]+' FROM '+time+' WHERE '+newCondition[0]+' LIKE?';

  return query;
};
//华为模糊查找
function getHuaWeiDimQuery(time,condition,screening,name){
  if(name){
    var newCondition=getHuaWeiDim(condition);
    console.log(newCondition);
    var query='SELECT 小区名称,行政区,'+newCondition[0]+' FROM '+time+' WHERE '+newCondition[0]+' LIKE? AND 行政区 LIKE ?';
    console.log(query);
    return query;
  }else{
    var newCondition=getHuaWeiDim(condition);
    return query='SELECT 小区名称,行政区,'+newCondition[0]+' FROM '+time+' WHERE '+newCondition[0]+' LIKE? ';
  }
  
};
//根据查询的值，和分公司名称，返回一个可以进行模糊匹配的数组
function getDimEle(screening,name){
  var newScreening='%'+screening+'%';//模糊匹配值
  var name=name||'';
  var queryEle=[newScreening,name];
  console.log(queryEle);
  return queryEle;
}
function getRangeQuery(time,condition){
  var newCondition=getEricssonDim(condition);
  var query='SELECT 基站中文名称,'+newCondition[0]+' FROM '+time+' WHERE '+newCondition[0]+' BETWEEN  ? AND ?'
  console.log(query);
  return query;
}
function getHuaWeiRangeQuery(time,condition,name){
  if(name){
    var newCondition=getHuaWeiDim(condition);
    var query='SELECT 小区名称,行政区,'+newCondition[0]+' FROM '+time+' WHERE ('+newCondition[0]+' BETWEEN  ? AND ?) AND 行政区 LIKE ?'
    console.log(query);
    return query;
  }else{
    var newCondition=getHuaWeiDim(condition);
    var query='SELECT 小区名称,行政区,'+newCondition[0]+' FROM '+time+' WHERE '+newCondition[0]+' BETWEEN  ? AND ? '
    return query;
  }
  
}
//返回查询条件中的最小值，最大值，分公司名称
function getRangeEle(min,max,name){
  name=name||'';
  console.log(min,max);
  return [min,max,name];
}
//根据查询语句和查询值从数据库中返回所需信息，放在rowsContent数组中
function getContent(query,queryEle,db,rowsContent){
  db.query(query,queryEle,function(err,rows){ 
           console.log('rows',rows);
           for(var i=0;i<rows.length;i++){
            rowsContent.push(rows[i]);
           }          
           console.log('数据库信息',rowsContent);                     
         });
  console.log('数据库信息2',rowsContent);
}
//根据查询的指标名称（可能不准确），返回爱立信指标数组中的标准数据库表的键的名称
function getEricssonDim(element){
  var tmp=Ericsson.filter(function(item,index,array){
            var pattern=new RegExp('^.*'+element+'.*$','i');
            return (pattern.test(item));
         })
  return tmp;
}
//根据查询的指标名称（可能不准确），返回华为指标数组中的标准数据库表的键的名称
function getHuaWeiDim(element){
  var tmp=HuaWei.filter(function(item,index,array){
            var pattern=new RegExp('^.*'+element+'.*$','i');
            return (pattern.test(item));
         })
  return tmp;
}
//根据输入的element的模糊名称，返回在3G指标数组中的标准名称
function getThirdDim(element){
  var tmp=Third.filter(function(item,index,array){
            var pattern=new RegExp('^.*'+element+'.*$','i');
            return (pattern.test(item));
         })
  return tmp;
}
//获取爱立信数据库中表的名称
function getEricssonName(prev,i){
  var newPrev=parseInt(prev.slice(8))+i;
  return prev.slice(0,8)+newPrev;
}
//获取华为数据库中表的名称
function getHuaweiName(prev,i){
  var newPrev=parseInt(prev.slice(6))+i;
  return prev.slice(0,6)+newPrev;
}
//将查询结果渲染在页面上
function showResult(condition,rowsContent,res){
  console.log('rowsContent[0]',rowsContent[0]);
  if(rowsContent[0]!=null){
           res.render('searchContent',{
             title:'Search for '+condition,//查询值
             content:rowsContent//查询结果
            })
       }else{
           res.redirect('/notFound');//如果未查询到跳转至notFound页面
       }      
}
//返回需要查询的表的名称如201507091x
function getThirdName(prev,i){
  var newPrev=parseInt(prev.slice(0,8))+i;
  return newPrev+'1x';
}


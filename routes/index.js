let express = require('express');
let router = express.Router();
const { Sequelize, Model, DataTypes } = require('sequelize');


let bodyParser = require('body-parser');
const { Json } = require('sequelize/lib/utils');
/* GET home page. */


const webSocketServer = require('websocket').server;
const ServerPort = 3001;

const app = express();
app.all('*', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Content-Type,Content-Length, Authorization, Accept,X-Requested-With");
  res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
  res.header("X-Powered-By",' 3.2.1')
  if(req.method=="OPTIONS") res.send(200);/*让options请求快速返回*/
  else  next();
});
// app.use(bodyParser.json({limit: '500mb'}));
// app.use(bodyParser.urlencoded({limit: '500mb', extended: true}));
var jsonParser = bodyParser.json()
let map=new Map()
let tasklist=[]
let taskmap=new Map()
let resultmap=new Map()
let taskidpointer=0

app.get('/', function(req, res, next) {
  res.send('启动成功1');
});

// 创建应用服务器
/*const server = http.createServer(app);

// 启动Http服务
server.listen(ServerPort, function() {
  console.log('listening 3001, 启动成功');
});

//
wss = new webSocketServer({
  httpServer: server,
  autoAcceptConnections: true // 默认：false
});
var GPUws=null;
wss.on('connect', function(ws){
  console.log('服务端： GPU已经连接');
  ws.on('message', function (message) {
    console.log(message);
    ws.send(`服务器接收消息:${message}`)
  })
  setInterval(function(){
    ws.send("ok")
  }, 1000);
  GPUws=ws
})
wss.on('close', function(ws){
  console.log('服务端： 客户端发起关闭');
  // ws.on('message', function (message) {
  //   console.log(message);
  // })
})
const clients = {};
// This code generates unique userid for everyuser.
const getUniqueID = () => {
  const s4 = () => Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
  return s4() + s4() + '-' + s4();
};


wss.on('request', function(request) {
  console.log('发送请求');
  const userID = getUniqueID();
  console.log((new Date()) + ' Recieved a new connection from origin ' + request.origin + '.');
  const connection = request.accept(null, request.origin);
  clients[userID] = connection;
  console.log('connected: ' + userID + ' in ' + Object.getOwnPropertyNames(clients))
});
*/

app.post('/ajax/sendmodel',jsonParser,(request, response) => {
  // 设置响应头  设置允许跨域
  response.setHeader('Accss-Control-Allow-Origin', '*');
  //console.log(request.body)
  var model=request.body.model;
  var dataset=request.body.dataset;
  //var id=request.body.id;
  console.log(request.session.user)
  var id=request.session.user.id;
  request.body.id=id.toString();
  var type=request.body.type;
  //map.set(id,request.body)
  
  //console.log(model)
  //console.log(dataset)
  console.log(id)
  if(type=="lgbm")
  {
    resultmap.delete(id+"_lgbm")
    resultmap.delete(id+"_lgbmcol")
  }
    
  if(type=="nn")
  {
    resultmap.delete(id+"_nn")
    resultmap.delete(id+"_nncol")
  }
 
  //GPUws.send("id#"+id)
  if(taskidpointer>200)
  {
    taskmap.delete((taskidpointer-200));
  }
  taskidpointer=taskidpointer+1;
  taskmap.set(taskidpointer,request.body)
  tasklist.push({taskid:taskidpointer,userid:id})
  //console.log(taskmap)
  // 设置响应体
  return response.send({status:"success",taskid:taskidpointer});

});
app.post('/ajax/sendmodelcol',jsonParser,(request, response) => {
  try {
     // 设置响应头  设置允许跨域
  response.setHeader('Accss-Control-Allow-Origin', '*');
  console.log(request.body)
  //var id=request.body.id;
  var id=request.session.user.id;
  request.body.id=id.toString();
  var maintaskid=request.body.maintaskid;
  var type=request.body.type;
  var modeldata=taskmap.get(maintaskid);
  modeldata.selectvalue=request.body.selectvalue;
  modeldata.colid=request.body.colid;
  modeldata.idcolid=request.body.idcolid;
  modeldata.labelcolid=request.body.labelcolid;
  modeldata.type=type;
  //console.log(dataset)
  // resultmap.delete(id+"_lgbmcol")
  // resultmap.delete(id+"_nncol")
  console.log(request.body)
  //GPUws.send("id#"+id)
  // 设置响应体
  if(taskidpointer>200)
  {
    taskmap.delete((taskidpointer-200));
  }
  taskidpointer=taskidpointer+1;
  taskmap.set(taskidpointer,modeldata)

  tasklist.push({taskid:taskidpointer,userid:id})
  console.log(taskmap)
  response.send({status:"success",taskid:taskidpointer});
    
  } catch (error) {
    console.log(error)
  }
 
});
app.post('/ajax/sendmodelrow',jsonParser,(request, response) => {
  try {
     // 设置响应头  设置允许跨域
  response.setHeader('Accss-Control-Allow-Origin', '*');
  console.log(request.body)
  //var id=request.body.id;
  var id=request.session.user.id;
  request.body.id=id.toString();
  var maintaskid=request.body.maintaskid;
  var type=request.body.type;
  var modeldata={...taskmap.get(maintaskid)};
  modeldata.jsondata=request.body.jsondata;
  modeldata.colid=request.body.colid;
  modeldata.idcolid=request.body.idcolid;
  modeldata.labelcolid=request.body.labelcolid;
  modeldata.type=type;
  delete modeldata.norun; 
  //console.log(dataset)
  // resultmap.delete(id+"_lgbmcol")
  // resultmap.delete(id+"_nncol")
  console.log(request.body)
  //GPUws.send("id#"+id)
  // 设置响应体
  if(taskidpointer>200)
  {
    taskmap.delete((taskidpointer-200));
  }
  taskidpointer=taskidpointer+1;
  taskmap.set(taskidpointer,modeldata)

  tasklist.push({taskid:taskidpointer,userid:id})
  console.log(taskmap)
  response.send({status:"success",taskid:taskidpointer});
    
  } catch (error) {
    console.log(error)
  }
 
});
app.post('/ajax/sendmodelp',jsonParser,(request, response) => {
  try {
     // 设置响应头  设置允许跨域
  response.setHeader('Accss-Control-Allow-Origin', '*');
  console.log(request.body)
  //var id=request.body.id;
  var id=request.session.user.id;
  request.body.id=id.toString();
  var maintaskid=request.body.maintaskid;
  var type=request.body.type;
  var modeldata={...taskmap.get(maintaskid)};
  //modeldata.jsondata=request.body.jsondata;
  // modeldata.colid=request.body.colid;
  modeldata.idcolid=request.body.idcolid;
  modeldata.cidx=request.body.cidx;
  modeldata.labelcolid=request.body.labelcolid;
  modeldata.type=type;
  delete modeldata.norun;
  if(request.body.hasOwnProperty("output"))
  {
    console.log(request.body.output)
    modeldata.output=request.body.output;
  }
   
  //console.log(dataset)
  // resultmap.delete(id+"_lgbmcol")
  // resultmap.delete(id+"_nncol")
  console.log(request.body)
  //GPUws.send("id#"+id)
  // 设置响应体
  if(taskidpointer>200)
  {
    taskmap.delete((taskidpointer-200));
  }
  taskidpointer=taskidpointer+1;
  taskmap.set(taskidpointer,modeldata)

  tasklist.push({taskid:taskidpointer,userid:id})
  console.log(taskmap)
  response.send({status:"success",taskid:taskidpointer});
    
  } catch (error) {
    console.log(error)
  }
 
});
app.post('/ajax/sendmodelpl',jsonParser,(request, response) => {
  try {
     // 设置响应头  设置允许跨域
  response.setHeader('Accss-Control-Allow-Origin', '*');
  console.log(request.body)
  //var id=request.body.id;
  var id=request.session.user.id;
  request.body.id=id.toString();
  var maintaskid=request.body.maintaskid;
  var type=request.body.type;
  var modeldata={...taskmap.get(maintaskid)};
  modeldata.jsondata=request.body.jsondata;
  if(request.body.jsondata2!=undefined)
    modeldata.jsondata2=request.body.jsondata2;
  //modeldata.colid=request.body.colid;
  modeldata.cidx=request.body.cidx;
  modeldata.idcolid=request.body.idcolid;
  modeldata.labelcolid=request.body.labelcolid;
  modeldata.type=type;
  delete modeldata.norun; 
  if(request.body.hasOwnProperty("output"))
  {
    console.log(request.body.output)
    modeldata.output=request.body.output;
  }
  //console.log(dataset)
  // resultmap.delete(id+"_lgbmcol")
  // resultmap.delete(id+"_nncol")
  console.log(request.body)
  //GPUws.send("id#"+id)
  // 设置响应体
  if(taskidpointer>200)
  {
    taskmap.delete((taskidpointer-200));
  }
  taskidpointer=taskidpointer+1;
  taskmap.set(taskidpointer,modeldata)

  tasklist.push({taskid:taskidpointer,userid:id})
  console.log(taskmap)
  response.send({status:"success",taskid:taskidpointer});
    
  } catch (error) {
    console.log(error)
  }
 
});

app.post('/ajax/sendmodelcm',jsonParser,(request, response) => {
  try {
     // 设置响应头  设置允许跨域
  response.setHeader('Accss-Control-Allow-Origin', '*');
  console.log(request.body)
  //var id=request.body.id;
  var id=request.session.user.id;
  request.body.id=id.toString();
  var maintaskid=request.body.maintaskid;
  var type=request.body.type;
  var modeldata={...taskmap.get(maintaskid)};
  //modeldata.jsondata=request.body.jsondata;
  // modeldata.colid=request.body.colid;
  modeldata.idcolid=request.body.idcolid;
  modeldata.cidx=request.body.cidx;
  modeldata.labelcolid=request.body.labelcolid;
  modeldata.type=type;
  delete modeldata.norun;
  console.log(request.body)
  //GPUws.send("id#"+id)
  // 设置响应体
  if(taskidpointer>200)
  {
    taskmap.delete((taskidpointer-200));
  }
  taskidpointer=taskidpointer+1;
  taskmap.set(taskidpointer,modeldata)

  tasklist.push({taskid:taskidpointer,userid:id})
  console.log(taskmap)
  response.send({status:"success",taskid:taskidpointer});
    
  } catch (error) {
    console.log(error)
  }
 
});
app.get('/ajax/checkresult',jsonParser,(request, response) => {
  try {
  // 设置响应头  设置允许跨域
  response.setHeader('Accss-Control-Allow-Origin', '*');
  //console.log(request.query)
  var params = request.query
  //var userid=params.userid;
  var userid=request.session.user.id;
  request.body.id=userid;
  var taskid=parseInt(params.taskid);

  var type=params.type;
  console.log(userid+"_"+type+"_"+taskid)
  //var modeldata=map.get(userid)
  var modeldata=taskmap.get(taskid)
  if(modeldata==null)
  {
    response.json({status:"empty"})
  }
  else
  {
    var resultdata=null;
    if(type=="nn")
      resultdata=resultmap.get(taskid+"_nn")
    else if(type=="lgbm")
      resultdata=resultmap.get(taskid+"_lgbm")
    else if(type=="lgbmcol")
      resultdata=resultmap.get(taskid+"_lgbmcol")
    else if(type=="lgbm_p")
      resultdata=resultmap.get(taskid+"_lgbm_p")
    else if(type=="lgbm_pl")
      resultdata=resultmap.get(taskid+"_lgbm_pl")
    else if(type=="nncol")
      resultdata=resultmap.get(taskid+"_nncol")
    else if(type=="lgbmrow")
      resultdata=resultmap.get(taskid+"_lgbmrow")
    else if(type=="nnrow")
      resultdata=resultmap.get(taskid+"_nnrow")
    else if(type=="nn_p")
      resultdata=resultmap.get(taskid+"_nn_p")
    else if(type=="nn_pl")
      resultdata=resultmap.get(taskid+"_nn_pl")
    else if(type=="lgbm_cm")
      resultdata=resultmap.get(taskid+"_lgbm_cm")
    else if(type=="nn_cm")
      resultdata=resultmap.get(taskid+"_nn_cm")
    //console.log(resultdata)
    if(resultdata!=null)
    {
      var dataforsend={...resultdata};
      if(dataforsend.hasOwnProperty("outputlen"))
      {
        var len=parseInt(dataforsend.outputlen);
        for (var i=0;i<len;i++)
        {
          if(i!=0)
          {
            delete dataforsend[type+"_summary_plot_"+i]
            delete dataforsend[type+"_decision_plot_"+i]
          }
          if((type=="nn_p"||type=="nn_pl")&&(modeldata.hasOwnProperty("output")&&modeldata.output!=i))
          {
            var typetemp="nn";
            if(type=="nn_pl")
              typetemp="nnrow";
            var rawheaders=dataforsend.headers
            var idx=parseInt(dataforsend.idx)
            var header=rawheaders[idx]
            delete dataforsend[typetemp+"_partial_dependence_plot_"+header+"_"+i]
          }
           
        }
        dataforsend.output=modeldata.output;
        response.json(dataforsend)
      }
      else
        response.json(resultdata)
    }
      
    else if(resultdata==null&&modeldata!=null&&modeldata.running==1)
      response.json({status:"running"});
    else
      response.json({status:"empty"});
  

  }
} catch (error) {
  console.log(error)
}
});

app.get('/ajax/getbyoutput',jsonParser,(request, response) => {
  try {
  // 设置响应头  设置允许跨域
  response.setHeader('Accss-Control-Allow-Origin', '*');
  //console.log(request.query)
  var params = request.query
  //var userid=params.userid;
  var userid=request.session.user.id;
  request.body.id=userid;
  var taskid=parseInt(params.taskid);
  var type=params.type;
  var pos=params.pos;
  var subtaskid=parseInt(params.subtaskid);
  var subtype=params.subtype
  console.log(userid+"_"+type+"_"+taskid)
  //var modeldata=map.get(userid)
  var modeldata=taskmap.get(taskid)
  if(modeldata==null)
  {
    response.json({status:"empty"})
  }
  else
  {
    var resultdata=null;
    if(type=="nn")
      resultdata=resultmap.get(taskid+"_nn")
    else if(type=="lgbm")
      resultdata=resultmap.get(taskid+"_lgbm")
    else if(type=="lgbmcol")
      resultdata=resultmap.get(taskid+"_lgbmcol")
    else if(type=="lgbm_p")
      resultdata=resultmap.get(taskid+"_lgbm_p")
    else if(type=="lgbm_pl")
      resultdata=resultmap.get(taskid+"_lgbm_pl")
    else if(type=="nncol")
      resultdata=resultmap.get(taskid+"_nncol")
    else if(type=="lgbmrow")
      resultdata=resultmap.get(taskid+"_lgbmrow")
    else if(type=="lgbm_cm")
      resultdata=resultmap.get(taskid+"_lgbm_cm")
    else if(type=="nnrow")
      resultdata=resultmap.get(taskid+"_nnrow")
    else if(type=="nn_p")
      resultdata=resultmap.get(taskid+"_nn_p")
    else if(type=="nn_pl")
      resultdata=resultmap.get(taskid+"_nn_pl")
    else if(type=="nn_cm")
      resultdata=resultmap.get(taskid+"_nn_cm")
    //console.log(resultdata)
    if(resultdata!=null)
    {
        var typetemp="";
        if(type.indexOf("nn")!=-1)
          typetemp="nn";
        else  if(type.indexOf("lgbm")!=-1)
          typetemp="lgbm";
        var summary_plot= resultdata[typetemp+"_summary_plot_"+pos];
        var decision_plot= resultdata[typetemp+"_decision_plot_"+pos];
        
        if(subtaskid!=-1)
        {
          var resultdata2=resultmap.get(subtaskid+"_"+subtype)
          console.log(resultdata2)
          var rawheaders=resultdata2.headers
          var idx=parseInt(resultdata2.idx)
          var header=rawheaders[idx]
          var partial_dependence_plot= resultdata2[type+"_partial_dependence_plot_"+header+"_"+pos];
          if(type=="nnrow")
        {
          var waterfall_plot=resultdata[typetemp+"_waterfall_plot_"+pos];
          response.json({summary_plot:summary_plot,decision_plot:decision_plot,partial_dependence_plot:partial_dependence_plot,waterfall_plot:waterfall_plot})
        }
          response.json({summary_plot:summary_plot,decision_plot:decision_plot,partial_dependence_plot:partial_dependence_plot})
          
        }
        else
        {
          if(type=="nnrow")
          {
            var waterfall_plot=resultdata[typetemp+"_waterfall_plot_"+pos];
            response.json({summary_plot:summary_plot,decision_plot:decision_plot,waterfall_plot:waterfall_plot})
          }
          response.json({summary_plot:summary_plot,decision_plot:decision_plot})
        }
       
    }
      
    else if(resultdata==null&&modeldata!=null&&modeldata.running==1)
      response.json({status:"running"});
    else
      response.json({status:"empty"});
  

  }
} catch (error) {
  console.log(error)
}

});

app.get('/ajax/getrecordlist',jsonParser,async (request, response) => {
  // 设置响应头  设置允许跨域
  response.setHeader('Accss-Control-Allow-Origin', '*');
  //console.log(request.query)
  var params = request.query
  //var userid=params.userid;
  var type=params.type;
  try {
    var userid=request.session.user.id;
    const records=await getResultList(userid,type);
    response.json(records);
  } catch (error) {
    console.log(error)
  }
 

});
app.get('/ajax/getdetailrecord',jsonParser,async (request, response) => {
  // 设置响应头  设置允许跨域
  response.setHeader('Accss-Control-Allow-Origin', '*');
  //console.log(request.query)
  var params = request.query
  //var userid=params.userid;
  var recordid=params.recordid;
  try {
    var userid=request.session.user.id;
    const records=await getDetailResult(userid,recordid);
    response.json(records);
  } catch (error) {
    console.log(error)
  }


});

app.get('/ajax/getprojectlist',jsonParser,async (request, response) => {
  // 设置响应头  设置允许跨域
  response.setHeader('Accss-Control-Allow-Origin', '*');
  //console.log(request.query)
  var params = request.query
  //var userid=params.userid;
  try {
    var userid=request.session.user.id;
    const projects=await getProjectList(userid);
    var projectforsend=[];
    for(var i=0;i<projects.length;i++)
    {
      projectforsend.push({dashboardid:projects[i].dashboardid,userid:projects[i].userid,name:projects[i].name,type:projects[i].type,createdAt:projects[i].createdAt})
    }
    response.json(projects);
  } catch (error) {
    console.log(error)
  }
 

});

app.get('/ajax/getdetailproject',jsonParser,async (request, response) => {
  // 设置响应头  设置允许跨域
  response.setHeader('Accss-Control-Allow-Origin', '*');
  //console.log(request.query)
  var params = request.query
  //var userid=params.userid;
  var dashboardid=params.dashboardid;
  try {
    var userid=request.session.user.id;
    const records=await getDetailProject(userid,dashboardid);
    var taskid=await createtask(records,userid)
    response.json({dataset:records.dataset,name:records.name,type:records.type,idcolid:records.idcolid,labelcolid:records.labelcolid,recordid:records.recordid,taskid:taskid});
  } catch (error) {
    console.log(error)
  }


});
async function createtask(body,user)
{
  //console.log(body)
  var model=body.model;
  var dataset=body.dataset;
  //var id=request.body.id;
  console.log(user)
  var id=user;
  body.id=id.toString();
  var type=body.type;
  //map.set(id,request.body)
  if(taskidpointer>200)
  {
    taskmap.delete((taskidpointer-200));
  }
  taskidpointer=taskidpointer+1;
  
  let project=body.dataValues;
  //console.log(project)
  project["norun"]=1;
  project["id"]=project.userid;
  taskmap.set(taskidpointer,project)
  tasklist.push({taskid:taskidpointer,userid:id})
  console.log(tasklist)
  var taskid=taskidpointer;
  //console.log(model)
  //console.log(dataset)
  const records=await getDetailResult(id,body.recordid);
  //GPUws.send("id#"+id)
  //console.log(records)
  if(body.type=="nn")
  {
    resultmap.set(taskid+"_nn",JSON.parse(records.json_data))
  
  }
  else if(body.type=="lgbm")
  {
    resultmap.set(taskid+"_lgbm",JSON.parse(records.json_data))
  }
  //console.log(taskmap)
  // 设置响应体
  return taskidpointer;
}
app.get('/py/getdata',jsonParser,(request, response) => {
  // 设置响应头  设置允许跨域
  response.setHeader('Accss-Control-Allow-Origin', '*');
  console.log(request.query)
  var params = request.query
  userid=params.userid;
  //var userid=req.session.user.id;
  var taskid=parseInt(params.taskid);
  var need=parseInt(params.need);
  console.log(userid+","+need+","+taskid);
  var modeldata=taskmap.get(taskid)
  // 设置响应体
  // console.log(modeldata)
  if(modeldata!=null)
  {
    if(need==0)
    {
      delete modeldata.model;
      delete modeldata.dataset;
    }
    response.json(modeldata)
    modeldata["running"]=1
  }
  else
    response.json({status:"failed"})

});


app.get('/py/polling',jsonParser,(request, response) => {
  // 设置响应头  设置允许跨域
  response.setHeader('Accss-Control-Allow-Origin', '*');
  console.log(request.query)
  var pytaskid = parseInt(request.query.taskid);
  var count = parseInt(request.query.count);
  console.log("taskid:"+taskidpointer+"  pytaskid:"+pytaskid)
  if(count==0)
  {
    return response.json({taskid:taskidpointer,userid:"0",type:-1,dashboardid:-1})
  }
  if((taskidpointer>0)&&(taskidpointer>pytaskid))
  {
    console.log("userid:"+taskmap.get(pytaskid+1)["id"])
    console.log(taskmap.get(pytaskid+1)["type"])
    response.json({taskid:pytaskid+1,userid:taskmap.get(pytaskid+1)["id"],type:taskmap.get(pytaskid+1).hasOwnProperty("type")?taskmap.get(pytaskid+1)["type"]:-1,dashboardid:taskmap.get(pytaskid+1).hasOwnProperty("dashboardid")?taskmap.get(pytaskid+1)["dashboardid"]:-1})
  }
  else
  {
    response.json({taskid:taskidpointer,userid:"0",type:-1,dashboardid:-1})
  }
  

});
app.post('/py/returndata',jsonParser,async(request, response) => {
  try {
      // 设置响应头  设置允许跨域
  response.setHeader('Accss-Control-Allow-Origin', '*');
  console.log(request)
  var params = request.body
  var userid=params.userid;
  var taskid=parseInt(params.taskid)
  console.log(userid+","+taskid)
  var modeldata=taskmap.get(taskid)
  // console.log(modeldata)
  modeldata["running"]=0;
  let record=null;
  if(request.body.type=="nn")
  {
    resultmap.set(taskid+"_nn",request.body)
    if(request.body.error==undefined)
    {
      record=await saveResult(userid,request.body.type,request.body);
      await saveProject(userid,modeldata.name,modeldata.type,modeldata.dataset,modeldata.model,modeldata.idcolid,modeldata.labelcolid,record.dataValues.record_id)
      //return response.json({status:"success",recordid:record.record_id})
    }
     
      
  }
  else if(request.body.type=="lgbm")
  {
    resultmap.set(taskid+"_lgbm",request.body)
    if(request.body.error==undefined)
    {
      record=await saveResult(userid,request.body.type,request.body);
      console.log(record.dataValues)
      await saveProject(userid,modeldata.name,modeldata.type,modeldata.dataset,modeldata.model,modeldata.idcolid,modeldata.labelcolid,record.dataValues.record_id)
      //return response.json({status:"success",recordid:record.record_id})
    }
  }
  else if(request.body.type=="lgbmcol")
  {
    resultmap.set(taskid+"_lgbmcol",request.body)
  }
  else if(request.body.type=="nncol")
  {
    resultmap.set(taskid+"_nncol",request.body)
  }
  else if(request.body.type=="lgbmrow")
  {
    resultmap.set(taskid+"_lgbmrow",request.body)
  }
  else if(request.body.type=="lgbm_p")
  {
    resultmap.set(taskid+"_lgbm_p",request.body)
  }
  else if(request.body.type=="lgbm_pl")
  {
    resultmap.set(taskid+"_lgbm_pl",request.body)
  }
  else if(request.body.type=="nnrow")
  {
    resultmap.set(taskid+"_nnrow",request.body)
  }
  else if(request.body.type=="nn_p")
  {
    resultmap.set(taskid+"_nn_p",request.body)
  }
  else if(request.body.type=="nn_pl")
  {
    resultmap.set(taskid+"_nn_pl",request.body)
  }
  else if(request.body.type=="lgbm_cm")
  {
    resultmap.set(taskid+"_lgbm_cm",request.body)
  }
  else if(request.body.type=="nn_cm")
  {
    resultmap.set(taskid+"_nn_cm",request.body)
  }
  return response.json({status:"success"})
  
  } catch (error) {
    console.log(error)
  }


});
//47.242.115.75
// Glassbox0128@
// const sequelize = new Sequelize('shapdatabase', 'admin', 'Glassbox0128@', {
//   host: '47.242.115.75',
//   dialect: 'mysql',/* 选择 'mysql' | 'mariadb' | 'postgres' | 'mssql' 其一 */
//   timezone: '+08:00',
//   dialectOptions: {
//     dateStrings: true,
//     typeCast: true
// } 
// });


const sequelize = new Sequelize('shapdatabase', 'root', 'Glassbox0128@', {
  host: '127.0.0.1',
  dialect: 'mysql',/* 选择 'mysql' | 'mariadb' | 'postgres' | 'mssql' 其一 */
  timezone: '+08:00',
  dialectOptions: {
    dateStrings: true,
    typeCast: true
} 
});

const Record = sequelize.define('record', {
  record_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true
  },
  // 在这里定义模型属性
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  type: {
    type: DataTypes.STRING,
    allowNull: false
  },
  json_data: {
    type: DataTypes.STRING,
    allowNull: false
  },
  
}, {
  // 这是其他模型参数
});

// `sequelize.define` 会返回模型
console.log(Record === sequelize.models.Record);

async function saveResult(userid,type,resultdata)
{
  let recordresult=-1;
  const record = await Record.create({ record_id: 0,user_id:userid,type:type,json_data:JSON.stringify(resultdata)}).then(result => {
    recordresult=result
  });
  console.log(recordresult);
  return recordresult;
}

async function getResultList(userid,type)
{
  const records= await Record.findAll({
    where: {
      user_id: userid,
      type:type
    },
    attributes: [
      'record_id','user_id','type','createdAt','updatedAt'
    ],
    order: [
      ['createdAt', 'DESC'],
      
  ]
  });
  return records;
}
async function getDetailResult(userid,recordid)
{
  const records= await Record.findOne({
    where: {
      user_id: userid,
      record_id:recordid
    },
  });
  return records;
}

const Project = sequelize.define('project', {
  dashboardid: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true
  },
  userid: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  // 在这里定义模型属性
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  type: {
    type: DataTypes.STRING,
    allowNull: false
  },
  dataset: {
    type: DataTypes.STRING,
    allowNull: false
  },
  model: {
    type: DataTypes.STRING,
    allowNull: false
  },
  idcolid: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  labelcolid: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  recordid: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
}, {
  // 这是其他模型参数
});

async function getProjectList(userid,type)
{
  const projects= await Project.findAll({
    where: {
      userid: userid,
      // type:type
    },
    attributes: [
      'dashboardid','userid','name','type','createdAt','updatedAt'
    ],
    order: [
      ['createdAt', 'DESC'],
      
  ]
  });
  return projects;
}

async function saveProject(userid,name,type,dataset,model,idcolid,labelcolid,recordid)
{
  const project = await Project.create({ dashboardid: 0,userid:userid,name:name,type:type,dataset:dataset,model:model,idcolid:idcolid,labelcolid:labelcolid,recordid:recordid});
  console.log(recordid);
  return project;
}

async function getDetailProject(userid,dashboardid)
{
  const records= await Project.findOne({
    where: {
      dashboardid:dashboardid,
      userid: userid,
    },
  });
  return records;
}
module.exports = app;

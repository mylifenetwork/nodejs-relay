var express = require('express');
var router = express.Router();
const http = require('http');
var bodyParser = require('body-parser');
/* GET home page. */


const webSocketServer = require('websocket').server;
const ServerPort = 3001;

const app = express();
app.use(bodyParser.json({limit: '500mb'}));
app.use(bodyParser.urlencoded({limit: '500mb', extended: true}));
var jsonParser = bodyParser.json()


app.get('/', function(req, res, next) {
  res.send('启动成功1');
});

// 创建应用服务器
const server = http.createServer(app);

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

var map=new Map()
var tasklist=[]
var taskmap=new Map()
var resultmap=new Map()
app.post('/ajax/sendmodel',jsonParser,(request, response) => {
  // 设置响应头  设置允许跨域
  response.setHeader('Accss-Control-Allow-Origin', '*');
  //console.log(request.body)
  var model=request.body.model;
  var dataset=request.body.dataset;
  var id=request.body.id;
  var type=request.body.type;
  map.set(id,request.body)
  
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
  taskid++;
  taskmap.set(taskid,request.body)
  tasklist.push({taskid:taskid,userid:id})
  console.log(taskmap)
  // 设置响应体
  return response.send({status:"success",taskid:taskid});

});
app.post('/ajax/sendmodelcol',jsonParser,(request, response) => {
  // 设置响应头  设置允许跨域
  response.setHeader('Accss-Control-Allow-Origin', '*');
  console.log(request.body)
  var id=request.body.id;
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
  console.log(modeldata)
  //GPUws.send("id#"+id)
  // 设置响应体
  taskid++;
  taskmap.set(taskid,modeldata)

  tasklist.push({taskid:taskid,userid:id})
  console.log(taskmap)
  response.send({status:"success",taskid:taskid});
});
app.get('/ajax/checkresult',jsonParser,(request, response) => {
  // 设置响应头  设置允许跨域
  response.setHeader('Accss-Control-Allow-Origin', '*');
  //console.log(request.query)
  var params = request.query
  var userid=params.userid;
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
    else if(type=="nncol")
      resultdata=resultmap.get(taskid+"_nncol")
    //console.log(resultdata)
    if(resultdata!=null)
      response.json(resultdata)
    else if(resultdata==null&&modeldata!=null)
      response.json({status:"running"});
    else
      response.json({status:"empty"});
  

  }

});

app.get('/py/getdata',jsonParser,(request, response) => {
  // 设置响应头  设置允许跨域
  response.setHeader('Accss-Control-Allow-Origin', '*');
  console.log(request.query)
  var params = request.query
  userid=params.userid;
  taskid=parseInt(params.taskid);
  console.log(userid)
  var modeldata=taskmap.get(taskid)
  // 设置响应体
  console.log(modeldata)
  if(modeldata!=null)
    response.json(modeldata)
  else
    response.json({status:"failed"})

});

var taskid=0;
app.get('/py/polling',jsonParser,(request, response) => {
  // 设置响应头  设置允许跨域
  response.setHeader('Accss-Control-Allow-Origin', '*');
  console.log(request.query)
  var pytaskid = request.query.taskid;
  if(pytaskid<tasklist[tasklist.length-1]){
    for(var i=0;i<tasklist.length;i++)
    {
      var item = tasklist[i];
      if(item.taskid==taskid)
      {
        response.json({taskid: tasklist[i].taskid,userid: tasklist[i].userid})
      }
    }
    
  }
  else if(taskid>0&&pytaskid>0)
  {
    for(var i=0;i<tasklist.length;i++)
    {
      var item = tasklist[i];
      if(item.taskid==taskid)
      {
        response.json({taskid: tasklist[i].taskid,userid: tasklist[i].userid})
      }
    }
    
  }
  else
  {
    response.json({taskid:"0",userid:"0"})
  }
  

});
app.post('/py/returndata',jsonParser,(request, response) => {
  // 设置响应头  设置允许跨域
  response.setHeader('Accss-Control-Allow-Origin', '*');
  console.log(request.body)
  var params = request.body
  var userid=params.userid;
  var taskid=parseInt(params.taskid)
  console.log(userid)
  var modeldata=taskmap.get(taskid)
  modeldata.running=0;
  if(request.body.type=="nn")
  {
    resultmap.set(taskid+"_nn",request.body)
  }
  else if(request.body.type=="lgbm")
  {
    resultmap.set(taskid+"_lgbm",request.body)
  }
  else if(request.body.type=="lgbmcol")
  {
    resultmap.set(taskid+"_lgbmcol",request.body)
  }
  else if(request.body.type=="nncol")
  {
    resultmap.set(taskid+"_nncol",request.body)
  }

  
  response.json({status:"success"})

});


module.exports = router;

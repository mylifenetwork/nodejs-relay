let express = require('express');
let router = express.Router();
const http = require('http');
require('./data');

let bodyParser = require('body-parser');
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
app.use(bodyParser.json({limit: '500mb'}));
app.use(bodyParser.urlencoded({limit: '500mb', extended: true}));
var jsonParser = bodyParser.json()
let map=global.datastore.map;
let tasklist=global.datastore.tasklist;
let taskmap=global.datastore.taskmap;
let resultmap=global.datastore.resultmap;
let taskidpointer=global.datastore.taskidpointer;

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
  taskidpointer=taskidpointer+1;
  taskmap.set(taskidpointer,request.body)
  tasklist.push({taskid:taskidpointer,userid:id})
  console.log(taskmap)
  // 设置响应体
  return response.send({status:"success",taskid:taskidpointer});

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
  console.log(request.body)
  //GPUws.send("id#"+id)
  // 设置响应体
  taskidpointer=taskidpointer+1;
  taskmap.set(taskidpointer,modeldata)

  tasklist.push({taskid:taskid,userid:id})
  console.log(taskmap)
  response.send({status:"success",taskid:taskidpointer});
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


app.get('/py/polling',jsonParser,(request, response) => {
  // 设置响应头  设置允许跨域
  response.setHeader('Accss-Control-Allow-Origin', '*');
  console.log(request.query)
  var pytaskid = parseInt(request.query.taskid);
  console.log("taskid:"+taskidpointer+"  pytaskid:"+pytaskid)
  if((taskidpointer>0)&&(taskidpointer>pytaskid))
  {
    //console.log(tasklist)
    response.json({taskid:pytaskid+1,userid:taskmap.get(pytaskid+1)["id"]})
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


module.exports = app;

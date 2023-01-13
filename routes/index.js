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
  console.log(model)
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
 
  GPUws.send("id#"+id)
  // 设置响应体
  response.send("success");

});
app.post('/ajax/sendmodelcol',jsonParser,(request, response) => {
  // 设置响应头  设置允许跨域
  response.setHeader('Accss-Control-Allow-Origin', '*');
  console.log(request.body)
  var id=request.body.id;
  var type=request.body.type;
  var modeldata=map.get(id);
  modeldata.selectvalue=request.body.selectvalue;
  modeldata.colid=request.body.colid;
  modeldata.idcolid=request.body.idcolid;
  modeldata.labelcolid=request.body.labelcolid;
  modeldata.type=type;
  //console.log(dataset)
  resultmap.delete(id+"_lgbmcol")
  resultmap.delete(id+"_nncol")
  console.log(id)
  GPUws.send("id#"+id)
  // 设置响应体
  response.send("success");

});
app.get('/ajax/checkresult',jsonParser,(request, response) => {
  // 设置响应头  设置允许跨域
  response.setHeader('Accss-Control-Allow-Origin', '*');
  //console.log(request.query)
  var params = request.query
  var userid=params.userid;
  var type=params.type;
  console.log(userid+"_"+type)
  var modeldata=map.get(userid)
  if(modeldata==null)
  {
    response.json({status:"empty"})
  }
  else
  {
    var resultdata=null;
    if(type=="nn")
      resultdata=resultmap.get(userid+"_nn")
    else if(type=="lgbm")
      resultdata=resultmap.get(userid+"_lgbm")
    else if(type=="lgbmcol")
      resultdata=resultmap.get(userid+"_lgbmcol")
    else if(type=="nncol")
      resultdata=resultmap.get(userid+"_nncol")
    //console.log(resultdata)
    if(resultdata!=null)
      response.json(resultdata)
    else if(resultdata==null&&modeldata!=null&&modeldata.type==type)
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
  console.log(userid)
  var modeldata=map.get(userid)
  // 设置响应体
  console.log(modeldata)
  if(modeldata!=null)
    response.json(modeldata)
  else
    response.json({status:"failed"})

});
app.post('/py/returndata',jsonParser,(request, response) => {
  // 设置响应头  设置允许跨域
  response.setHeader('Accss-Control-Allow-Origin', '*');
  console.log(request.body)
  var params = request.body
  userid=params.userid;
  console.log(userid)
  var modeldata=map.get(userid)
  modeldata.running=0;
  if(request.body.type=="nn")
  {
    resultmap.set(userid+"_nn",request.body)
  }
  else if(request.body.type=="lgbm")
  {
    resultmap.set(userid+"_lgbm",request.body)
  }
  else if(request.body.type=="lgbmcol")
  {
    resultmap.set(userid+"_lgbmcol",request.body)
  }
  else if(request.body.type=="nncol")
  {
    resultmap.set(userid+"_nncol",request.body)
  }

  
  response.json({status:"success"})

});


module.exports = router;

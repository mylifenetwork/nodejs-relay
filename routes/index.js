let express = require('express');
let router = express.Router();
const { Sequelize, Model, DataTypes } = require('sequelize');


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
  var modeldata=taskmap.get(maintaskid);
  modeldata.jsondata=request.body.jsondata;
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
  var modeldata=taskmap.get(maintaskid);
  //modeldata.jsondata=request.body.jsondata;
  // modeldata.colid=request.body.colid;
  modeldata.idcolid=request.body.idcolid;
  modeldata.cidx=request.body.cidx;
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
  var modeldata=taskmap.get(maintaskid);
  modeldata.jsondata=request.body.jsondata;
  if(request.body.jsondata2!=undefined)
    modeldata.jsondata2=request.body.jsondata2;
  //modeldata.colid=request.body.colid;
  modeldata.cidx=request.body.cidx;
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
app.get('/ajax/checkresult',jsonParser,(request, response) => {
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
    //console.log(resultdata)
    if(resultdata!=null)
      response.json(resultdata)
    else if(resultdata==null&&modeldata!=null&&modeldata.running==1)
      response.json({status:"running"});
    else
      response.json({status:"empty"});
  

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

app.get('/py/getdata',jsonParser,(request, response) => {
  // 设置响应头  设置允许跨域
  response.setHeader('Accss-Control-Allow-Origin', '*');
  console.log(request.query)
  var params = request.query
  userid=params.userid;
  //var userid=req.session.user.id;
  var taskid=parseInt(params.taskid);
  console.log(userid)
  var modeldata=taskmap.get(taskid)
  // 设置响应体
  console.log(modeldata)
  if(modeldata!=null)
  {
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
    return response.json({taskid:taskidpointer,userid:"0"})
  }
  if((taskidpointer>0)&&(taskidpointer>pytaskid))
  {
    //console.log(tasklist)
    response.json({taskid:pytaskid+1,userid:taskmap.get(pytaskid+1)["id"]})
  }
  else
  {
    response.json({taskid:taskidpointer,userid:"0"})
  }
  

});
app.post('/py/returndata',jsonParser,(request, response) => {
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
  if(request.body.type=="nn")
  {
    resultmap.set(taskid+"_nn",request.body)
    if(request.body.error==undefined)
      saveResult(userid,request.body.type,request.body)
  }
  else if(request.body.type=="lgbm")
  {
    resultmap.set(taskid+"_lgbm",request.body)
    if(request.body.error==undefined)
      saveResult(userid,request.body.type,request.body)
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
  
  response.json({status:"success"})
  } catch (error) {
    console.log(error)
  }


});
// 123456
const sequelize = new Sequelize('shapdatabase', 'root', '123456', {
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
    primaryKey: true
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
  const record = await Record.create({ record_id: 0,user_id:userid,type:type,json_data:JSON.stringify(resultdata)  });
  console.log(record);
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
module.exports = app;

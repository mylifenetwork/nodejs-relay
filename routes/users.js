var express = require('express');
const app = express();
const { Sequelize, Model, DataTypes } = require('sequelize');
let bodyParser = require('body-parser');
const { token } = require('morgan');
var jsonParser = bodyParser.json()
var router = express.Router();
const sequelize = new Sequelize('shapdatabase', 'admin', 'Glassbox0128@', {
  host: '47.242.115.75',
  dialect: 'mysql',/* 选择 'mysql' | 'mariadb' | 'postgres' | 'mssql' 其一 */
  timezone: '+08:00',
  dialectOptions: {
    dateStrings: true,
    typeCast: true
} 
});

/* GET users listing. */
app.get('/', jsonParser, function (req, res, next) {
  res.send('users router');
});

const User = sequelize.define('user', {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true
  },
  // 在这里定义模型属性
  email: {
    type: DataTypes.STRING,
    allowNull: false
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  company_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  first_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  last_name: {
    type: DataTypes.STRING,
    allowNull: false
    // allowNull 默认为 true
  },
  subscribe: {
    type: DataTypes.DATE,
    allowNull: true
  },
  verified: {
    type: DataTypes.BOOLEAN,
    allowNull: false
  },
  login_token: {
    type: DataTypes.STRING,
    allowNull: true
  },
}, {
  // 这是其他模型参数
});

// `sequelize.define` 会返回模型
console.log(User === sequelize.models.user); // true

function newtoken()
{
    var guid = "";
    for (var i = 1; i <= 32; i++){
      var n = Math.floor(Math.random()*16.0).toString(16);
      guid +=   n;
      if((i==8)||(i==12)||(i==16)||(i==20))
        guid += "-";
    }
    return guid;    
}
app.post('/checktoken', jsonParser, async (req, res, next) => {
  var token = req.body.params.token;
  try {
    const user = await User.findOne({ where: { login_token: token } });
    if (user === null) {
      console.log('user Not found!');
      res.send("failed");
    } else {
      
        var token=newtoken();
        user.login_token=token;
        await user.save();
        req.session.user=user.toJSON()
        res.send({result:"success",token:token,firstname:user.first_name,lastname:user.last_name,email:user.email});
    }
  }
  catch (e) {
    console.log(e)
    res.send({result:"failed"});
  }
});
app.post('/login', jsonParser, async (req, res, next) => {
  var email = req.body.params.email;
  var password = req.body.params.password;
  try {
    const user = await User.findOne({ where: { email: email } });
    if (user === null) {
      console.log('user Not found!');
      res.send("failed");
    } else {
      if(user.password==password)
      {
        var token=newtoken();
        user.login_token=token;
        await user.save();
        req.session.user=user.toJSON()
        res.send({result:"success",token:token,firstname:user.first_name,lastname:user.last_name,email:user.email});
      }
      else
      {
        console.log('wrong password');
        res.send({result:"failed"});
      }
     
    }
  }
  catch (e) {
    console.log(e)
    res.send({result:"failed"});
  }
});
app.post('/logout', jsonParser, async (req, res, next) => {
  try {
        req.session.user=null;
        res.send({result:"success"});
  }
  catch (e) {
    console.log(e)
    res.send({result:"failed"});
  }
});
app.post('/register', jsonParser, async (req, res, next) => {
  console.log(req.body)
  var email = req.body.params.email;
  var password = req.body.params.password;
  var first_name = req.body.params.first_name;
  var last_name = req.body.params.last_name;
  var company_name = req.body.params.company_name;
  try {
    const olduser = await User.findOne({ where: { email: email } });
    if (olduser === null) {
      console.log('user Not found!');
      const acount = jane = await User.create({ id: 0, email: email, password: password, company_name: company_name, first_name: first_name, last_name: last_name, verified: 0 });
    console.log(acount.toJSON())
    res.send("success");
    } else {
      console.log("user has already exist!"); // true
      res.send("duplicated");
    }
    
  }
  catch (e) {
    console.log(e)
    res.send("failed");
  }

});
testdatabase()
async function testdatabase() {
  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
}


module.exports = app;

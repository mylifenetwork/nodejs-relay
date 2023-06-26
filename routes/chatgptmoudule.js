
let express = require('express');
let router = express.Router();
let bodyParser = require('body-parser');
var jsonParser = bodyParser.json()
const { Configuration, OpenAIApi } = require("openai");
const app = express();
const dotenv = require("dotenv")
dotenv.config()
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);
testopenai()
async function testopenai()
{
    try{
        const completion = await openai.createChatCompletion({
            model: "gpt-3.5-turbo",
            // prompt: "How are you today?",
            messages: [{"role": "user", "content": "How are you today?"}]
          });
          console.log("chatgpt answer:")
          console.log(completion.data.choices[0].message);
    }
    catch(error)
    {
        if (error.response) {
            console.log("chatgpt error")
            console.log(error.response.status);
            console.log(error.response.data);
          } else {
            console.log(error.message);
          }
    }
  
}



app.post('/ask',jsonParser,async(request, response) => {
    // 设置响应头  设置允许跨域
    response.setHeader('Accss-Control-Allow-Origin', '*');
    console.log(request.body.question)
    // var params = request.body
    var question=request.body.question;
    try{
        const completion = await openai.createChatCompletion({
            // model: "gpt-3.5-turbo",
            // prompt: question,
            model: "gpt-3.5-turbo",
            // prompt: "How are you today?",
            messages: [{"role": "user", "content": question}]
          });
          console.log("chatgpt answer:")
          console.log(completion.data);
          response.json({answer:completion.data.choices})
    }
    catch(error)
    {
        if (error.response) {
            console.log("chatgpt error")
            console.log(error.response.status);
            console.log(error.response.data);
          } else {
            console.log(error.message);
          }
        response.json({answer:error.response.data})
    }
    
  });
module.exports = app;
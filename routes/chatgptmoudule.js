
let express = require('express');
let router = express.Router();
let bodyParser = require('body-parser');
var jsonParser = bodyParser.json()
const { Configuration, OpenAIApi } = require("openai");
const app = express();
const configuration = new Configuration({
  apiKey: "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",
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



app.get('/ask',jsonParser,async(request, response) => {
    // 设置响应头  设置允许跨域
    response.setHeader('Accss-Control-Allow-Origin', '*');
    console.log(request.query)
    var params = request.query
    var question=params.question;
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
        response.json({error:error.response.status})
    }
    
  });
module.exports = app;
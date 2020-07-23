const express = require('express');
const bodyParser = require('body-parser');
const feedRoutes = require('./routes/feed');

const app = express();
app.use(bodyParser.json()); // json 데이터를 req.body에 담아준다. 

app.use((req,res,next)=>{ // 다른 서버 (frontend) 로부터의 접근을 허용해준다. 
    // 앞으로 우리가 보내는 모든 request는 아래의 header들을 갖고 있을 것. 
    res.setHeader('Access-Control-Allow-Origin', '*'); // 다른 서버로부터의 접근 허용
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE'); // 다른 서버가 어떤 method를 통해 접근할지 허용 
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

app.use('/feed',feedRoutes);


app.listen(8080);
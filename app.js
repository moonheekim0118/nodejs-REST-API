const path=require('path');
const express = require('express');
const bodyParser = require('body-parser');
const feedRoutes = require('./routes/feed');
const mongoose =require('mongoose');
const URL =require('./database');
const multer = require('multer');
const { uuid } = require('uuidv4');

const app = express();

const fileStorage =  multer.diskStorage({
    destination:(req,file,cb)=>{
        cb(null,'images');
    },
    filename: (req,file,cb)=>{
        cb(null,uuid());
    }
});

const fileFilter =(req,file,cb)=>{
    if(file.mimetype === 'image/png'|| file.mimetype==='image/jpg' || file.mimetype==='image/jpeg'){
        cb(null,true);
    }else{
        cb(null,false);
    }
}
app.use(bodyParser.json()); // json 데이터를 req.body에 담아준다. 
app.use(multer({storage:fileStorage, fileFilter:fileFilter}).single('image'));
app.use('/images', express.static(path.join(__dirname, 'images')));


app.use((req,res,next)=>{ // 다른 서버 (frontend) 로부터의 접근을 허용해준다. 
    // 앞으로 우리가 보내는 모든 request는 아래의 header들을 갖고 있을 것. 
    res.setHeader('Access-Control-Allow-Origin', '*'); // 다른 서버로부터의 접근 허용
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE'); // 다른 서버가 어떤 method를 통해 접근할지 허용 
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

app.use('/feed',feedRoutes);

app.use((error,req,res,next)=>{
    console.log(error);
    const status = error.statusCode || 500;
    const message = error.message;
    res.status(status).json({message:message}); // error핸들링. json데이터로 보내준다.
})


mongoose.connect(URL.dbUrl)
.then(result=>{
    app.listen(8080);
})
.catch(err=>console.log(err));
const User = require('../models/user');
const { validationResult }=require('express-validator/check');
const errorFuncs = require('./errorHandle');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.singUp  = async (req,res,next)=>{
    const errors =validationResult(req);
    if(!errors.isEmpty()){
        errorFuncs.throwError('Validation failed');
       }
    const email =req.body.email;
    const name =req.body.name;
    const password=req.body.password;
    try{
    const hashedPw = await bcrypt.hash(password, 12);
    const user = new User({
        email:email,
        name : name,
        password: hashedPw
    });
    const result = await user.save();
    res.status(201).json({userId: result._id});
    }catch(err){
        errorFuncs.errorHandling(err);
        next(err);
    }
}

exports.login=async(req,res,next)=>{
    const email = req.body.email;
    const password=req.body.password;
    let loadedUser;
    try{
    const user = await User.findOne({email:email});
    if(!user){
        errorFuncs.throwError('존재하지 않는 이메일');
    }
    loadedUser=user;
    const doMatch=await bcrypt.compare(password,user.password);
    if(!doMatch){
        errorFuncs.throwError('잘못된 비밀번호');
    }
    // JWT 
    const token  = jwt.sign({email: loadedUser.email, userId: loadedUser._id.toString()},
    'new!!!',{expiresIn: '1h'});
    res.status(200).json({token:token, userId:loadedUser._id.toString()});
    }catch(err){
        errorFuncs.errorHandling(err);
        next(err);
    }
}

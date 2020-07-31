const { validationResult }=require('express-validator/check');
const fs = require('fs');
const path = require('path');
const Post = require('../models/post');
const User = require('../models/user');
const errorFuncs = require('./errorHandle');
const io  = require('../socket');

exports.getPosts= async (req,res,next)=>{
    const currentPage = req.query.page || 1;
    const perPage = 2;
    try{
    const totalItems= await Post.find().countDocuments()
    const post = await Post.find()
    .populate('name')
    .skip((currentPage-1)*perPage)
    .limit(perPage);
    res.status(200).json({posts:post, totalItems: totalItems});
    }catch(err){
        errorFuncs.errorHandling(err);
         next(err);
    }
}

exports.createPost= async (req,res,next)=>{
    const errors =validationResult(req);
    const userId= req.userId;
    if(!errors.isEmpty()){
        errorFuncs.throwError('Validation failed');
       }
    if(!req.file){
        errorFuncs.throwError('no image provied');
    }
    const imageUrl = req.file.path.replace("\\" ,"/");
    const title = req.body.title;
    const content = req.body.content;
    const post = new Post({
        title: title,
        imageUrl:imageUrl,
        content:content,
        creator: userId
    });
   try{
    await post.save();
    const user = await User.findById(userId);
    user.posts.push(post);
    await user.save();
    io.getIO().emit('posts', { action: 'create', post: post});
    res.status(201).json({
        message:'post created successfully',
        post: post,
        creator:{_id: user._id, name:user.name }
    })
   }catch(err){
       errorFuncs.errorHandling(err);
       next(err);
   }
}
 
exports.getPost= async (req,res,next)=>{
    const postId= req.params.postId;
    try{
    const post = await Post.findById(postId);
    if(!post){
        errorFuncs.throwError('could not foind post.');
    }
    res.status(200).json({post:post});
    }catch(err){  
        errorFuncs.errorHandling(err);
        next(err);
    }

}

exports.deletePost=async (req,res,next)=>{
    const postId=req.params.postId;
    try{
    const post = await Post.findById(postId)
    if(!post){
        errorFuncs.throwError('there is no post');
    }
    if(post.creator.toString() !== req.userId){
         errorFuncs.throwError('not authorized');
    }
    clearimage(post.imageUrl);
    await Post.findByIdAndRemove(postId)
    const user = await User.findById(req.userId);
    user.posts.pull(postId);
    await user.save();
    res.status(200).json({message:'succeed'});
    }catch(err){
    errorFuncs.errorHandling(err);
    next(err);
    }
}

exports.updatePost= async (req,res,next)=>{
    const errors =validationResult(req);
    if(!errors.isEmpty()){
        errorFuncs.throwError('Validation failed');
    }
    const postId = req.params.postId;
    const title = req.body.title;
    const content= req.body.content;
    let imageUrl = req.body.image;
    if(req.file){ // 파일 존재하면  ==> 업로드된 이미지가 변경되었다면 
        imageUrl=req.file.path.replace("\\" ,"/");
    }
    if(!imageUrl){
        errorFuncs.throwError('no file picked');
    }
    try{
    const post = await Post.findById(postId);
    if(!post){
        errorFuncs.throwError("there is no post");
    }
    if(post.creator.toString() !== req.userId){
        errorFuncs.throwError('not authorized');
    }
    if(imageUrl!==post.imageUrl){
        clearimage(post.imageUrl);
    }
    post.title=title;
    post.content=content;
    post.imageUrl=imageUrl;
    const result= post.save();
    res.status(200).json({message:'updated', post:result});
}catch(err){
    errorFuncs.errorHandling(err);
    next(err);
}
}

exports.getStatus= async (req,res,next)=>{ // status 보여주기 
    try{
    const user = await User.findById(req.userId);
    if(!user){
        errorFuncs.throwError('no user found');
    }
    console.log(user.status);
    res.status(200).json({status:user.status});
    }catch(err){
        errorFuncs.errorHandling(err);
        next(err);
    }
}

exports.updateStatus= async (req,res,next)=>{
    const errors =validationResult(req);
    try{
    if(!errors.isEmpty()){
        errorFuncs.throwError('fail');
    }
    const newStatus= req.body.status;
    const user = await User.findById(req.userId)
    user.status=newStatus;
    await user.save();
    res.status(200).json({message:'succeed'}); 
    }catch(err){
        errorFuncs.errorHandling(err);
        next(err);
    }
    
}

const clearimage = filePath =>{
    filePath = path.join(__dirname, '..',filePath);
    fs.unlink(filePath, err=>console.log(err));
}
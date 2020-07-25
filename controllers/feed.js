const { validationResult }=require('express-validator/check');
const fs = require('fs');
const path = require('path');
const Post = require('../models/post');
const e = require('express');
const { clear } = require('console');
const { deleteOne } = require('../models/post');
const errorHandling = function(err){
    console.log(err);
    if(!err.statusCode){
        err.statusCode=500;
    }
    next(err);
}
const throwError= function(message){
    const error = new Error(message);
    error.statusCode=422;
    throw error;
}

exports.getPosts=(req,res,next)=>{
    Post.find()
    .then(posts=>{
        if(!posts){
           throwError('there is no posts');
        }
        res.status(200).json({posts:posts});
    })
    .catch(err=>errorHandling(err));
}

exports.createPost=(req,res,next)=>{
    const errors =validationResult(req);
    if(!errors.isEmpty()){
        throwError('Validation failed');
       }
    if(!req.file){
        throwError('no image provied');
    }
    const imageUrl = req.file.path.replace("\\" ,"/");
    const title = req.body.title;
    const content = req.body.content;
    const post = new Post({
        title: title,
        imageUrl:imageUrl,
        content:content,
        creator: {name:'Moonee'}
    });
    post.save().then(result=>{
        console.log(result);
        res.status(201).json({
            message:'post created successfully',
            post: result
        })
    }).catch(err=>{errorHandling(err)});
}

exports.getPost=(req,res,next)=>{
    const postId= req.params.postId;
    Post.findById(postId)
    .then(post=>{
        if(!post){
            throwError('there is no message');
        }
        res.status(200).json({post:post});
    })
    .catch(err=>{errorHandling(err)});
}

exports.deletePost=(req,res,next)=>{
    const postId=req.params.postId;
    Post.findById(postId)
    .then(post=>{
        if(!post){
            throwError('there is no post');
        }
        
       clearimage(post.imageUrl);
       return Post.findByIdAndRemove(postId)
    })
    .then(result=>{
        console.log(result);
        res.status(200).json({message:'succeed'});
    })
    .catch(err=>errorHandling(err));
}

exports.updatePost=(req,res,next)=>{
    const errors =validationResult(req);
    if(!errors.isEmpty()){
        throwError('Validation failed');
    }
    const postId = req.params.postId;
    const title = req.body.title;
    const content= req.body.content;
    let imageUrl = req.body.image;
    if(req.file){ // 파일 존재하면  ==> 업로드된 이미지가 변경되었다면 
        imageUrl=req.file.path.replace("\\" ,"/");
    }
    if(!imageUrl){
        throwError('no file picked');
    }
    Post.findById(postId).
    then(post=>{
        if(!post){
            throwError("there is no post");
        }
        if(imageUrl!==post.imageUrl){
            clearimage(post.imageUrl);
        }
        post.title=title;
        post.content=content;
        post.imageUrl=imageUrl;
        return post.save();
    })
    .then(result=>{
        res.status(200).json({message:'updated', post:result});
    })
    .catch(err=>errorHandling(err));
}


const clearimage = filePath =>{
    filePath = path.join(__dirname, '..',filePath);
    fs.unlink(filePath, err=>console.log(err));
}
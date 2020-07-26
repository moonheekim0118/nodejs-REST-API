const { validationResult }=require('express-validator/check');
const fs = require('fs');
const path = require('path');
const Post = require('../models/post');
const User = require('../models/user');
const errorFuncs = require('./errorHandle');

exports.getPosts=(req,res,next)=>{
    const currentPage = req.query.page || 1;
    const perPage = 2;
    let totalItems;
    Post.find().countDocuments()
    .then(count=>{
        totalItems=count;
        return Post.find()
        .skip((currentPage-1)*perPage)
        .limit(perPage)
    })
    .then(post=>{
        if(!post){
            errorFuncs.throwError('there is no posts');
         }
         res.status(200).json({posts:post, totalItems: totalItems});
    })
    .catch(err=> { 
        errorFuncs.errorHandling(err);
        next(err);
    });
}

exports.createPost=(req,res,next)=>{
    const errors =validationResult(req);
    const userId= req.userId;
    let savedUser;
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
    post.save().then(result=>{
        return User.findById(userId)
    })
    .then(user=>{
        savedUser=user;
        user.posts.push(post);
        return user.save();
    })
    .then(result=>{
        res.status(201).json({
            message:'post created successfully',
            post: post,
            creator:{_id: savedUser._id, name:savedUser.name }
        })
    })
    .catch(err=> { 
        errorFuncs.errorHandling(err);
        next(err);
    });
}

exports.getPost=(req,res,next)=>{
    const postId= req.params.postId;
    Post.findById(postId)
    .then(post=>{
        if(!post){
            errorFuncs.throwError('there is no message');
        }
        res.status(200).json({post:post});
    })
    .catch(err=> { 
        errorFuncs.errorHandling(err);
        next(err);
    });
}

exports.deletePost=(req,res,next)=>{
    const postId=req.params.postId;
    Post.findById(postId)
    .then(post=>{
        if(!post){
            errorFuncs.throwError('there is no post');
        }
        if(post.creator.toString() !== req.userId){
            errorFuncs.throwError('not authorized');
        }
        User.findById(req.userId)
       clearimage(post.imageUrl);
       return Post.findByIdAndRemove(postId)
    })
    .then(result=>{
        return User.findById(req.userId)
    })
    .then(user=>{
        user.posts.pull(postId);
        return user.save();
    })
    .then(result=>{
        res.status(200).json({message:'succeed'});
    })
    .catch(err=> { 
        errorFuncs.errorHandling(err);
        next(err);
    });
}

exports.updatePost=(req,res,next)=>{
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
    Post.findById(postId).
    then(post=>{
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
        return post.save();
    })
    .then(result=>{
        res.status(200).json({message:'updated', post:result});
    })
    .catch(err=> { 
        errorFuncs.errorHandling(err);
        next(err);
    });
}

exports.getStatus=(req,res,next)=>{ // status 보여주기 
    User.findById(req.userId)
    .then(user=>{
        if(!user){
            errorFuncs.throwError('no user found');
        }
        console.log(user.status);
        res.status(200).json({status:user.status});
    })
    .catch(err=> { 
        errorFuncs.errorHandling(err);
        next(err);
    });
}

exports.updateStatus=(req,res,next)=>{
    const errors =validationResult(req);
    if(!errors.isEmpty()){
        errorFuncs.throwError('fail');
    }
    const newStatus= req.body.status;
    User.findById(req.userId)
    .then(user=>{
        console.log(newStatus);
        user.status=newStatus;
        return user.save();
    })
    .then(result=>{
        res.status(200).json({message:'succeed'}); 
    })
    .catch(err=> { 
        errorFuncs.errorHandling(err);
        next(err);
    });
}

const clearimage = filePath =>{
    filePath = path.join(__dirname, '..',filePath);
    fs.unlink(filePath, err=>console.log(err));
}
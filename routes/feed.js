const express = require('express');

const feedController =require('../controllers/feed');

const router = express.Router();

const { body } = require('express-validator/check');

router.get('/posts', feedController.getPosts);

router.post('/post', [
    body('title').trim().isLength({min:5}),
    body('content').trim().isLength({min:5})
],feedController.createPost);

router.get('/post/:postId', feedController.getPost);

router.put('/post/:postId' ,[
    body('title').trim().isLength({min:5}),
    body('content').trim().isLength({min:5})
],feedController.updatePost); // 수정 

router.delete('/post/:postId',feedController.deletePost);

module.exports=router;
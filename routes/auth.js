const express=require('express');
const User = require('../models/user');
const router = express.Router();
const { body } = require('express-validator/check');
const authController = require('../controllers/auth');
router.put('/signup', [
    body('email').isEmail().withMessage('이메일을 입력해주세요')
    .custom((value, {req })=>{
        return User.findOne({email:value})
        .then(user=>{
            if(user){
                return Promise.reject('이미 존재하는 이메일 입니다.');
            }
        })
    })
    .normalizeEmail(),
    body('password').trim().isLength({min:5}),
    body('name').trim().not().isEmpty()
], authController.singUp); 

router.post('/login', authController.login);
module.exports=router;
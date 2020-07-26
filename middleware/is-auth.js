const jwt = require('jsonwebtoken');
const errorFuncs =require('../controllers/errorHandle');
module.exports= (req,res,next)=>{
    const authHeader = req.get('Authorization');
    if(!authHeader){
        errorFuncs.throwError('not authenticated');
    }
    const token = authHeader.split(' ')[1];
    let decodedToken;
    try{
        decodedToken = jwt.verify(token,'new!!!');
    } catch(err){
        err.statusCode =500;
        throw err;
    }
    if(!decodedToken){
        errorFuncs.throwError('not authenticated');
    }
    req.userId= decodedToken.userId;
    next();
}
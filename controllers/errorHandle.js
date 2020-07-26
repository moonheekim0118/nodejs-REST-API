exports.throwError=(message)=>{
    const error = new Error(message);
    error.statusCode=422;
    throw error;
}

exports.errorHandling=(err)=>{
    console.log(err);
    if(!err.statusCode){
        err.statusCode=500;
    }
}
exports.getPosts=(req,res,next)=>{
    res.status(200).json({posts: [{title: ' frist post', content:'this is the first post'}]});
}

exports.createPost=(req,res,next)=>{
    const title = req.body.title;
    const content = req.body.content;
    console.log(title);
    console.log(content);
    res.status(201).json({
        message:'post created successfully',
        post: {id: new Date().toISOString(), title:title, content:content}
    })
}
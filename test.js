

function sales(req, res, next){
    res.json({message:"I am sale"})
    next();
}
function manager(req, res, next){

    res.json({message:"I am manager"})
    
    
}

function user(req, res, next){
    res.json({message:"I am user"})
    next()
}

router.get('/payment', sales, manager(req,))
const admin_auth = (req, res, next) =>{
    if(!req.session.role){
        return res.redirect('/login');
    }
    if(req.session.role !== 1){
        return res.send('non authorisé');
    }
    next();
}

const ass_auth = (req, res, next) =>{
    if(!req.session.role){
        return res.redirect('/login');
    }
    if(req.session.role !== 2){
        return res.send('non authorisé');
    }
    next();
}

module.exports = { admin_auth, ass_auth };

module.exports = {
    ensureAuthenticated: function(req, res, next){
        const user = req.user;
        const token = req.cookies.jwt;
        if (token && user){
            //Everything fine
            next();
        }else{
            req.flash("error", "Please log in to view this resource");
            res.redirect("/users/login");
        }     
    }
}
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
    }, 
    personalAuth: function (req, res, next){
        if (req.cookies.auth == "Mats@Corona2020!"){
            next();
        }else{
            res.sendStatus(403)
        }
    },
    platformAuth: function (req, res, next){
        const project = req.project;
        const token = req.cookies.platform;
        if (token && project){
            //Everything fine
            next();
        }else{
            console.log("Error")
            res.redirect("/platform/login");
        }
    }
}
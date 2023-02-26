
const verifyJWT = (req, res, next)=>{
    const user = req.user;
    const token = req.cookies.jwt;
    if (token){
        if (user){
            //Everything fine
            console.log(user);
            next();
        }else{
            return res.render("login", {errors: ["Please log in again"]});
        }
    }else{
        return res.redirect("/users/login");
    }
}

module.exports = verifyJWT;
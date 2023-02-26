const jwt = require("jsonwebtoken");
const User = require("../models/user");
const refreshSecret = "7676fac37efe6722628b767e8cdf15708cd893b8dca1e51833af84c9065fdc246da9f0a89c538fc7bb756a1937fe0a69086207e20e5643d849d8189fd5bff5d7";



const userInfos = async (req, res, next)=>{
    const token = req.cookies.jwt;
    if (token){
        jwt.verify(token, 
            refreshSecret,
            (err, decoded) => {
                if (!err){
                    User.findOne({name: decoded.username})
                    .then(user =>{
                        req.user = user
                        next();
                    })     
            }else{
                next();
            }
        })
    }else{
        next();
    }

}

module.exports = userInfos;
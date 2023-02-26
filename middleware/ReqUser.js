require("dotenv").config();
const jwt = require("jsonwebtoken");
const User = require("../models/user");


const userInfos = async (req, res, next)=>{
    const token = req.cookies.jwt;
    if (token){
        jwt.verify(token, 
            process.env.REFRESH_TOKEN_SECRET,
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
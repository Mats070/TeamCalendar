const jwt = require("jsonwebtoken");
const Project = require("../models/project");
const refreshSecretPlatform = "7676fhjlöäfe6722628b767e8cdf15708cd893b8dca1e51833af84c9065fdc246da9f0a89c538fc7bb756a1937fe0a69086207e20e5643d849d8189fd5bff5d7";

const DetectProject = async (req, res, next)=>{
    const token = req.cookies.platform;
    if (token){
        jwt.verify(token,
            refreshSecretPlatform,
            (err, decoded)=>{
                if(!err){
                    Project.findOne({email: decoded.email})
                    .then(project=>{
                        req.project = project;
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

module.exports = DetectProject;
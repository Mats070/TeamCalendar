//Analyse Tools für die Website Builder Platform 
const jwt = require("jsonwebtoken");
const tokenSecret = "4443b969de6c343bf3e186ac34293c952226dc91305eeb8925d04hg90p2ead3225c2fb1679ad5ff7cdcc71465074afcb60d99c5f84dbbfcdd451270ff0f640ef";

async function CreateJWTWithUserInfos(cookie, request){
    let visited = 0;
    let routes = [];
    let lastVisit;
    let newVisit = false;

    //Wenn ein Cookie vorhanden ist diesen aufschlüsseln und die Informationen updaten
    if (cookie){
        //Cookie Informationen auslesen
        jwt.verify(cookie, tokenSecret, (err, decoded)=>{
            if (!err && decoded){
                console.log(decoded);
                //Visited übernehmen
                if (decoded.visited){
                    visited = decoded.visited;
                }
                if (decoded.routes){
                    routes = decoded.routes;
                }

                if (decoded.lastVisit){
                    lastVisit = decoded.lastVisit;
                }
            }
        })
        AddNewInfos();
    }else{
        AddNewInfos();
    }

    function AddNewInfos(){
        const VergleichsDate = new Date() - 60 *1000;
        if(lastVisit < VergleichsDate){
            //Besuch gilt als neuer Seitenbesucher
            newVisit = true;
            //Routes werden zurückgesetzt
        }
        if (!routes.includes(request.body.path)){
            routes.push(request.body.path);
        };
        if (!lastVisit || newVisit){
            lastVisit = Date.now();
            visited++;
        }
    }
    
    //Neuen Cookie erstellen
    const AuthInformations = {
        visited: visited,
        routes: routes,
        lastVisit: lastVisit
    }
    const authToken = jwt.sign(AuthInformations, tokenSecret, {expiresIn: "365d"});
    return authToken;
}

module.exports = {CreateJWTWithUserInfos};
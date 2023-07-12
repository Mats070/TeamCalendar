const express = require("express");
const router = express.Router();

const fs = require("fs");
const path = require("path");

router.post("/upload", (req, res)=>{
    const dirpath = path.join(process.cwd(), "Galerie")
    /*const direxist = fs.existsSync(dirpath);
    if(!direxist){
        fs.mkdirSync(dirpath);
    };*/

    const File = req.files.File;
    const type = File.name.split(".")
    const date = req.body.Date;

    //Name zurechtschneiden
    const datesplit = date.split("-");
    let filename = datesplit[0]+ "-"+ datesplit[1] + "&" + Date.now() + "."+ type[type.length - 1];
    const filepath = path.join(dirpath, filename);
    
    fs.appendFile(filepath, File.data, function(){
        res.sendStatus(200);
    });

});

router.get("/file/*?",(req, res)=>{
    const filepath = path.join(process.cwd(), "Galerie", req.params[0])
    res.sendFile(filepath)
})

router.get("/galerie", (req, res)=>{
    const dirpath = path.join(process.cwd(), "Galerie")
    /*const direxist = fs.existsSync(dirpath);
    if(!direxist){
        fs.mkdirSync(dirpath);
    };*/
    const dir = fs.readdirSync(dirpath);
    res.send(dir)
})

router.get("/random", (req, res)=>{
    const dirpath = path.join(process.cwd(), "Galerie")
    /*const direxist = fs.existsSync(dirpath);
    if(!direxist){
        fs.mkdirSync(dirpath);
    };*/

    const dir = fs.readdirSync(dirpath);
    const shuffledArray = shuffleArray(dir);

    res.send(shuffledArray)
})

router.get("/process", (req, res)=>{
    res.send(process.cwd())
});

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

module.exports = router;
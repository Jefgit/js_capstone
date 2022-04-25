const fs           = require('fs');
const express      = require("express");
const app          = express();
const upload       = require('express-fileupload');
const { render }   = require('ejs');

app.use(express.static(__dirname + "/assets"));

app.use(upload());

app.set('views', __dirname + '/views'); 

app.set('view engine', 'ejs');

var files = fs.readdirSync('./assets/images/backgrounds/');
let message = "";
let error = "";

for(let i = 0; i < files.length; i++){
    files[i] = files[i].replace("_bg.jpg", "");
}
console.log(files);

app.get('/', (req, res) =>{
    res.render('index', {files, message, error});
})

app.post('/', (req, res) => {
    
    if(req.files) {
        console.log(req.files);
        var file = req.files.file;
        var filename = file.name;
        console.log(filename);
        let format = filename.split("_");

        if( format[1] && format[1] == "bg.jpg"){      
            file.mv('./assets/images/backgrounds/'+filename, function(err){
                if (err){
                    error = err;
                    res.render('index', {files, message, error});
                }
                else{
                    message = "Successfully uploaded";
                    res.render('index', {files, message, error});
                }
            })
        }
        else{
            error = "Invalid filename or file format";
            res.render('index', {files, message, error});
        }
    }
    else{
        error = "No image file selected.";
        res.render('index', {files, message, error});
    }
})


app.listen(8000, function(){
    console.log("listening on 8000");  
});
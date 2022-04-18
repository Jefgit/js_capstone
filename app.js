const fs = require('fs');
const yaml = require('js-yaml');

const raw = fs.readFileSync('config.yaml');
const data = yaml.load(raw);

const express      = require("express");
const homeRoutes   = require('./routes/homeRoutes');
const session      = require("express-session");
const bodyParser   = require('body-parser');
const urlencodedParser = bodyParser.urlencoded({extended: false});
const app          = express();
const { check, validationResult} = require('express-validator');

app.use(session({
    secret:  data.session.secret,
    resave: data.session.resave,
    saveUninitialized: data.session.saveUninitialized,
    cookie: { maxAge: data.session.maxAge }
}));

app.use(express.static(__dirname + "/assets"));

app.use(bodyParser.urlencoded({extended: true}));

app.set('views', __dirname + '/views'); 

app.set('view engine', 'ejs');

app.use(homeRoutes);

app.listen(8000, function(){
    console.log("listening on 8000");  
});
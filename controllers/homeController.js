let Voize = class{
    home(req, res){
        res.render('home');
    }

    onCall(req, res){
        res.render('index');
    }

    upload(req, res){
        if(req.files){
            console.log(req.files);
        }
    }
}

module.exports = Voize;
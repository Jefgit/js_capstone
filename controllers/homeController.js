let Voize = class{
    home(req, res){
        res.render('home');
    }

    onCall(req, res){
        res.render('oncall');
    }
}

module.exports = Voize;
const express = require('express');
const Voize   = require('../controllers/homeController');
const router  = express.Router();
let obj       = new Voize();

router.get("/home", obj.home); //Route for home
router.get("/", obj.onCall); //Route for home
router.post("/", obj.upload);
module.exports = router;
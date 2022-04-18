const express = require('express');
const Voize   = require('../controllers/homeController');
const router  = express.Router();
let obj       = new Voize();

router.get("/", obj.home); //Route for home
router.get("/oncall", obj.onCall); //Route for home

module.exports = router;
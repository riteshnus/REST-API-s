var express = require('express');
var router = express.Router();
var path = require('path');

/* GET home page. */
router.get('/', function(req, res, next) {
    res.contentType('text/html');
    res.sendFile(path.join(__dirname+'/../views/home.html'));
});

router.use('/api', require('./api'));
module.exports = router;

/**
 * @Author Ritesh
 * @Date 6/16/2018
 * @Description
 */

var express = require('express'),
    router = express.Router(),
    path = require('path');

/* GET home page. */
router.get('/', function(req, res, next) {
    res.contentType('text/html');
    res.sendFile(path.join(__dirname+'/../views/home.html'));
});

router.use('/api', require('./api'));
module.exports = router;

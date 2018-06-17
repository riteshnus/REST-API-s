/**
 * @Author Ritesh
 * @Date 6/16/2018
 * @Description: Main routing file
 */

var express = require('express'),
    router = express.Router(),
    path = require('path');

/**
 * Get Home Page.
 */
router.get('/', function(req, res, next) {
    res.contentType('text/html');
    res.sendFile(path.join(__dirname+'/../views/home.html'));
});

/**
 * Route to api's.
 */
router.use('/api', require('./api'));
module.exports = router;

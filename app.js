/**
 * @Author Ritesh
 * @Date 6/16/2018
 * @Description: Startup file
 */

var express = require('express');
var path = require('path');
var logger = require('morgan');
var indexRouter = require('./routes/index');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/', indexRouter);
app.use('/docs', express.static(path.join(__dirname, '/api/swagger/')));

app.use(function(err, req, res, next) {
    console.error(err.message);
    if (!err.statusCode) err.statusCode = 500;
    res.status(err.statusCode).send({message: err.message});
});

module.exports = app;

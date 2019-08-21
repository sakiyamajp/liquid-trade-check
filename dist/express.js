'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

exports.default = function () {
	var app = express();
	app.set('views', path.join(__dirname, '../views'));
	app.set('view engine', 'pug');

	app.use(express.json());
	app.use(express.urlencoded({ extended: false }));
	app.use(express.static(path.join(__dirname, 'public')));

	var indexRouter = express.Router();
	indexRouter.get('/', function (req, res, next) {
		res.render('index', {});
	});

	app.use('/', indexRouter);

	app.use(function (req, res, next) {
		next(createError(404));
	});

	app.use(function (err, req, res, next) {
		res.locals.message = err.message;
		res.locals.error = req.app.get('env') === 'development' ? err : {};
		res.status(err.status || 500);
		res.render('error');
	});
	return require('http').createServer(app);
};

var createError = require('http-errors');
var express = require('express');
var path = require('path');

;
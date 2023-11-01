var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const sequelize = require('./models').sequelize;

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var booksRouter = require('./routes/books');
var searchRouter = require('./routes/search');


var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(express.static('public'))

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/books', booksRouter);
app.use('/search', searchRouter);

// error 404 handler
app.use(function(req, res, next) {
  const error = new Error();
  error.status = 404;
  error.message = "Sorry! We couldn't find the page you were looking for."
  console.log(error.status, error.message)
  res.render('page-not-found', { error })
});

// global error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  err.status = err.status || 500;
  err.message = err.message || "Sorry! There was an unexpected error on the server."
  console.log(err.status, err.message)
  res.render('error', { err })
});

module.exports = app;

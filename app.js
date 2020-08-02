const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const logger = require('morgan');
const helmet = require('helmet');

const indexRouter = require('./routes/index');
const alertRouter = require('./routes/alert');

const jsonResponse = require('./middlewares/jsonResponse');

const app = express();

// 设置密钥
app.set('jwtTokenSecret', process.env.JWT_SECRET || '666');
app.set('jwtAdminTokenSecret', process.env.JWT_ADMIN_SECRET || '333');
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(helmet());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public'), {
  setHeaders(res) {
    res.set('Access-Control-Allow-Origin', '*');
  },
}));

app.use('/api/v1/', indexRouter);
app.use('/api/v1/', alertRouter);

// json response
app.use('/api/*.json', jsonResponse);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;

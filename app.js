var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var helpers=require('handlebars-helpers')
var indexRouter = require('./routes/index');
var adminRouter = require('./routes/admin');

var hbs = require('express-handlebars');
const HBS = hbs.create({});
const paypal = require('paypal-rest-sdk');

var fileUpload = require('express-fileupload')

 

var app = express();
var db = require('./config/conection')
var session=require('express-session')

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.engine('hbs',hbs.engine({helpers:{
  inc:function(value,options){
    return parseInt(value)+1
  }
},extname:'hbs',deafaultLayout:'layout',layoutsDir:__dirname+'/views/layout/',partialsDir:__dirname+'/views/partials/'}))

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(fileUpload())
app.use((req,res,next)=>{
  if(!req.user){
    res.header('cache-control','private,no-cache,no-store,must ravalidate')
    res.header('Express','-3')
  }
  next();
})
app.use(session({secret:"key"}))
db.connect((err)=>{
  if(err) console.log("error");
  else console.log("Database connected to 27017");
})

HBS.handlebars.registerHelper("ifCound",function(v1,v2,options){
  if(v1==v2){
    return options.fn(this)
  }
  return options.inverse(this) 
})
app.use('/', indexRouter);
app.use('/admin', adminRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  res.render('user/error')
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;

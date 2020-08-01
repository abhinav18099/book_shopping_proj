const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cookieParser = require("cookie-parser");
const session = require("express-session");
const credentials = require("./secrets/credentials");
const path = require('path');
const handlebars = require('express-handlebars').create({
    defaultLayout:'main',
});

// database connection manager
mongoose.Promise = global.Promise;
mongoose.connect("mongodb://localhost/customer");

// app building
const app = express();

//static files setup
app.use(express.static(__dirname + '/public'));


// view engine setup
app.engine('handlebars',handlebars.engine);
app.set('view engine','handlebars');


const TWO_HOURS = 1000 * 60 * 660 * 2;

const {
    SESS_LIFE = TWO_HOURS,
    NODE_ENV = "development",
} = process.env

const IN_PROD = NODE_ENV === 'production';
// Middlewares
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({
    extended:true
}));
app.use(bodyParser.json());
app.use(cookieParser(credentials.cookieSecret));
app.use(session({
    resave:false,
    saveUninitialized:false,
    secret:credentials.cookieSecret,
    cookie:{
        maxAge : SESS_LIFE,
        sameSite: true,
        secure: IN_PROD,
    }
}));


//Routes

app.use('/users',require('./routes/users'));

//404 error handler
app.use(function(req, res, next){
	res.status(404);
	res.render('404');
});

// 500 error handler (middleware)
app.use(function(err, req, res, next){
	console.error(err.stack);
	res.status(500);
	res.render('500');
});

//Start the server

const port = process.env.PORT || 3000;

app.listen(port);
console.log("server started on port ${port} press Ctrl+C to stop the process. ");
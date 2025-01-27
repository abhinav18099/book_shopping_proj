const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cookieParser = require("cookie-parser");
const session = require("express-session");
const credentials = require("./secrets/credentials");
const path = require('path');
const flash = require('express-flash');
const handlebars = require('express-handlebars').create({
    defaultLayout:'main',
});
const bookModel = require('./table_model/customers').bookModel;
// database connection manager
mongoose.Promise = global.Promise;
mongoose.connect("mongodb://localhost/customer",{useCreateIndex: true,useUnifiedTopology: true,useNewUrlParser: true});

// app building
const app = express();

//static files setup
app.use(express.static( __dirname +'/public'));


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
        sameSite: false,
        secure: IN_PROD,
    }
}));

app.use(flash());



app.use(function(req,res,next){
    res.locals.session = req.session;
    next();
});

app.use(function(req, res, next){
    // if there's a flash message in the session request, make it available in the response, then delete it
    res.locals.sessionFlash = req.session.sessionFlash;
    delete req.session.sessionFlash;
    next();
});

function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

app.get('/',async function(req,res){
        if(req.query.search){
            const regex = new RegExp('\\b'+escapeRegex(req.query.search), 'gi');
            bookModel.find({"name" : regex},function(err,result){
                if(err){
                    console.log(err);
                }else{
                    console.log(regex);
                    res.render('entry',{result});
                }
            }).lean();
        }else{
            bookModel.find({},function(err,result){
                if(err){
                    console.log(err);
                }else{
                    res.render('entry',{result});
                }
            }).lean();
        }
});

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
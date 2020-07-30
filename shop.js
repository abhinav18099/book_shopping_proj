const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cookieParser = require("cookie-parser");
const session = require("express-session");
const credentials = require("./secrets/credentials");

mongoose.Promise = global.Promise;
mongoose.connect("mongodb://localhost/customer");

const app = express();

const TWO_HOURS = 1000 * 60 * 660 * 2;

const {
    SESS_LIFE = TWO_HOURS,
    NODE_ENV = "development",
} = process.env

const IN_PROD = NODE_ENV === 'production';
// Middlewares
app.use(morgan('dev'));
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


const redirectUser = (req,res,next) => {
    if(!req.session.email) {
        res.redirect('/users/signin')
    }else{
        next();
    }
}

//Routes
app.use('/users',require('./routes/users'));




//Start the server

const port = process.env.PORT || 3000;

app.listen(port);
console.log("server started on port ${port} press Ctrl+C to stop the process. ");
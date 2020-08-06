// tables required
const customerModel = require('../table_model/customers').customerModel;
const personModel = require('../table_model/customers').personModel;
const bookModel = require('../table_model/customers').bookModel;
const paymentModel = require('../table_model/customers').paymentModel;

// secret data which are used like database user and password cookie secret are placed in credentials
const credentials = require("../secrets/credentials");

// views layouts 
const handlebars = require('express-handlebars');

//cart model 
const Cart = require('../table_model/cart');

//check out with paypal
const paypal = require('paypal-rest-sdk');

//url for query and path management
const url = require('url');

// configuration for live and test payments
paypal.configure({
    'mode': 'sandbox', //sandbox or live
    'client_id': credentials.payment.clientID,
    'client_secret': credentials.payment.clientSecret,
});

// search field regular expression
function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

// methods for routes

module.exports = {
    
    //post route for register 

    signUp: async (req,res,next) => {
        const username = req.value.body.username;
        const email = req.value.body.email;
        const password = req.value.body.password;

        // check if user already exist 
        const check = await customerModel.findOne({email : email});

        if(check) { 
            return res.status(403).json("error : email is already exists.");
        }
        //create a user 
        const newcustomer = new customerModel({
            username : username,
            email : email,
            password : password,
        });
        await newcustomer.save();

        const newperson = new personModel({
            username : username,
            email : email,
        });
        await newperson.save();

        req.session.email  = newcustomer.email;
        res.redirect('/users/home');
    },

    // post for login

    signIn: async (req,res,next) => {
        const email = req.value.body.email;
        const password = req.value.body.password;

        const check = await customerModel.findOne({email:email,password:password});

        if(check){
            req.session.email = check.email;
            return res.redirect('/users/home');
        }
        res.status(403).json("error : email or password is wrong.");
    },

    // after login and register we will redirect to home  

    home: async(req,res) => {
        const email = req.session.email;
        if(req.query.search){
            const regex = new RegExp('\\b'+escapeRegex(req.query.search), 'gi');
            bookModel.find({"name" : regex},function(err,result){
                if(err){
                    console.log(err);
                }else{
                    console.log({result,email});
                    res.render('home',{result,email});
                }
            }).lean();
        }else{
            bookModel.find({},function(err,result){
                if(err){
                    console.log(err);
                }else{
                    res.render('home',{result,email});
                }
            }).lean();
        }
    },

    // '/' get route handler
    root: async(req,res) => {
        const email = req.session.email;
        res.render('root',{email});
    },

    // get routes for login and register
    login: async(req,res) => {
        res.render('login',{layout:'sign_in_up'});
    },

    register: async(req,res) => {
        res.render('register',{layout:'sign_in_up'});
    },

    // post for logout 
    logout: async(req,res) => {
        req.session.destroy(err =>{
            if(err){
                res.redirect('users/home');
            }
            res.clearCookie();
            res.redirect('/users/signin');
        });
    },

    //route for showing desc with id
    Info: async(req,res) => {
        const id = req.params.id;
        bookModel.find({"_id" : id},function(err,result){
            if(err){
                console.log(err);
            }else{
                var context = {name : result[0].name,
                                author : result[0].author,
                                actualPrice : result[0].actualPrice,
                                SellingPrice : result[0].SellingPrice,
                                bookDesc : result[0].bookDesc,
                                _id : result[0]._id};
                res.render('info',context);
            }
        }).lean();
    },

    //routes addition for selling products
    sellGet: async(req,res) => {
        var context = {email : req.session.email};
        res.render('sell',context);
    },

    sellPost: async(req,res) => {
        const email = req.session.email;
        if(email == req.value.body.email)
        {
            const newbook = new bookModel(req.value.body);
            await newbook.save();
            res.redirect('/users/home');
        }else{
            res.redirect('/users/login');
        }
    },


};
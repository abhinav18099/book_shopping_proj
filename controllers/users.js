const customerModel = require('../table_model/customers').customerModel;
const personModel = require('../table_model/customers').personModel;
const credentials = require("../secrets/credentials");
const handlebars = require('express-handlebars');

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
        console.log(req.value.body);
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
        const check = await customerModel.findOne({email : email});
        const context = {username : check.username,
                         email : check.email};
        res.render('home',context);
    },

    // '/' get route handler
    root: async(req,res) => {
        const email = req.session.email;
        res.render('root',{email});
    },

    // all profile routes will go here update , profile get and profile post 
    profileGet: async(req,res) => {
        const email = req.session.email;
        const result = await personModel.findOne({email:email});
        if(result)
        {
            const context = {email : result.email,address : result.address,username : result.username, zipcode : result.zipcode, phone : result.phone, book_sell: result.book_sell,book_buy : result.book_buy};
            return res.render('profile',context);  
        }
        res.redirect('/users/login');
    },

    profile: async(req,res) => {

        const username = req.value.body.username;
        const address = req.value.body.address;
        const zipcode = req.value.body.zipcode;
        const phone = req.value.body.phone;

        const email = req.session.email;
        const check = await personModel.findOne({email:email});
        if(check)
        {
            await personModel.update({}, {$set: {address : address,username : username, zipcode : zipcode, phone : phone}}, {upsert: true}, function(err){
                if(err){
                    return res.send("500 : database error");
                }
            });
            console.log("record has been updated");
        }
        res.redirect('/users/profile');
    },

    update: async(req,res) => {
        res.render('update');
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
};
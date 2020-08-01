const customerModel = require('../table_model/customers');
const credentials = require("../secrets/credentials");
const handlebars = require('express-handlebars');

module.exports = {
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
        req.session.email  = newcustomer.email;
        res.redirect('/users/home');
    },

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

    home: async(req,res) => {
        const email = req.session.email;
        const check = await customerModel.findOne({email : email});
        const context = {username : check.username,
                         email : check.email};
        res.render('home',context);
    },

    root: async(req,res) => {
        const email = req.session.email;
        res.render('root',{email});
    },

    profile: async(req,res) => {
        console.log("secret data accessed only by authenticated user ");
    },

    login: async(req,res) => {
        res.render('login',{layout:'sign_in_up'});
    },

    register: async(req,res) => {
        res.render('register',{layout:'sign_in_up'});
    },

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
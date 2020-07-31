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
        res.json(req.sessionID);
    },

    signIn: async (req,res,next) => {
        console.log(req.value.body);
        const email = req.value.body.email;
        const password = req.value.body.password;

        const check = await customerModel.findOne({email:email,password:password});

        if(check){
            req.session.email = check.email;
            return res.json(req.sessionID);
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
        res.render('root');
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
};
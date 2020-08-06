// tables required
const customerModel = require('../table_model/customers').customerModel;
const personModel = require('../table_model/customers').personModel;
const bookModel = require('../table_model/customers').bookModel;
const paymentModel = require('../table_model/customers').paymentModel;

// secret data which are used like database user and password cookie secret are placed in credentials
const credentials = require("../secrets/credentials");

// views layouts 
const handlebars = require('express-handlebars');


//url for query and path management
const url = require('url');


module.exports = {
        // all profile routes will go here update , profile get and profile post 
        profileGet: async(req,res) => {
            const email = req.session.email;
            const result = await personModel.findOne({email:email});
            //const newResult = await paymentModel.find({payer_email : email});
            // sell books and buy books are hard codded
            if(result)
            {
                const context = {email : result.email,address : result.address,username : result.username, zipcode : result.zipcode, phone : result.phone, book_sell: result.book_sell,book_buy : result.book_buy};
                return res.render('profile',context);  
            }
            res.redirect('/users/login');
        },
    
    
        // profile post for edit - profile link
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
    
        // get route for form of 
        update: async(req,res) => {
            const context = {email : req.session.email};
            res.render('update',context);
        },
};
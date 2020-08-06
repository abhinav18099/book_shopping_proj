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

    //cart addition and checkout routes
    addToCart: async(req,res) => {
        var bookId = req.params.id;
        var cart = new Cart(req.session.cart ? req.session.cart : {});

        bookModel.findOne({"_id" : bookId}, function(err,book){
            if(err){
                res.redirect('/users/home');
            }
            cart.add(book, book.id);
            req.session.cart = cart;
            res.redirect('/users/home');
        });
    },

    ShopCart: async(req,res) => {
        const message = req.query.message;
        const type = req.query.type;
        var arr = [];
        if(message && type)
            arr.push({message : message,type : type});
        if(!req.session.cart){
            return res.render('shopping-cart',{books : null,expressFlash : arr});
        }
        var cart = new Cart(req.session.cart);
        res.render('shopping-cart',{books : cart.generateArray(),totalQty : cart.totalQty,totalPrice : cart.totalPrice,expressFlash : arr});
    },

    removeProduct : async(req,res,next) => {
        var Id = req.params.id;
        var cart = new Cart(req.session.cart ? req.session.cart : {});
        
        cart.removeItem(Id);
        req.session.cart = cart;
        res.redirect('/users/shopping-cart');
    },

    reduceProduct : async(req,res,next) => {
        var Id = req.params.id;
        var cart = new Cart(req.session.cart ? req.session.cart : {});
        
        cart.reduceItem(Id);
        req.session.cart = cart;
        res.redirect('/users/shopping-cart');
    },



    pay : async(req,res,next) => {
        var cart = new Cart(req.session.cart);
        var arr = new Array();
        for(var id in cart.items){
            var obj = { "name" : cart.items[id].item.name,
                "description" : cart.items[id].item._id,
                "price" : cart.items[id].item.SellingPrice.toString(),
                "currency" : 'INR',
                "quantity" : cart.items[id].qty}
            arr.push(obj);     
        }
        console.log(obj);
        var create_payment_json = {
            "intent": "sale",
            "payer": {
                "payment_method": "paypal"
            },
            "redirect_urls": {
                "return_url": "http://localhost:3000/users/success",
                "cancel_url": "http://localhost:3000/users/cancel"
            },
            "transactions": [{
                "item_list": {
                    "items": arr/*[{
                        "name": "concepts of physics",
                        "sku": "001",
                        "price": "250",
                        "currency": "INR",
                        "quantity": 1
                    }]*/
                },
                "amount": {
                    "currency": "INR",
                    "total": cart.totalPrice.toString(),
                },
                "description": "HCV book buy portal"
            }]
        };
    
        paypal.payment.create(create_payment_json, function (error, payment) {
            if (error) {
                console.log(error.response.details);
                throw error;
            } else {
               for(let i=0;i <payment.links.length;i++)
               {
                   if(payment.links[i].rel === "approval_url")
                        res.redirect(payment.links[i].href);
               }
            }
        });
    },

    success: async(req,res,next) => {
        var paymentId = req.query.paymentId;
        var payerId = { payer_id: req.query.PayerID };
        
        paypal.payment.execute(paymentId, payerId, async function(error, payment){
            if(error){
                console.error(JSON.stringify(error));
                return res.redirect(url.format({
                    pathname:'/users/shopping-cart',
                    query:{
                        type : 'error',
                        message : error.message,
                    }
                }));
            } else {
                if (payment.state == 'approved'){
                    var newArr = [];
                    for(var id in req.session.cart.items)
                    {
                        newArr.push(req.session.cart.items[id].item.email);
                    }
                    /*for(let i = 0 ; i <payment.transactions.length;i++){
                       console.log(req.session.email);
                       console.log(req.session.cart);
                       console.log(payment.transactions[0].item_list.shipping_address);
                       console.log(payment.payer.payer_info.first_name);
                       console.log(payment.payer.payer_info.last_name);
                       console.log(payment.id);}*/
                    const newPayment = new paymentModel({
                        payer_email : req.session.email,
                        cart : req.session.cart,
                        address : payment.transactions[0].item_list.shipping_address,
                        name : payment.payer.payer_info.first_name +" "+ payment.payer.payer_info.last_name,
                        payment_id : payment.id,
                        seller_email : newArr,
                    });
                    await newPayment.save();
                    req.session.cart = null;
                    return res.redirect(url.format({
                        pathname:'/users/shopping-cart',
                        query:{
                            type : 'success',
                            message : 'Successfully bought product !',
                        }
                    }));
                } else {
                    console.log('payment not successful');
                    res.redirect(url.format({
                        pathname:'/users/shopping-cart',
                        query:{
                            type : 'error',
                            message : 'payment not successful',
                        }
                    }));
                }
            }
            });
    },
};
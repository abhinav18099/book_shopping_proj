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

module.exports = {
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
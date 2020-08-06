const express = require('express');
const router = require('express-promise-router')();
const { validatebody, schemas} = require('../validation/backend_val');


const UsersController = require("../controllers/users");

const ProfileController = require("../controllers/profile");

const CartController = require("../controllers/cart");


const redirectUser = (req,res,next) => {
    if(!req.session.email) {
        res.redirect("/users/signin");
    }else{
        next();
    }
}

const redirectBase = (req,res,next) => {
    if(req.session.email) {
        res.redirect('/users/home');
    }else{
        next();
    }
}

router.route('/')
    .get(UsersController.root);

router.route('/signup')
    .get(redirectBase,UsersController.register);

router.route('/signin')
    .get(redirectBase,UsersController.login);

router.route('/signup')
    .post(redirectBase,validatebody(schemas.signUpSchema),redirectBase,UsersController.signUp);

router.route('/signin')
    .post(redirectBase,validatebody(schemas.signInSchema),redirectBase,UsersController.signIn);

router.route('/home')
    .get(redirectUser,UsersController.home);

router.route('/update')
    .get(redirectUser,ProfileController.update);

router.route('/more-info/:id')
    .get(UsersController.Info);

router.route('/profile')
    .post(redirectUser,validatebody(schemas.PersonSchema),ProfileController.profile);

router.route('/profile')
    .get(redirectUser,ProfileController.profileGet);

router.route('/logout')
    .post(redirectUser,UsersController.logout);

//adding routes for product selling
router.route('/sell')
    .get(redirectUser,UsersController.sellGet);


router.route('/sell')
    .post(redirectUser,validatebody(schemas.BookSchema),UsersController.sellPost);


    // cart routes
router.route('/add-to-cart/:id')
    .get(redirectUser,CartController.addToCart)

router.route('/shopping-cart')
    .get(redirectUser,CartController.ShopCart)

router.route('/pay')
    .post(redirectUser,CartController.pay);

router.route('/success')
    .get(redirectUser,CartController.success);
    
router.route('/remove/:id')
    .get(redirectUser,CartController.removeProduct);

router.route('/reduce/:id')
    .get(redirectUser,CartController.reduceProduct);

module.exports = router;
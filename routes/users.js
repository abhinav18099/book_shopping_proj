const express = require('express');
const router = require('express-promise-router')();
const { validatebody, schemas} = require('../validation/backend_val');


const UsersController = require("../controllers/users");

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
    .get(redirectUser,UsersController.update);

router.route('/profile')
    .post(redirectUser,validatebody(schemas.PersonSchema),UsersController.profile);

router.route('/profile')
    .get(redirectUser,UsersController.profileGet);

router.route('/logout')
    .post(redirectUser,UsersController.logout);

module.exports = router;
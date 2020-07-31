const express = require('express');
const router = require('express-promise-router')();
const { validatebody, schemas} = require('../validation/backend_val');


const UsersController = require("../controllers/users");

const redirectUser = (req,res,next) => {
    if(!req.session.email) {
        res.json("unauthorized");
    }else{
        next();
    }
}

const redirectBase = (req,res,next) => {
    if(req.session.email) {
        res.json("authorized");
    }else{
        next();
    }
}

router.route('/signup')
    .get(UsersController.register);

router.route('/signin')
    .get(UsersController.login);

router.route('/signup')
    .post(validatebody(schemas.signUpSchema),redirectBase,UsersController.signUp);

router.route('/signin')
    .post(validatebody(schemas.signInSchema),redirectBase,UsersController.signIn);

router.route('/home')
    .get(redirectUser,UsersController.home);

router.route('/profile')
    .get(redirectUser,UsersController.profile);

router.route('/')
    .get(UsersController.root);

module.exports = router;
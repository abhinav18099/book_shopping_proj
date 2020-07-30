const express = require('express');
const router = require('express-promise-router')();
const { validatebody, schemas} = require('../validation/backend_val');


const UsersController = require("../controllers/users");

router.route('/signup')
    .post(validatebody(schemas.signUpSchema),UsersController.signUp);

router.route('/signin')
    .post(UsersController.signIn);

router.route('/home')
    .get(UsersController.home);

router.route('/profile')
    .get(UsersController.profile);

router.route('/')
    .get(UsersController.root);

module.exports = router;
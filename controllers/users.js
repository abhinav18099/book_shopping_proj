const customerModel = require('../table_model/customers');
const credentials = require("../secrets/credentials");

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
        console.log("sign in using usercontrollers");
        
    },

    home: async(req,res) => {
        console.log("secret data accessed only by authenticated user ");
        res.send('<ul><li>Username:</li><li>Email:</li></ul>')
    },

    root: async(req,res) => {
        console.log("secret data accessed only by authenticated user ");
        console.log(email);

    },

    profile: async(req,res) => {
        console.log("secret data accessed only by authenticated user ");
    }
};
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// create customer schema here 

const customerSchema = new Schema({
    username : {
        type: String,
        required: true
    },
    email : {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
    },
    password : {
        type: String,
        required: true
    }
});


personSchema = new Schema({
    username:{
        type:String,
        unique:true,
    },
    email:{
        type:String,
    },
    phone:{
        type:Number,
    },
    address:{
        type:[String],
    },
    zipcode: {
        type: String,
    },
    book_sell:{
        type : [String]
    },
    book_buy:{
        type : [String]
    },
});


// customer model here
const customerModel = mongoose.model('customer',customerSchema);
const personModel = new mongoose.model('person',personSchema);

// exporting the model

module.exports  = {customerModel , personModel};


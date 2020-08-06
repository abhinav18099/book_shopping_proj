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

bookSchema = new Schema({
    name:{
        type:String,
        required : true,
    },
    author:{
        type:String,
        required : true,
    },
    actualPrice:{
        type:Number,
    },
    SellingPrice:{
        type:Number,
        required : true,
    },
    ISBN:{
        type: String,
        required : true,
    },
    email:{
        type:String,
        required : true,
    },
    bookDesc:{
        type:String,
        required : true,
    }
});

paymentSchema = new Schema({
    payer_email : {
        type : String,
        required : true,
    },
    cart : {
        type : Object,
        required : true,
    },
    address : {
        type : Object,
        required : true,
    },
    name : { type : String, required : true},
    payment_id : {
        type : String,
        required : true,
    },
    seller_email : {
        type : Array,
        required : true,
    }
});




function getPrice(num){
    return (num/100).toFixed(2);
}

function setPrice(num){
    return num*100;
}

// customer model here
const customerModel = mongoose.model('customer',customerSchema);
const personModel = new mongoose.model('person',personSchema);
const bookModel = new mongoose.model('book',bookSchema);
const paymentModel = new mongoose.model('payment',paymentSchema)
// exporting the model

module.exports  = {customerModel , personModel, bookModel, paymentModel};


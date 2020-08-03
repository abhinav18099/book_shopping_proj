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
    },
    author:{
        type:String,
    },
    actualPrice:{
        type:Number,
        get: getPrice,
        set : setPrice,
    },
    SellingPrice:{
        type:Number,
        get: getPrice,
        set : setPrice,
    },
    ISBN:{
        type: String,
    },
    email:{
        type:String,
    },
    bookDesc:{
        type:String,
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
const bookModel = new mongoose.model('book',bookSchema)
// exporting the model

module.exports  = {customerModel , personModel, bookModel};


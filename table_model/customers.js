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


// customer model here
const customerModel = mongoose.model('customer',customerSchema);


// exporting the model

module.exports  = customerModel;


const mongoose = require('mongoose');
const {ObjectId} = require("bson");

const Schema = mongoose.Schema

const cartSchema = new Schema({
    owner:{
        type : String,
        required : true,
    },
    items: [{
        itemId : {
            type: ObjectId,
            required: true
        },
        productName :{
            type : String
        },
        quantity:{
            type : Number,
            required : true,
            min: 1,
            default: 1
        },
        price:{
            type : Number
        },
        category :{ 
            type : String,
            required : true
        },
        image1 : {
            type : String,
            required : true
        },
        orderStatus : {
            type : String,
            default : "pending"
        }
    }], address : {
        name : { type : String },
        mobile : { type : Number },
        address1 : { type : String},
        address2 : { type : String},
        city : { type : String },
        state : { type : String },
        zip : { type : Number } 

    },
     bill:{
        type : Number,
        required : true,
        default : 0
    },
}, {timestamps: true})

const Cart = mongoose.model('Cart',cartSchema);
module.exports = Cart
const mongoose = require('mongoose');
const { ObjectId } = require('bson')

const orderSchema = new mongoose.Schema({
    owner : {
      type: String,
       required: true
    },
    address : {
        name : { type : String },
        mobile : { type : Number },
        address1 : { type : String},
        address2 : { type : String},
        city : { type : String },
        state : { type : String },
        zip : { type : Number } 

    },
    items: [{
        itemId: {
            type: ObjectId,
            required: true
        },
        productName: {
            type : String
        },
        quantity: {
            type: Number,
            required: true,
            min: 1,
            default: 1
        },
        price: {
            type : Number
        },
        category : {
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
    }],
    bill: {
        type: Number,
        required: true,
        default: 0
    },
    paymentMode : {
        type : String
    },
    orderDate : {
        type : Date,
        default: Date()
    },
    couponCode :{
        type : Object
    },
    couponValue :{
        type :  Object
    },
    discountedBill :{
        type : Number
    },
    
}, {timestamps: true})


const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
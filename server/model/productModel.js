const mongoose = require('mongoose')
const Schema = mongoose.Schema

const ProductSchema = new Schema({
    productName:{
        type:String,
        required:true
    },
    actualPrice:{
        type:String,
        required:true
    },
    discountedPrice:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    stock:{
        type:Number,
        required:true
    },
    category:{
        type:String,
        required:true
    },
    subCategory:{
        type:String,
        required:true
    },
    image1:{
        type:String,
        required:true
    },
    image2:{
        type:String,
        required:true
    }
    // wishlist:{
    //     type : Boolean,
    //     required : true
    // }
},{timestamps:true})

// model to access schema
const Product = mongoose.model('Product',ProductSchema)
module.exports = Product;
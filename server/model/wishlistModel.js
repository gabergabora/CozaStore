const mongoose = require('mongoose')
const {ObjectId} = require("bson");
const Schema = mongoose.Schema

const WishlistSchema = new Schema({
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
        category :{ 
            type : String,
            required : true
        },
        image1 : {
            type : String,
            required : true
        }
    }],
}, {timestamps: true})

// model to access schema
const Wishlist = mongoose.model('Wishlist',WishlistSchema)
module.exports = Wishlist;
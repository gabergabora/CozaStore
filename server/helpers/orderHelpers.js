const Cart = require('../model/cartModel');
const Product = require("../model/productModel");
const Order = require("../model/orderModel");
const Category = require('../model/categoryModel');
const User = require("../model/userModel")
const Coupon = require("../model/couponModel")





module.exports = {
    findCart : function(userId){
        return new Promise((resolve,reject)=>{
                Cart.findOne({owner : userId})
                .then((cart)=>{
                    resolve(cart)
                }).catch((err)=>{
                    console.log(err)
                })
        })
    },
    updateStock : function(items){
        return new Promise((resolve,reject)=>{
                items.forEach((item)=>{
                    let itemQuantity = +item.quantity
                    Product.updateOne({_id : item.itemId},{$inc : {stock : -itemQuantity}})
                    .then(()=>{
                        return
                    }).catch(()=>{

                    })
                })
                resolve()
                reject(err)
        })
    },
    createOrder : function(order){
        console.log(order)
        return new Promise((resolve,reject)=>{
        new Order(order)
        .save()
        .then((order)=>{
            console.log(order)
            resolve()
        })
        .catch((err)=>{
            reject(err)
        })
    })
        
    },
    couponUpdate : function(coupon,userId){
        return new Promise((resolve,reject)=>{
        Coupon.updateOne({couponCode : coupon.couponCode || " " },{$push:{users : userId}})
        .then(()=>{
                resolve()
        })
        .catch(()=>{
            let error = new Error()
            reject(error)
        })
    })
    },
    deleteCart : function(userId){
        return new Promise((resolve,reject)=>{
        Cart.deleteOne({owner : userId})
        .then(()=>{
            resolve()
        })
        .catch((err)=>{
            reject(err)
        })
    })
    },
    findCategory : function(){
        return new Promise((resolve,reject)=>{
            Category.find()
            .then((category)=>{
                resolve(category)
            })
            .catch((err)=>{
                reject(err)
            })
        })
    }
}
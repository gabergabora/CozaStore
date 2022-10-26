const { startSession } = require("../model/userModel");
const User = require("../model/userModel")
const Admin = require("../model/adminModel")
const {ObjectId} = require("bson");
const Product = require("../model/productModel");
const Cart = require('../model/cartModel');
const Wishlist = require('../model/wishlistModel');
const Order = require("../model/orderModel")
const Category = require("../model/categoryModel")
const Coupon = require("../model/couponModel")
const CartProduct = require('../model/cart')
const otp = require('../../middleware/otp')
const Razorpay = require('razorpay');
const Paypal = require('paypal-rest-sdk')
const orderHelpers = require('../../server/helpers/orderHelpers')
const excelJs = require('exceljs');

//session handling //
let session;

//validation
let validation = {
    category : false,
    couponExist : false,
    couponApplied : false,
    couponNotExisted : false,
    couponUsed : false,
    couponMin : false
}

//user
exports.isLoggedIn = (req,res,next)=>{
    session = req.session
    if(session.userId){
        next();
    }else
    res.redirect('/user_login');
}

exports.isLoggedOut = (req,res,next)=>{
    session = req.session
    if(!session.userId){
        next();
    }else
    res.redirect('/user_home')
}

//admin

exports.adminLoggedIn = (req,res,next)=>{
    session = req.session
    if(session.adminId){
        next();
    }else
    res.redirect('/admin_login')
}

exports.adminLoggedOut = (req,res,next)=>{
    session = req.session
    if(!session.adminId){
        next();
    }else
    res.redirect('/admin_panel')
}
/////////////////////////////////

exports.isMobileFound = (req,res,next)=>{
    session=req.session
    if(session.mobileNumber){
        next();
    }else
    res.redirect('/mobile_verification')

}



exports.usersignIn = (req,res) =>{
    res.redirect('/user_login')
}


exports.userLogin = (req,res)=>{
    let response =({
        passErr : req.query.pass,
        passErrMsg : "Password Incorrect!!",
        registerErr : req.query.register,
        registerErrMsg : "User Not Found",
        blockErr : req.query.block,
        blockErrMsg :  "You were blocked by the admin"
    })
    session = req.session;
    if(session.userId){
        res.render('user/home')
    }else{
        res.render('user/login',{response})
    }
}


exports.userSignup = (req,res)=>{
    let response =({
        passErr : req.query.pass,
        passErrMsg : "Password Incorrect",
        accountErr : req.query.account,
        accountErrMsg : "User Already Exists",
        numberErr : req.query.mobile,
        numberErrMsg : "Mobile Already Exists"

    })
    res.render('user/signup',{response})
}

exports.userHome = (req, res) => {
    req.session.coupon = ""
    Product.find()
           .then((result) => {
                if(result) {
                    Cart.findOne({owner :  req.session.userId})
                    .then((cart)=>{
                        Category.find()
                        .then((category)=>{
                            if(cart){
                                res.render('user/home', { result,cart,category });
                            }else{
                                res.render('user/home', { result, cart : { items : [] },category });
                            }
                        }).catch((err)=>{
                            console.log(err);
                        })
                    }).catch((err)=>{
                        console.log(err);
                    })
                    
                }
            })
            .catch((err)=>{
                console.log(err);
            })
    }

    exports.userCategory = (req, res) => {
                        req.session.coupon = ""
                        if(req.query.id){
                            Category.findOne({_id : ObjectId(req.query.id)})
                            .then((result)=>{
                                Product.find({category : result.category})
                                .then((cat)=>{
                                // console.log(cat)
                                Category.find()
                                .then((category)=>{
                                    Cart.findOne({owner : req.session.userId})
                                    .then((cart)=>{
                                        if(cart){
                                            res.render('user/category1', { cat,category,cart });
                                        }else{
                                            res.render('user/category1', { cat,category,cart : {items : []} });
                                        }
                                    }).catch((err)=>{
                                        console.log(err);
                                    })
                                    
                                }).catch((err)=>{
                                    console.log(err);
                                })
                                
                            }).catch((err)=>{
                                console.log(err);
                            })
                            }).catch((err)=>{
                                console.log(err);
                            })
                            
                        }
                        // else if(req.query.men){
                        //     Product.find({category : 'Men'})
                        //     .then((men)=>{
                        //         console.log(men)
                        //         res.render('user/category', { women:"",men });
                        //     })
                        // }
                         
                     
                
        }

    exports.productView = (req,res)=>{
        req.session.coupon = ""
        Product.findOne({_id:ObjectId(req.query.id)})
        .then((result)=>{
             console.log(result)
            if(result){
                Category.find()
                .then((category)=>{
                    Cart.findOne({owner : req.session.userId})
                    .then((cart)=>{
                        if(cart){
                            res.render('user/productView',{result,cart,category})
                        }else{
                            res.render('user/productView',{result,cart:{items:[]},category})
                        }
                    }).catch((err)=>{
                        console.log(err);
                    })
                    // res.render('user/productView',{result,category})
                }).catch((err)=>{
                    console.log(err);
                })
            // res.render('user/productView',{result})
            }else{
                Cart.findOne({_id:ObjectId(req.query.id)})
                    .then((cart)=>{
                        console.log(result)
                        Product.findOne({productName :  cart.productName})
                        .then((result)=>{
                            Category.find()
                            .then((category)=>{
                                if(cart){
                                    res.render('user/productView',{result,cart,category})
                                }else{
                                    res.render('user/productView',{result,cart:{items:[]},category})
                                }
                                
                            }).catch((err)=>{
                                console.log(err);
                            })
                            
                        }).catch((err)=>{
                            console.log(err);
                        })
                    }).catch((err)=>{
                        console.log(err);
                    })
            }
        }).catch((err)=>{
            console.log(err)
        })
    }

    exports.myAccount =(req,res) =>{
        req.session.coupon = ""
        let userID = req.session.userId
        User.findOne({email : userID})
       .then((user)=>{
            let userAddress = user.address
            Category.find()
                      .then((category)=>{
                        Cart.findOne({owner : req.session.userId})
                        .then((cart)=>{
                            if(cart){
                                res.render('user/myAccount', { userAddress,cart,category,user })
                            }else{
                                res.render('user/myAccount', { userAddress, cart : {items : [] },category,user })
                            }
                        }).catch((err)=>{
                            console.log(err);
                        })
                          
                             }).catch((err)=>{
                                console.log(err);
                             })
        }).catch((err)=>{
            console.log(err);
        })
        
    }

    exports.cart = (req, res) => {
        req.session.coupon = ""
        Cart.findOne({owner : req.session.userId})
        .then((cart)=>{
            if(cart){
                Category.find()
                      .then((category)=>{
                        // Cart.findOne({owner : req.session.userId})
                        // .then((cart)=>{
                            res.render('user/cart',{cart,category,validation});  
                        // })
                            // res.render('user/cart',{result,category,validation});
                            // validation.couponApplied = false;
                            // validation.couponUsed = false;
                            // validation.couponNotExisted = false;
                            // validation.couponApplied = false;
                            // validation.couponMin = false;
                            // validation.couponExpiry = false;

                            
                         }).catch((err)=>{
                            console.log(err);
                         })
                
            }else
            Category.find()
                 .then((category)=>{
                    res.render('user/cart',{cart :{items:[]},category,validation});

                    //    res.render('user/cart',{result : {items : []},category,validation});
                    //    validation.couponApplied = false;
                    //    validation.couponUsed = false;
                    //    validation.couponNotExisted = false;
                    //    validation.couponApplied = false;
                    //    validation.couponMin = false;
                    //    validation.couponExpiry = false;
                       }).catch((err)=>{
                        console.log(err);
                       })
        }).catch((err)=>{
            console.llog(err);
        })
    }
    // exports.addToCart = (req, res) => {
    //     Product.findOne({ _id : req.query.id }) 
    //            .then((result) => {
    //                 if(result) {
    //                     let cartItem = new Cart({
    //                         author : req.session.userId,
    //                         productName : result.productName,
    //                         actualPrice : result.actualPrice,
    //                         discountedPrice : result.discountedPrice,
    //                         description : result.description,
    //                         stock : result.stock,
    //                         category : result.category,
    //                         subCategory : result.subCategory,
    //                         image1 : result.image1,
    //                         image2 : result.image2,
    //                         cart : true
    //                     })
    //                     cartItem.save()
    //                             .then(() => {
    //                                 if(req.query.productview){
    //                                     res.redirect(`/product-view?id=${req.query.id}`)
    //                                 }else
    //                                 res.redirect('/user_home');
    //                             })
    //                             .catch((err) => console.log(err))
    //                 }
    //            })
    // }

    exports.addToCart = (req,res)=>{

        let session = req.session
        let user = session.userId
        Cart.findOne({owner : user})
        .then((result)=>{
            if(result){
                Cart.findOne({owner : user,"items.itemId" : ObjectId(req.query.id) })
                    .then((oldCart)=>{
                        if(oldCart){
                            let cart = new CartProduct(oldCart)
                            let cartItem = cart.add(req.query.id)
                            cartItem.then((cartItem)=>{
                                let newCart = oldCart;
                                let indexOfOldItem = 0;
                                for(let i=0;i<newCart.items.length;i++){
                                    if(req.query.id.includes(newCart.items[i].itemId)){
                                        indexOfOldItem = i;
                                        break;
                                    }
                                }
                                newCart.items.splice(indexOfOldItem, 1, cartItem[0]);
                                Cart.replaceOne({owner : oldCart.owner},{
                                    owner: newCart.owner,
                                    items: newCart.items,
                                    bill : cart.bill
                                }).then(()=>{
                                    // if(req.query.women){
                                    //     res.redirect('/user-category?women=true')
                                        
                                    // }else if(req.query.men){
                                    //     res.redirect('/user-category?men=true')
                                    // }
                                    if(req.query.cat){
                                        res.redirect('/user_home')
                                    }else if(req.query.productview){
                                        res.redirect(`/product-view?id=${req.query.id}`)
                                    }
                                    else{
                                        res.redirect('/user_home')
                                    }
                                    
                                }).catch((err)=>{
                                    console.log(err);
                                })
                                   
                                    
                            })
                        }else{
                           
                            Product.findOne({_id : ObjectId(req.query.id) })
                            .then((product)=>{
                                console.log(ObjectId(req.query.id))
                                let newCartItem = {
                                    itemId : product._id,
                                    productName : product.productName,
                                    quantity : 1,
                                    price : product.discountedPrice,
                                    category : product.category,
                                    image1 : product.image1,
                                }
                                let newCart = result;
                                newCart.items.push(newCartItem)
                                totalBill = +newCart.bill + +newCartItem.price
                                newCart.bill = totalBill;
                                Cart.replaceOne({owner : user},{
                                    owner : newCart.owner,
                                    items : newCart.items,
                                    bill : newCart.bill
                                })
                                .then(()=>{
                                    if(req.query.cat){
                                        res.redirect('/user_home')
                                    }else if(req.query.productview){
                                        res.redirect(`/product-view?id=${req.query.id}`)
                                    }else{
                                        res.redirect('/user_home')
                                    }
                                    
                                }).catch((err)=>{
                                    console.log(err);
                                })
                            }).catch((err)=>{
                                console.log(err);
                            })
                        }

                    }).catch((err)=>{
                        coonsole.log(err);
                    })
            }else{
                Product.findOne({_id : ObjectId(req.query.id)})
                    .then((product)=>{
                        let cart = new Cart({
                            owner : user,
                            items:[{
                                itemId : product._id,
                                productName : product.productName,
                                quantity : 1,
                                price : product.discountedPrice,
                                category : product.category,
                                image1 : product.image1
                            }]
                        })
                        cart.bill = cart.items[0].quantity * cart.items[0].price
                        cart.save()
                        .then(()=>{
                            if(req.query.cat){
                                // Category.find()
                                //     .then((category)=>{
                                //         for(let i=0;i<category.length;i++){
                                //             res.redirect('/user-category')
                                //         }
                                        
                                //     })
                                res.redirect('/user_home')
                                      
                                    }else if(req.query.productview){
                                        res.redirect(`/product-view?id=${req.query.id}`)
                                    }else{
                                        res.redirect('/user_home')
                                    }
                            
                        }).catch((err)=>{
                            console.log(err);
                        })
                        
                    }).catch((err)=>{
                        console.log(err);
                    })
            }
        }).catch((err)=>{
            console.log(err);
        })

         
    }

    exports.checkout = (req, res) => {
        User.findOne({ email : req.session.userId })
            .then((user) => {
                Cart.findOne( { owner : req.session.userId })
                    .then((cart) => {
                        let userAddress = user.address
                        if(cart) {
                            if(user.address.length) {
                                Category.find()
                                .then((category)=>{
                                    res.render('user/checkout', { cart, userAddress,category })
                                }).catch((err)=>{
                                    console.log(err);
                                })
                                }else{
                                res.redirect('/cart/checkout/shipping/add-new-address?userAddress=false')
                            }
                        }else
                            if(user.address.length) {
                                Category.find()
                                .then((category)=>{
                                    res.render('user/checkout', { cart : { items : [] }, userAddress,category })
                                }).catch((err)=>{
                                    console.log(err);
                                })    
                            }else{
                                res.redirect('/cart/checkout/shipping/add-new-address?userAddress=false')
                            }
                    }).catch((err)=>{
                        console.log(err);
                    })
            }).catch((err)=>{
                console.log(err);
            })
    }

    exports.addAddress = (req, res) => {
        Cart.findOne({ owner : req.session.userId })
            .then((cart) => {
                let userAddress = req.query.userAddress ? true : false;
                if(cart) {
                    if(userAddress) {
                        Category.find()
                        .then((category)=>{    
                        res.render('user/addAddress1', { cart, userAddress,category })
                        }).catch((err)=>{
                            console.log(err);
                        })
                    }else{
                            Category.find()
                            .then((category)=>{
                                res.render('user/addAddress1', { cart,category })
                            }).catch((err)=>{
                                console.log(err);
                            })
                         }
                }else{
                    Category.find()
                    .then((category)=>{
                        res.render('user/addAddress1', { cart : { items : [] }, userAddress,category })
                    }).catch((err)=>{
                        console.log(err);
                    })
                    
                }
            }).catch((err)=>{
                console.log(err);
            })
    }

    exports.shipping = (req, res) => {
        if(req.body.save) {
            User.findOne({ email : req.session.userId })
                .then((user) => {
                    if(user.address) {
                        let updatedUser = user;
                        updatedUser.address.push({ 
                            name : req.body.name, 
                            mobile : req.body.mobile, 
                            address1 : req.body.address1, 
                            address2 : req.body.address2, 
                            city : req.body.city, 
                            state : req.body.state, 
                            zip : req.body.zip 
                        })
                        User.replaceOne({ email : req.session.userId }, updatedUser)
                            .then(() => {
                                res.redirect('/cart/checkout')
                            }).catch((err)=>{
                                console.log(err);
                            })
                    }else {
                        let updatedUser = user;
                        updatedUser.address = [{ 
                            name : req.body.name, 
                            mobile : req.body.mobile, 
                            address1 : req.body.address1, 
                            address2 : req.body.address2, 
                            city : req.body.city, 
                            state : req.body.state, 
                            zip : req.body.zip 
                        }]
                        User.replaceOne({ email : req.session.userId }, updatedUser)
                            .then(() => {
                                res.send("updated");
                            }).catch((err)=>{
                                console.log(err);
                            })
                    }
                    
                }).catch((err)=>{
                    console.log(err);
                })
        }else{
            let anonymousAddress = {
                name : req.body.name, 
                mobile : req.body.mobile, 
                address1 : req.body.address1, 
                address2 : req.body.address2, 
                city : req.body.city, 
                state : req.body.state, 
                zip : req.body.zip 
            }
            req.session.anonymousAddress = anonymousAddress
            res.redirect('/payment')
        }
    }

    exports.applyCoupon = (req,res) =>{
        let couponName = req.body.couponCode.toUpperCase()
        Cart.findOne({owner : req.session.userId})
        .then((cart)=>{
            Coupon.findOne({couponCode : couponName})
            .then((coupon)=>{
                            if(coupon){ 
                                 Coupon.findOne({couponCode : couponName, users : req.session.userId})
                                 .then((usedCoupon)=>{
                                     if(usedCoupon){
                                      validation.couponUsed = true;
                                         // res.redirect('/payment')
                                         res.json({})
                                     }else{
                                         if(coupon.couponExpiry >= Date.now() ){
                                             if(coupon.minBill < cart.bill ){
                                                 validation.couponApplied = true;
                                                 // res.redirect('/payment')
                                                 req.session.coupon = coupon
                                                 res.json({couponValue : coupon.couponValue});
                                             }else{
                                                 validation.couponMin = true;
                                                 res.json({});
                                               }
                                            }else{
                                                validation.couponExpiry = true;
                                                 // res.redirect('/payment')
                                                 res.json({})
                                            }
                                     }
                                    }).catch((e)=>{
                                        console.log(e);
                                     })
                                }   else{
                                                 validation.couponNotExisted = true;
                                                 // res.redirect('/payment')
                                                 res.json({})
                                         }
                                     }).catch((e)=>{
                                        console.log(e);
                                     })
                                 
                                    }).catch((err)=>{
                                        console.log(err)
                                    })
                                
                                }

    exports.paymentPage = (req, res) => {
        User.findOne({ email : req.session.userId })
            .then((user) => {
                if(req.session.anonymousAddress){
                    userAddress = req.session.anonymousAddress
                    Cart.findOne({ owner : req.session.userId })
                        .then((cart) => {
                            if(cart) {
                                Category.find()
                                .then((category)=>{
                                    res.render('user/payment', { userAddress, cart,category,validation })
                                    validation.couponApplied = false;
                                    validation.couponUsed = false;
                                    validation.couponNotExisted = false;
                                    validation.couponApplied = false;
                                    validation.couponMin = false;
                                    validation.couponExpiry = false;

                                }).catch((err)=>{
                                    console.log(err);
                                })
                            }else{
                                 Category.find()
                                 .then((category)=>{
                                    res.render('user/payment', { userAddress, cart : { items : [] },category,validation })
                                    validation.couponApplied = false;
                                    validation.couponUsed = false;
                                    validation.couponNotExisted = false;
                                    validation.couponApplied = false;
                                    validation.couponMin = false;
                                    validation.couponExpiry = false;
                                 }).catch((err)=>{
                                    console.log(err);
                                 }) 
                            }
                        }).catch((err)=>{
                            console.log(err);
                        })
                }else {
                    // userAddress = user.address[+req.query.index]
                    // Cart.findOne({ owner : req.session.userId })
                    //     .then((cart) => {
                    //         if(cart) {
                    //             Category.find()
                    //             .then((category)=>{
                    //                 res.render('user/payment', { userAddress, cart,category,validation })
                    //                 validation.couponApplied = false;
                    //                 validation.couponUsed = false;
                    //                 validation.couponNotExisted = false;
                    //                 validation.couponApplied = false;
                    //                 validation.couponMin = false;
                    //                 validation.couponExpiry = false;
                    //             }) 
                    //         }else{
                    //             Category.find()
                    //             .then((category)=>{
                    //                 res.render('user/payment', { userAddress, cart : { items : [] },category,validation })
                    //                 validation.couponApplied = false;
                    //                 validation.couponUsed = false;
                    //                 validation.couponNotExisted = false;
                    //                 validation.couponApplied = false;
                    //                 validation.couponMin = false;
                    //                 validation.couponExpiry = false;
                    //             }) 
                    //         }
                    //     })

                    userAddress = user.address[+req.query.index]
                    Cart.updateOne({owner : req.session.userId}, {$set :{address : userAddress}})
                    .then(()=>{
                        Cart.findOne({owner : req.session.userId})
                        .then((cart)=>{
                            Category.find()
                                 .then((category)=>{
                                     res.render('user/payment', { userAddress, cart,category,validation })
                                            validation.couponApplied = false;
                                            validation.couponUsed = false;
                                            validation.couponNotExisted = false;
                                            validation.couponApplied = false;
                                            validation.couponMin = false;
                                            validation.couponExpiry = false;
                            
                        }).catch((err)=>{
                            console.log(err);
                        })
                    }).catch((err)=>{
                        console.log(err);
                    })

                
                    }).catch((err)=>{
                        console.log(err);
                    })
                }
            }).catch((err)=>{
                console.log(err);
            })
        
    }

    exports.payment = (req, res) => {
        let index = +req.body.selectedAddressIndex
        // console.log(req.session.userId)
        User.findOne({email :req.session.userId})
        .then((result)=>{
            Cart.updateOne({owner : req.session.userId},{$set:{address : result.address[index]}})
            .then(()=>{
                res.redirect(`/payment?index=${req.body.selectedAddressIndex}`)
            }).catch((err)=>{
                console.log(err);
            })
           
        }).catch((err)=>{
            console.log(err);
        })
        
    }

    
        exports.userPayment = (req, res) => {
            

            function createOrder(cart){
                let newOrder = {
                    owner : cart.owner,
                    items : cart.items,
                    address : cart.address,
                    bill : cart.bill,
                    paymentMode : paymentMode,
                    orderDate : Date(),
                    discountedBill : discountedBill || cart.bill,
                    couponCode : coupon.couponCode || "",
                    couponValue : coupon.couponValue || ""
                }
                req.session.order = newOrder
            }

            const paymentMode = req.body.radios;
            const userId = req.session.userId
            const discountedBill = req.body.Bill
            const coupon = req.session.coupon || {}
            orderHelpers.findCart(userId)
            .then((cart)=>{
                if(paymentMode === "COD"){
                        createOrder(cart)
                        res.json({codSuccess : true})
                }else if(paymentMode === "paypal"){
                        createOrder(cart)
                        res.json({paypal : true})
                }else if(paymentMode === "razorpay"){
                        createOrder(cart)
                        res.redirect('/razorpay')
                }
            

            }).catch((err)=>{
                console.log(err);
            })
        }
                    
                    
            
        
       
      

    

    exports.razorpay = (req, res) => {
        const bill = Cart.findOne({ owner : req.session.userId })
                         .then((cart) => {
                            return cart.bill
             }).catch((err)=>{
                console.log(err);
             })
        bill.then((totalBill) => {
            console.log(totalBill)
            const razorpay = new Razorpay({
                key_id : `${process.env.RAZORPAY_KEY_ID}`,
                key_secret : `${process.env.RAZORPAY_KEY_SECRET}`
            })
        
            let options = {
                amount: totalBill*100,  // amount in the smallest currency unit
                currency: "INR"
              };
              
              razorpay.orders.create(options, function(err, order) {
                console.log(order);
                res.json({ razorpay : true, order });
              });
        }).catch((err)=>{
            console.log(err);
        })
    }

    exports.paypal = (req, res) => {
        let billAmount = Order.findOne({ owner : req.session.userId })
        .then((order) => {
           return order.bill;
        }).catch((err)=>{
            cnsole.log(err);
        })
        billAmount.then((bill) => {
           bill = Math.round(+bill*0.01368)
           console.log(bill);
        
        Paypal.configure({
        'mode': 'sandbox', //sandbox or live 
        'client_id': 'AQV6zayrgW7rSVC-wus80Lt_xJ813_PCs23ByGOWt8icGsbjr2OLbTzZ6pyr_EvgBspplgrI5KUbLGE2', 
        // please provide your client id here 
        'client_secret': 'EDzH1nv52EahgCoBntPidVEoXrdtVkHrwbCPXcktHvEZdrrZe4USwys_uMYJJ4Woua-c7AHXqjJeeCxB' // provide your client secret here 
        });
    
        // create payment object 
        let payment = {
        "intent": "authorize",
        "payer": {
            "payment_method": "paypal"
        },
        "redirect_urls": {
            "return_url": 'http://localhost:5050/order-success',
            "cancel_url": "http://127.0.0.1:3000/err"
        },
        "transactions": [{
            "amount": {
                "total": `${+bill}`,
                "currency": "USD"
            },
            "description": " a book on mean stack "
        }]
        }
    
        let createPay = ( payment ) => {
        return new Promise( ( resolve , reject ) => {
            Paypal.payment.create( payment , function( err , payment ) {
                if ( err ) {
                    reject(err); 
                }
            else {
                resolve(payment); 
            }
            }); 
        });
        }	
    
        // call the create Pay method 
        createPay( payment ) 
        .then( ( transaction ) => {
        console.log(transaction)
        var id = transaction.id; 
        var links = transaction.links;
        var counter = links.length; 
        while( counter -- ) {
            if ( links[counter].method == 'REDIRECT') {
                // console.log(transaction);
                // redirect to paypal where user approves the transaction 
                return res.redirect( links[counter].href )
            }
        }
        })
        .catch( ( err ) => { 
        console.log( err ); 
        res.redirect('/err');
        });
    
    
        }).catch((err)=>{
            console.log(err);
        })
    }

    // exports.orderSuccess = (req,res) => {
    //     Order.updateMany({owner : req.session.userId},{$set : {"items.$[elem].orderStatus" : "processed"}},{arrayFilters :[{"elem.orderStatus" : "none"}]})
    //     .then(()=>{
    //         Cart.deleteOne({owner : req.session.userId})
    //         .then(()=>{
    //             Order.findOne({owner : req.session.userId})
    //             .then((order)=>{
    //                 User.findOne({email : req.session.userId})
    //                 .then((user)=>{
    //                     Category.find()
    //                     .then((category)=>{
    //                         res.render('user/orderSuccess',{order,user,category})
    //                     }) 
    //                 }) 
    //             })
    //         })
    //          })
        
    // }

    exports.orderSuccess = (req,res) => {
        const order = req.session.order
        const coupon = req.session.coupon
        const userId = req.session.userId
        order.items.forEach((items)=>{
            items.orderStatus = "processed"
        })

        orderHelpers.updateStock(order.items)
        .then(()=>{
            return orderHelpers.createOrder(order)
        })
        .catch((err)=>{
            console.log(err)
        })
        .then(()=>{
            return orderHelpers.couponUpdate(coupon,userId)
        })
        .catch((err)=>{
            console.log(err)
        })
        .then(()=>{
            return orderHelpers.deleteCart(userId)
        })
        .catch((err)=>{
            console.log(err)
        })
        .then(()=>{
            return orderHelpers.findCategory()
        })
        .catch((err)=>{
            console.log(err)
        })
        .then((category)=>{
            res.render('user/orderSuccess',{category,order})
        })  
        .catch((err)=>{
            console.log(err)
        })


    }



    exports.allOrders = (req,res) =>{
        Order.find({owner : req.session.userId})
        .then((result)=>{
            Category.find()
            .then((category)=>{
                Cart.findOne({owner : req.session.userId})
                .then((cart)=>{
                    if(cart){
                        res.render('user/allOrders',{result,cart,category})
                    }else{
                        res.render('user/allOrders',{result,cart : { items : [] },category})
                    }
                    
                }).catch((err)=>{
                    console.log(err);
                })
                
            }) .catch((err)=>{
                console.log(err);
            })
        }).catch((err)=>{
            console.log(err);
        })
        
    }
    exports.userOrderStatus = (req,res) =>{
        Order.findOne({_id : req.query.id})
        .then((order)=>{
            Category.find()
            .then((category)=>{
                Cart.findOne({owner : req.session.userId})
                .then((cart)=>{
                    if((cart)){
                        res.render('user/orderStatus',{order,cart,category})
                    }else{
                        res.render('user/orderStatus',{order,cart : {items : [] },category})
                    } 
                }).catch((err)=>{
                    console.log(err);
                })
                
            }).catch((err)=>{
                console.log(err);
            })
        }).catch((err)=>{
            console.log(err);
        })
        
    }
    exports.cancelOrder = (req,res) =>{
        let orderId = req.query.orderId
        let itemId = req.query.itemId
        Order.updateOne({_id: ObjectId(orderId),"items.itemId" : itemId},{$set:{"items.$.orderStatus" : "Cancelled"}})
        .then(()=>{
            res.redirect(`/user/order-status?id=${orderId}`)
        }).catch((err)=>{
            console.log(err);
        })
    }

    

    exports.cartOperation = (req,res) => {
        Cart.findOne({owner : req.session.userId})
        .then((oldCart)=>{

            let operations = (cartItem)=>{
                let newCart = oldCart
                 
                let indexOfOldItem = 0;
                for(let i=0;i<newCart.items.length;i++){
                    if(req.query.id.includes(newCart.items[i].itemId)){
                        indexOfOldItem = i;
                        break;
                    }
                }
                if(cartItem[0].quantity > 0){
                    newCart.items.splice(indexOfOldItem,1,cartItem[0]);
                    Cart.replaceOne({owner : oldCart.owner},{
                        owner : newCart.owner,
                        items : newCart.items,
                        bill : cart.bill
                    })
                        .then(()=>{
                            res.redirect('/cart');
                        }).catch((err)=>{
                            console.log(err);
                        })
                }else{
                    newCart.items.splice(indexOfOldItem,1);
                    Cart.replaceOne({owner : oldCart.owner},{
                        owner : newCart.owner,
                        items : newCart.items,
                        bill : cart.bill
                    })
                    .then(()=>{
                        Cart.findOne({owner : oldCart.owner})
                        .then((result)=>{
                            if(result.items.length < 1){
                                Cart.deleteOne({owner : oldCart.owner})
                                .then(()=>{
                                    res.redirect('/cart')
                                }).catch((err)=>{
                                    console.log(err);
                                })
                            }else{
                                res.redirect('/cart')
                            }
                        }).catch((err)=>{
                            console.log(err);
                        })
                    }).catch((err)=>{
                        console.log(err);
                    })
                }
            }

            let cart = new CartProduct(oldCart)
            if(req.query.add){
                let cartItem = cart.add(req.query.id)
                cartItem.then((cartItem)=>{
                    operations(cartItem);
                }).catch((err)=>{
                    console.log(err);
                })
            }else{
                let cartItem = cart.subtract(req.query.id)
                cartItem.then((cartItem)=>{
                    operations(cartItem);
                }).catch((err)=>{
                    console.log(err);
                })
            }
        }).catch((err)=>{
            console.log(err);
        })
    }




    exports.deleteFromCart = (req, res) => {
        Cart.findOne({owner : req.session.userId})
        .then((result)=>{
            let indexOfOldItem = 0;
            for(let i=0;i<result.items.length;i++){
                if(req.query.id.includes(result.items[i].itemId)){
                    indexOfOldItem = i; 
                    // console.log(indexOfOldItem)
                    break;
                }
            }
            let cartBill =  +result.bill - +result.items[indexOfOldItem].price
            result.items.splice(indexOfOldItem,1);
            Cart.replaceOne({owner : result.owner},{
                owner : result.owner,
                items : result.items,
                bill : cartBill
            })
            .then(()=>{
                Cart.findOne({owner : req.session.userId})
                .then((result)=>{
                    if(result.items.length<1){
                        Cart.deleteOne({owner : req.session.userId})
                        .then(()=>{
                            res.redirect('/cart');
                        }).catch((err)=>{
                            console.log(err);
                        })
                    }else{
                        res.redirect('/cart');
                    }
                }).catch((err)=>{
                    console.log(err);
                })
            }).catch((err)=>{
                console.log(err);
            })
        }).catch((err)=>{
            console.log(err);
        })
    }



    exports.wishlist = (req, res) => {
        req.session.coupon = ""
        Wishlist.findOne({owner : req.session.userId})
        .then((result)=>{
            if(result){
                Category.find()
                .then((category)=>{
                    Cart.findOne({owner : req.session.userId})
                    .then((cart)=>{
                        if(cart){
                            res.render('user/wishlist',{result,cart,category})
                        }else{
                            res.render('user/wishlist',{result,cart :{items : []},category})
                        }

                    }).catch((err)=>{
                        console.log(er)
                    })
                    
                }) .catch((err)=>{
                    console.log(er)
                })  
             }else{
                Category.find()
                .then((category)=>{
                    Cart.findOne({owner : req.session.userId})
                    .then((cart)=>{
                        if(cart){
                            res.render('user/wishlist',{result : {items : []},cart,category})
                        }else{
                            res.render('user/wishlist',{result : {items : []},cart : {items : []}, category})
                        }
                    }).catch((err)=>{
                        console.log(er)
                    })
                    
                }).catch((err)=>{
                    console.log(er)
                })
             }
        }).catch((err)=>{
            console.log(er)
        })
    }

    exports.addToWishlist = (req,res) =>{
            let session = req.session
            let user = session.userId
            Wishlist.findOne({owner : user})
            .then((result)=>{
                // console.log(result)
                if(result){
                    Wishlist.findOne({owner : user,"items.itemId" : ObjectId(req.query.id) })
                    .then((wishlist)=>{
                        // console.log(wishlist)
                        
                        if(wishlist){
                            let  newWishlist = wishlist
                            // console.log(newWishlist)
                            let indexOfOldItem = 0;
                            for(let i=0;i<newWishlist.items.length;i++){
                                if(req.query.id.includes(newWishlist.items[i].itemId)){
                                    indexOfOldItem = i;
                                    break;
                                }
                            }
                            // console.log(indexOfOldItem)
                            newWishlist.items.splice(indexOfOldItem, 1);
                            Wishlist.updateOne({owner : user},{$set:newWishlist})
                            .then(()=>{
                                if(newWishlist.items.length<1){
                                    Wishlist.deleteOne({owner : user})
                                    .then(()=>{

                                        // else if(req.query.catwish){
                                        //     res.redirect(`/user-category?id=${req.query.id}`)
                                        // }

                                        if(req.query.wishlist){
                                            res.redirect('/user_home')
                                        }
                                        else{
                                            res.redirect('/user_home')
                                        }



                                        // Category.find()
                                        // .then((cat)=>{
                                        //     if(req.query.wishlist){
                                        //         res.redirect('/user_home')
                                        //     }
                                        //     else
                                        //      if(req.query.catwish1){
                                        //         res.redirect(`/user-category?id=${cat[0]._id}`)
                                        //     }else if(req.query.catwish2){
                                        //         res.redirect(`/user-category?id=${cat[1]._id}`)
                                        //     }else{
                                        //         res.redirect('/user_home')
                                        //     }
                                        // })
                                        
                                        
                                    }).catch((err)=>{
                                        console.log(er)
                                    })
                                }else{
                                    res.redirect('/user_home')

                                    // Category.find()
                                    // .then((cat)=>{
                                    //     if(req.query.wishlist){
                                    //         res.redirect('/user_home')
                                    //     }
                                    //     else 
                                    //     if(req.query.catwish1){
                                    //         res.redirect(`/user-category?id=${cat[0]._id}`)
                                    //     }else if(req.query.catwish2){
                                    //         res.redirect(`/user-category?id=${cat[1]._id}`)
                                    //     }else{
                                    //         res.redirect('/user_home')
                                    //     }
                                    // })



                                }
                            }).catch((err)=>{
                                console.log(er)
                            })
                        }else{
                            let newWishlist = result;
                            Product.findOne({_id : req.query.id})
                            .then((product)=>{
                                let newWishItem = {
                                    itemId : product._id,
                                    productName : product.productName,
                                    category : product.category,
                                    image1 : product.image1
                                
                                }
                                
                                    newWishlist.items.push(newWishItem)
                                    Wishlist.updateOne({owner : user},{$set:{items : newWishlist.items}})
                                    .then(()=>{
                                        res.redirect('/user_home')

                                        // Category.find()
                                        // .then((cat)=>{
                                        //     if(req.query.wishlist){
                                        //         res.redirect('/user_home')
                                        //     }
                                        //     else 
                                        //     if(req.query.catwish1){
                                        //         res.redirect(`/user-category?id=${cat[0]._id}`)
                                        //     }else if(req.query.catwish2){
                                        //         res.redirect(`/user-category?id=${cat[1]._id}`)
                                        //     }else{
                                        //         res.redirect('/user_home')
                                        //     }
                                        // })


                            }).catch((err)=>{
                                console.log(er)
                            })
                            }).catch((err)=>{
                                console.log(er)
                            })
                            
                        }
                            
                    }).catch((err)=>{
                        console.log(er)
                    })
                    
                } else{
                    Product.findOne({_id: ObjectId(req.query.id)})
                    .then((product)=>{
                     let wish = new Wishlist({
                         owner : user,
                         items :[{
                             itemId : product._id,
                             productName : product.productName,
                             category : product.category,
                             image1 : product.image1
                         }]
                     }) 
                     wish.save()
                     .then(()=>{

                        res.redirect('/user_home')

                                        // Category.find()
                                        // .then((cat)=>{
                                        //     if(req.query.wishlist){
                                        //         res.redirect('/user_home')
                                        //     }
                                        //     else
                                        //      if(req.query.catwish1 && cat[0].category==="Men"){
                                        //         res.redirect(`/user-category?id=${cat[0]._id}`)
                                        //         console.log("men")
                                        //     }else if(req.query.catwish2 && cat[1].category==="Women"){
                                        //         res.redirect(`/user-category?id=${cat[1]._id}`)
                                        //         console.log("women")
                                        //     }else{
                                        //         res.redirect('/user_home')
                                        //     }
                                        // })

                         
                     }).catch((err)=>{
                        console.log(er)
                    })
                    }).catch((err)=>{
                        console.log(er)
                    })
                    }
                }).catch((err)=>{
                    console.log(er)
                })

                // Category.find()
                // .then((cat1)=>{
                //     console.log(cat1[0]);
                // })

            }  
              
exports.deleteFromWishlist = (req,res) =>{
       Wishlist.findOne({owner : req.session.userId})
       .then((result)=>{
        console.log(result)
        let indexOfOldItem = 0;
        for(let i=0;i<result.items.length;i++){
            if(req.query.id.includes(result.items[i].itemId)){
                indexOfOldItem = i;
                break;
            }
        }
        result.items.splice(indexOfOldItem,1);
            Wishlist.replaceOne({owner : result.owner},{
                owner : result.owner,
                items : result.items,
            })
            .then(()=>{
                Wishlist.findOne({owner : req.session.userId})
                .then((result)=>{
                    if(result.items.length<1){
                        Wishlist.deleteOne({owner : req.session.userId})
                        .then(()=>{
                            res.redirect('/wishlist');
                        }).catch((err)=>{
                            console.log(er)
                        })
                    }else{
                        res.redirect('/wishlist');
                    }
                }).catch((err)=>{
                    console.log(er)
                })
            }).catch((err)=>{
                console.log(er)
            })

       }).catch((err)=>{
        console.log(er)
    })
}

exports.adminLogin = (req,res)=>{
    let response =({
        passErr : req.query.pass,
        passErrMsg : "Password Incorrect",
        registerErr : req.query.register,
        registerErrMsg : "Invalid User"
    })
    res.render('admin/login',{response})
}
exports.adminPanel = (req,res)=>{
    res.render('admin/dashboard')
}


exports.test = (req, res) => {

    const months = [
        january = [],
        february = [],
        march = [],
        april = [],
        may = [],
        june = [],
        july = [],
        august = [],
        september = [],
        october = [],
        november = [],
        december = []
    ]
    
    const quarters = [
        Q1 = [],
        Q2 = [],
        Q3 = [],
        Q4 = []
    ]

    const monthNum = [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12 ]

    Order.find({ "items.orderStatus" : "Delivered" })
        .then((orders) => {
            monthNum.forEach((month, monthIndex) => {
                orders.forEach((order, index) => {
                   if(order.orderDate.getMonth()+1 == monthIndex+1 ) {
                        months[monthIndex].push(order);
                    }
                })
            })
 
            orders.forEach((order) => {
                if(order.orderDate.getMonth()+1 <= 3){
                    quarters[0].push(order)
                }else if(order.orderDate.getMonth()+1 > 3 && order.orderDate.getMonth()+1 <= 6){
                    quarters[1].push(order)
                }else if(order.orderDate.getMonth()+1 > 6 && order.orderDate.getMonth()+1 <= 9){
                    quarters[2].push(order)
                }else if(order.orderDate.getMonth()+1 >9 && order.orderDate.getMonth()+1 <= 12){
                    quarters[3].push(order)
                }
            })
            
            const monthlySalesTurnover = [];
            const quarterlySalesTurnover = [];
            months.forEach((month) => {
                let eachMonthTurnover = month.reduce((acc, curr) => {
                    acc += +curr.discountedBill;
                    return acc;
                }, 0)
                monthlySalesTurnover.push(eachMonthTurnover);
            })

            quarters.forEach((quarter) => {
                let eachQuarterTurnover = quarter.reduce((acc, curr) => {
                   acc += +curr.discountedBill;
                    return acc;
                }, 0)
                quarterlySalesTurnover.push(eachQuarterTurnover)
            })

            let annualSales = orders.reduce((acc, curr) => {
                acc += +curr.discountedBill;
                return acc;
            }, 0)

            res.json({ salesOfTheYear : monthlySalesTurnover, quarterlySales : quarterlySalesTurnover, annualSales : annualSales })
        }).catch((err)=>{
            console.log(er)
        })
}




exports.signUp = (req,res)=>{
    if(req.body.password===req.body.confirmPassword){
        let userEmail = req.body.email
        let mobile = req.body.mobile
        User.findOne({email:userEmail})
        .then((result)=>{
        if(result){
            res.redirect('/user_signup?account=true&mobile=true')
        }
        else{
            const userData = new User(req.body)
            userData.blockStatus = false;
            console.log(userData.mobile)
        // const userData = new User({
        //     name:req.body.name,
        //     email:req.body.email,
        //     mobile:req.body.mobile,
        //     password:req.body.password,
        //     blockStatus:false
        // })

        userData.save()
        .then(()=>{
            res.redirect('/user_login')
        })
        .catch((err)=>{
            console.log(err)
            res.redirect('/user_signup')
        })
     }
    })
    .catch((err)=>{
        console.log(err);
    })
}else
    res.redirect('/user_signup?pass=false')
}

exports.mobileVerification = (req,res)=>{
    let response = ({
        blockErr:req.query.block,
        blockErrMsg:"User blocked by admin",
        mobileErr:req.query.mobile,
        mobileErrMsg:"Invalid Phone Number"
    })
    res.render('user/mobileVerification',{response})
}

exports.sendOtp = (req,res)=>{
    User.findOne({mobile:req.body.mobile})
    .then((result)=>{
        if(result){
            if(result.blockStatus){
                res.redirect('/mobile_verification?block=true')
            }
            else{
                req.session.mobileNumber = req.body.mobile
                otp.sendOtp(req.body.mobile)
                res.redirect('/mobile_verification/otp')
            }
        }else{
            res.redirect('/mobile_verification?mobile=false')
        }
    }).catch((err)=>{
        console.log(er)
    })


}

exports.verifyOtp = (req,res)=>{
    let otpObject = req.body
    otp.veriOtp(otpObject.otp,req.session.mobileNumber)
    .then((verify)=>{
        if(verify){
             User.findOne({mobile:req.session.mobileNumber})
            .then((result)=>{
                console.log(result)
                req.session.userId = result.email
                req.session.otpLogin = true
                res.redirect('/user_home')
            })
        }else{
            res.redirect('/mobile_verification/otp?otp=false')
        }
    }).catch((err)=>{
        console.log(er)
    })
   
}

exports.otpPage =(req,res)=>{
    let response = ({
        otpErr : req.query.otp,
        otpErrMsg : "Otp Verification Failed"
    })
    if(req.session.otpLogin){
        res.redirect('/user_home')
    }else
    res.render('user/verifyOtp',{response})

}

exports.addProductPage = (req,res)=>{
    Category.find()
    .then((category)=>{
        console.log(category)
        res.render('admin/addProduct',{result:"",category})
    }).catch((err)=>{
        console.log(er)
    })
    
    

}

exports.productManagement = (req,res)=>{
    Product.find()
    .then((result)=>{

        

            res.render('admin/productManagement',{result})
        
    }).catch((err)=>{
        console.log(er)
    })
}

exports.editProduct =(req,res)=>{
    let editId = req.query.id
    Product.findOne({_id:ObjectId(editId)})
        .then((result)=>{
            if(result){
                Category.find()
                .then((category)=>{
                    res.render('admin/addProduct',{result,category})
                })
                
            }
        }).catch((err)=>{
            console.log(er)
        })
}

exports.editedProduct =(req,res)=>{
    let updateId=req.query.id
    Product.updateOne({_id:ObjectId(updateId)},{$set:{
        productName : req.body.productName,
        actualPrice : req.body.actualPrice,
        discountedPrice : req.body.discountedPrice,
        description :req.body.description,  
        stock : req.body.stock,
        category : req.body.category,
        subCategory : req.body.subCategory,
        image1 : req.files[0] && req.files[0] ? req.files[0].filename : "",
        image2 : req.files[1] && req.files[1] ? req.files[1].filename : ""


    }})
    .then(()=>{
        res.redirect('/admin_panel/product-management')
    })
    .catch((err)=>{
        console.log(err)
    })
    
    
}

exports.categories = (req,res) =>{
    Category.find()
    .then((result)=>{
        console.log(result)
        if(result){
            res.render('admin/category',{result,validation})
            validation.category=false
        }else{
            res.render('admin/category',{result:"",validation})
            validation.category=false
        }
        
    }).catch((err)=>{
        console.log(err)
    })
   
}

exports.addCategory = (req,res)=>{
    let cat = req.body.category
    Category.findOne({category:cat})
    .then((result)=>{
        if(result){
            validation.category = true;
            res.redirect("/admin_panel/categories")
        }else{
            let category = new Category({
                category : cat
            })
            category.save()
            .then(()=>{
                res.redirect("/admin_panel/categories")
            })
        }
    }).catch((err)=>{
        console.log(er)
    })
    
}

exports.deleteCategory = (req,res) =>{
    let del = req.query.cat
    Category.deleteOne({category:del})
    .then(()=>{
        res.redirect("/admin_panel/categories")
    }).catch((err)=>{
        console.log(er)
    })
}

exports.adminOrders = (req,res) =>{
    Order.find()
    .then((result)=>{
        res.render('admin/orders',{result})
    }).catch((err)=>{
        console.log(er)
    })

    
}

exports.orderStatus = (req,res) =>{
    let orderId = req.query.id
    Order.findOne({_id : ObjectId(orderId)})
    .then((result)=>{
        res.render('admin/orderStatus',{result})
    }).catch((err)=>{
        console.log(er)
    })
   
}

exports.editStatus = (req,res) =>{
    let orderId = req.query.id;
    let itemId = req.query.itemId;
    if(req.query.approve){
        Order.updateOne({_id: ObjectId(orderId),"items.itemId" : itemId},{$set:{"items.$.orderStatus" : "Approved"}})
        .then(()=>{
            console.log("hi")
            res.redirect(`/admin/orders-status?id=${req.query.id}`)
        }).catch((err)=>{
            console.log(er)
        })
    }else if(req.query.deny){
        Order.updateOne({_id: ObjectId(orderId),"items.itemId" : itemId},{$set:{"items.$.orderStatus" : "Cancelled"}})
        .then(()=>{
            res.redirect(`/admin/orders-status?id=${req.query.id}`)
        }).catch((err)=>{
            console.log(er)
        })
    }else if(req.query.shipped){
        Order.updateOne({_id: ObjectId(orderId),"items.itemId" : itemId},{$set:{"items.$.orderStatus" : "Shipped"}})
        .then(()=>{
            res.redirect(`/admin/orders-status?id=${req.query.id}`)
        }).catch((err)=>{
            console.log(er)
        })
    }else if(req.query.delivered){      
        Order.updateOne({_id: ObjectId(orderId),"items.itemId" : itemId},{$set:{"items.$.orderStatus" : "Delivered"}})
        .then(()=>{
            res.redirect(`/admin/orders-status?id=${req.query.id}`)
        }).catch((err)=>{
            console.log(er)
        })
    }
}

exports.coupon = (req,res) =>{
    Coupon.find()
    .then((coupon)=>{
        Coupon.updateMany({couponExpiry : { $lt : Date.now()} },{$set :{status : "expired"}})
        .then(()=>{
            res.render('admin/coupon',{coupon,validation})
            validation.couponExist = false;
        }).catch((err)=>{
            console.log(er)
        })
    }).catch((err)=>{
        console.log(er)
    })
   
}

exports.addCoupon = (req,res) =>{
    Coupon.findOne({couponCode : req.body.couponcode})
    .then((result)=>{
        if(result){
            validation.couponExist = true;
            res.redirect('/admin/coupon')
        }else{
            let coupon = new Coupon({
                couponCode : req.body.couponcode,
                couponValue : req.body.couponvalue,
                minBill : req.body.minbill,
                couponExpiry : req.body.expirydate,
                status : "active"
            })
            coupon.save()
            .then(()=>{
                res.redirect('/admin/coupon')
            }).catch((err)=>{
                console.log(er)
            })
        }
    }).catch((err)=>{
        console.log(er)
    })
    
}

exports.deleteCoupon = (req,res) =>{
    Coupon.deleteOne({_id : ObjectId(req.query.id)})
    .then(()=>{
        res.redirect('/admin/coupon')
    }).catch((err)=>{
        console.log(er)
    })

}



exports.OrderDetails = (req,res) =>{

}

exports.exportExcel = (req,res) => {

    Order.find()
    .then((SalesReport)=>{
      
  
   console.log(SalesReport)
    try {
      const workbook = new excelJs.Workbook();
  
      const worksheet = workbook.addWorksheet("Sales Report");
  
      worksheet.columns = [
        { header: "S no.", key: "s_no" },
        { header: "OrderID", key: "_id" },
        { header: "Date", key: "orderDate" },
        { header: "Products", key: "productName" },
        { header: "Method", key: "paymentMethod" },
        // { header: "status", key: "status" },
        { header: "Amount", key: "orderBill" },
      ];
      let counter = 1;
      SalesReport.forEach((report) => {
        report.s_no = counter;
        report.productName = "";
        // report.name = report.userid;
        report.items.forEach((eachproduct) => {
          report.productName += eachproduct.productName + ", ";
        });
        worksheet.addRow(report);
        counter++;
      });
  
      worksheet.getRow(1).eachCell((cell) => {
        cell.font = { bold: true };
      });
      
  
      res.header(
        "Content-Type",
        "application/vnd.oppenxmlformats-officedocument.spreadsheatml.sheet"
      );
      res.header("Content-Disposition", "attachment; filename=report.xlsx");
  
      workbook.xlsx.write(res);
    } catch (err) {
      console.log(err.message);
    }
  }).catch((err)=>{
    console.log(er)
})

}




exports.deleteProduct = (req,res)=>{
    let deleteId = req.query.id
        Product.deleteOne({_id:ObjectId(deleteId)})
        .then(()=>{
            res.redirect('/admin_panel/product-management')
        }).catch((err)=>{
            console.log(er)
        })
}


exports.addProduct = (req,res)=>{
    const files = req.files;
    if(!files){
        const error = new Error('please choose file')
        error.httpStatusCode = 400
        return next(error)
    }
    const productDetail = new Product({
        productName : req.body.productName,
        actualPrice : req.body.actualPrice,
        discountedPrice: req.body.discountedPrice,
        description : req.body.description,
        stock : req.body.stock,
        category : req.body.category,
        subCategory : req.body.subCategory,
        image1 : req.files[0] && req.files[0] ? req.files[0].filename : "",
        image2 : req.files[1] && req.files[1] ? req.files[1].filename : ""

    })
    productDetail.save()
    .then(()=>{
        res.redirect('/admin_panel/product-management')
    })
    .catch((err)=>{
            console.log(err)
    })
    

}

exports.login=(req,res)=>{
    const loginData = req.body
    User.findOne({email: loginData.email, password: loginData.password, blockStatus:false})
    .then((result)=>{
        if(result){
            session = req.session
            session.userId = loginData.email
            // console.log(session);
            // res.render('user/home')
            res.redirect('/user_home')
        }else{
            User.findOne({email: loginData.email})
            .then((result)=>{
                if(result){
                    if(result.blockStatus){
                        res.redirect('/user_login?block=true')
                    
                    }else{
                        res.redirect('/user_login?pass=false')   
                }
            }
                else{
                    res.redirect('/user_login?register=false')
                }
            }).catch((err)=>{
                console.log(er)
            })
        }
    })
    .catch((err)=> console.log(err))
}



exports.adminSignin = (req,res)=>{
    const adminData = req.body
    Admin.findOne({username: adminData.username,password: adminData.password})
    .then((result)=>{
        if(result){
            // console.log(result)
            // res.send('admin found')
            session = req.session
            session.adminId = adminData.username
            res.redirect('/admin_panel')
        }else{
            Admin.findOne({username: adminData.username})
            .then((result)=>{
                if(result){
                    res.redirect('/admin_login?pass=false')
                }else{
                    res.redirect('/admin_login?register=false')
                }
            }).catch((err)=>{
                console.log(er)
            })
        }
    }).catch((err)=>{
        console.log(er)
    })
}

// exports.adminUsers = (req,res)=>{
//     let users = [];
//     User.find({}, (err,users) =>{
//         if(err)
//         throw err
//     })
//         users.forEach(user => {
//             users.push(user)
//         })
//         console.log(users)
//         // .then(() => {
//         //     
//         // })
//     res.render('admin/users')
// }

    exports.adminUsers = (req,res)=>{
        User.find((err,users) =>{
            if(!err){
                res.render('admin/users',{users})
            }
        
        })
    }

    exports.userBlock = (req,res)=>{
       User.updateOne({_id: ObjectId(req.query.id)},{$set:{blockStatus:true}})
       .then(()=>{
        console.log("updated")
        req.session.userId = ""
        res.redirect('/admin_users')
       }).catch((err)=>{
        console.log(er)
    })

    }
    exports.userUnblock = (req,res)=>{
        User.updateOne({_id: ObjectId(req.query.id)},{$set:{blockStatus:false}})
        .then(()=>{
            res.redirect('/admin_users')
            console.log("false")
        })
        .catch((err)=>{
            console.log(err)
        })
    }

exports.logout =(req,res)=>{
    // session=req.session
    // session.destroy();
    req.session.userId = "";
    req.session.mobileNumber='';
    req.session.otpLogin=false;
    req.session.anonymousAddress="";
    res.redirect('/user_login')
}

exports.adminLogOut = (req,res)=>{
    // session=req.session
    // session.destroy();
    req.session.adminId = ""
    res.redirect('/admin_login')
}



 

      



                            
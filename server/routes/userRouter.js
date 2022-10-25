    const express = require('express')
const services = require('../controller/render')
const fs = require('fs')
const upload = require('../../middleware/upload')
// const otp = require('../../middleware/otp')

const router = express.Router();

router.get('/user_signup', services.userSignup)
router.post('/user_signup',services.signUp)

router.get('/',services.isLoggedOut, services.usersignIn)
router.get('/user_login',services.isLoggedOut, services.userLogin)
router.post('/user_login',services.login)


router.get('/mobile_verification',services.isLoggedOut, services.mobileVerification)
router.get('/mobile_verification/otp',services.isMobileFound,services.otpPage)
router.post('/user/send-otp',services.sendOtp)
router.post('/user/verify-otp',services.verifyOtp)
router.get('/wishlist', services.isLoggedIn, services.wishlist)
router.post('/user-home/addToWishlist',services.isLoggedIn,services.addToWishlist)
router.post('/delete-from-wishlist',services.isLoggedIn,services.deleteFromWishlist)

router.get('/cart', services.isLoggedIn, services.cart)
router.get('/myAccount',services.isLoggedIn,services.myAccount)

router.get('/product-view',services.isLoggedIn, services.productView);


router.post('/user_home/addToCart', services.addToCart);

router.get('/cart/checkout',services.isLoggedIn, services.checkout);
router.get('/cart/checkout/shipping/add-new-address',services.isLoggedIn, services.addAddress);
router.post('/cart/checkout/shipping/add-new-address',services.isLoggedIn, services.shipping);
router.post('/cart/checkout/apply-coupon',services.isLoggedIn,services.applyCoupon)
router.get('/payment',services.isLoggedIn, services.paymentPage);
router.post('/payment', services.isLoggedIn,services.payment);
router.post('/userPayment',services.isLoggedIn,services.userPayment)

router.get('/razorpay', services.razorpay);
router.get('/paypal',services.paypal)

router.get('/order-success',services.isLoggedIn,services.orderSuccess)

router.get('/all-orders',services.isLoggedIn,services.allOrders)
router.get('/user/order-status',services.isLoggedIn,services.userOrderStatus)
router.post('/cancel-order',services.isLoggedIn,services.cancelOrder)

// router.post('/test', services.test)

router.post('/addToCart/cart-operation',services.isLoggedIn,services.cartOperation)
router.post('/delete-from-cart',services.isLoggedIn, services.deleteFromCart);


router.get('/user_home',services.isLoggedIn, services.userHome)
router.get('/user-category',services.isLoggedIn, services.userCategory)
router.get('/user_logout',services.logout)



module.exports = router;
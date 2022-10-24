const express = require('express')
const services = require('../controller/render')
const fs = require('fs')
const upload = require('../../middleware/upload')
const multer = require('multer')

const router = express.Router();

router.get('/admin_login',services.adminLoggedOut,services.adminLogin)
router.post('/admin_login',services.adminSignin)

router.get('/admin_panel',services.adminLoggedIn,services.adminPanel)
router.post('/test',services.test)
router.get('/admin_logout',services.adminLogOut)

router.post('/admin_panel/user/block',services.userBlock)
router.post('/admin_panel/user/unblock',services.userUnblock)

router.get('/admin_panel/add-product',services.adminLoggedIn,services.addProductPage)
router.get('/admin_panel/product-management',services.adminLoggedIn,services.productManagement)
router.post('/admin_panel/add-product',upload.any(),services.addProduct)
router.get('/admin_panel/edit-product',services.editProduct)
router.post('/admin_panel/edit-product',upload.any(),services.editedProduct)
router.get('/admin_panel/categories',services.categories)
router.post('/admin_panel/categories',services.adminLoggedIn,services.addCategory)
router.post('/admin_panel/delete-categories',services.deleteCategory)
router.get('/admin/orders',services.adminLoggedIn,services.adminOrders)
router.get('/admin/orders-status',services.adminLoggedIn,services.orderStatus)
router.post('/admin/edit-status',services.adminLoggedIn,services.editStatus)

router.get('/admin/coupon',services.adminLoggedIn,services.coupon)
router.post('/admin/addCoupon',services.adminLoggedIn,services.addCoupon)
router.post('/admin/deleteCoupon',services.adminLoggedIn,services.deleteCoupon)


router.get('/admin/exportExcel',services.adminLoggedIn,services.exportExcel)

router.get('/admin_panel/delete-product',services.deleteProduct)

router.get('/admin_logout',services.adminLogOut)

router.get('/admin_users',services.adminLoggedIn,services.adminUsers)
router.get('/admin_logout',services.adminLogOut)
module.exports = router;
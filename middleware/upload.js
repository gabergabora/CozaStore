const path = require('path')
const multer = require('multer')

let storage = multer.diskStorage({
    destination: (req,file,cb)=>{
        cb(null,'public/images')
    },
    filename: (req,file,cb)=>{
        let ext = path.extname(file.originalname)
        cb(null, file.fieldname + '-' + Date.now() + ext)
    }
})

let upload = multer({
    storage: storage,
    // fileFilter : (req,file,callback)=>{
    //     if(
    //         file.mimetype == "image/png" ||
    //         file.mimetype == "image/jpg"
    //     ){
    //         callback(null,true)
    //     }else{
    //         console.log('only jpg and png supported')
    //         callback(null,false)
    //     }
    // }
})

module.exports = upload
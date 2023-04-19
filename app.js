const express = require('express')
const mongoose = require('mongoose')
const dotenv = require('dotenv')
const sessions = require('express-session')
const db = require('./server/database/connection')
const userRouter = require('./server/routes/userRouter')
const adminRouter = require('./server/routes/adminRouter')



//app init & middleware
const app = express()
app.use(express.static('public'))
app.use(express.static('uploads'))
// app.use(express.static('images1'))
app.use(express.urlencoded({extended:false}))
app.use(sessions({
    secret: "verygoodpassword",
    resave : false,.         
    saveUninitialized : true,
    cookie : {maxAge: 600000}
}))

app.use(function(req, res, next) {
    res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
      next();
    });

dotenv.config({path:"config.env"})
const PORT = process.env.PORT || 8080



//setting view engine
app.set('view engine','ejs')
cb = (err)=>{
    if(!err)
    {
        app.listen(PORT,()=>{
            console.log(`Server listening ${PORT}`)
        })
    }
    
    
}
db.connectToDb(cb)


app.use(userRouter)
app.use(adminRouter)

app.use(function(req,res){
    res.status(404).render('user/404.ejs');
});

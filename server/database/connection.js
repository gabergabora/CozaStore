const mongoose = require('mongoose')

module.exports = {
    connectToDb: (cb)=>{
        mongoose.connect(process.env.MONGO_URI)
        .then(()=>{
            console.log('Database is connected')
            return cb()
        })
        .catch((err)=>{
            console.log(err)
            return cb(err)

        })
    }
}
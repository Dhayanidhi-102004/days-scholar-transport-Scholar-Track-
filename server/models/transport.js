const mongoose = require("mongoose");

const StudentSchema = new mongoose.Schema({
    //_id: { type: mongoose.Schema.Types.ObjectId, auto: true },
    name:String,
    rollno:String,
    degree:String,
    dept:String,
    year:String,
    gender:String,
    email:String,
    dob:String,
    address:String,
    phoneno:Number,
    parentno:Number
})

const StudentModel = mongoose.model("Student",StudentSchema)
module.exports=StudentModel
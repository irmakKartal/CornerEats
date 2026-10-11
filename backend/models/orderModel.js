import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    userId: {type:String,required:true},
    items: { type: Array, required:true},
    amount: { type: Number, required: true},
    currency: { type: String, required: true, default: 'USD' },
    amountInMinorUnits: { type: Number, required: true, default: 0 },
    address:{type:Object,required:true},
    status: {type:String,default:"Pending"},
    date: {type:Date,default:Date.now},
    payment:{type:Boolean,default:false},
    discountPercent:{type:Number,default:0}
})

const orderModel = mongoose.models.order || mongoose.model("order", orderSchema);
export default orderModel;
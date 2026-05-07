import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({

  orderId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Order"
  },

  userId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"User"
  },

  amount:{
    type:Number
  },

  paymentMethod:{
    type:String
  },

  paymentStatus:{
    type:String,
    default:"Pending"
  },

  razorpayOrderId:{
    type:String
  },

  razorpayPaymentId:{
    type:String
  },

  razorpaySignature:{
    type:String
  }

},{timestamps:true});

const paymentModel = mongoose.model("Payment", paymentSchema);

export default paymentModel;

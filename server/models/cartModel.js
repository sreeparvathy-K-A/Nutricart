import mongoose from "mongoose";

const cartSchema = new mongoose.Schema({

  userId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"User"
  },

  foodId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Food"
  },

  quantity:{
    type:Number,
    default:1
  }

},{timestamps:true});

const cartModel = mongoose.model("Cart", cartSchema);

export default cartModel;